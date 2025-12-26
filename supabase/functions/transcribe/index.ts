import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  return 'unknown';
}

function extractVideoId(url: string, platform: string): string | null {
  try {
    if (platform === 'youtube') {
      const urlObj = new URL(url);
      if (url.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { url, title } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      throw new Error('Unsupported platform. Please use YouTube, TikTok, or Instagram URLs.');
    }

    console.log(`Processing ${platform} video: ${url}`);

    // For YouTube, we can use a transcript extraction approach
    // For TikTok/Instagram, we'll need to explain limitations
    
    let transcript = '';
    let detectedLanguage = 'unknown';

    if (platform === 'youtube') {
      const videoId = extractVideoId(url, platform);
      if (!videoId) {
        throw new Error('Could not extract YouTube video ID');
      }

      // Try to get YouTube transcript using the innertube API
      try {
        const transcriptResponse = await fetch(
          `https://www.youtube.com/watch?v=${videoId}`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );
        
        const html = await transcriptResponse.text();
        
        // Extract captions data from the page
        const captionsMatch = html.match(/"captions":\s*({[^}]+})/);
        
        if (captionsMatch) {
          // Use AI to generate a helpful message about the video
          const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
          
          if (LOVABLE_API_KEY) {
            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a helpful assistant that explains video transcription limitations. Be concise and helpful.'
                  },
                  {
                    role: 'user',
                    content: `The user wants to transcribe a ${platform} video from URL: ${url}. Due to platform restrictions, direct audio extraction is not possible without additional infrastructure. Please provide a brief explanation of what would be needed to fully implement this feature, and suggest that the user could manually paste the transcript or use external tools to extract it first.`
                  }
                ],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              transcript = aiData.choices?.[0]?.message?.content || 
                'Para transcribir videos de esta plataforma, necesitarás extraer el audio manualmente o usar herramientas externas. Puedes copiar y pegar el contenido de los subtítulos automáticos de YouTube.';
              detectedLanguage = 'es';
            }
          }
        }
        
        // If we couldn't get captions, provide instructions
        if (!transcript) {
          transcript = `📹 Video de YouTube detectado (ID: ${videoId})\n\n` +
            `Para obtener la transcripción de este video:\n\n` +
            `1. Abre el video en YouTube\n` +
            `2. Haz clic en los tres puntos (...) debajo del video\n` +
            `3. Selecciona "Mostrar transcripción"\n` +
            `4. Copia el texto y pégalo aquí\n\n` +
            `Nota: La transcripción automática completa requiere acceso a APIs de pago de terceros para extraer audio.`;
          detectedLanguage = 'es';
        }
      } catch (ytError) {
        console.error('YouTube processing error:', ytError);
        transcript = `No se pudo procesar el video de YouTube. Por favor, verifica que la URL sea correcta y el video sea público.`;
        detectedLanguage = 'es';
      }
    } else {
      // For TikTok and Instagram
      transcript = `📱 Video de ${platform.charAt(0).toUpperCase() + platform.slice(1)} detectado\n\n` +
        `Debido a las restricciones de ${platform}, la transcripción automática directa no está disponible.\n\n` +
        `Opciones alternativas:\n` +
        `1. Descarga el video usando herramientas externas\n` +
        `2. Sube el archivo de audio a un servicio de transcripción\n` +
        `3. Usa la transcripción manual si el video tiene subtítulos\n\n` +
        `Nota: Para una solución completa, se requeriría integración con APIs de pago especializadas.`;
      detectedLanguage = 'es';
    }

    // Save to database
    const finalTitle = title || `Transcripción ${platform} - ${new Date().toLocaleDateString('es')}`;
    
    const { data: transcription, error: insertError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: user.id,
        title: finalTitle,
        url: url,
        platform: platform,
        transcript: transcript,
        language: detectedLanguage,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save transcription');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcription,
        message: 'Transcripción procesada'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transcribe error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
