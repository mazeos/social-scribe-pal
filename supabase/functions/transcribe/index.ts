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

async function transcribeWithSupadata(videoUrl: string, supadataKey: string): Promise<{ text: string; lang: string } | null> {
  console.log('Transcribing with Supadata:', videoUrl);
  
  try {
    // Build URL with query parameters (Supadata uses GET, not POST)
    const encodedUrl = encodeURIComponent(videoUrl);
    const apiUrl = `https://api.supadata.ai/v1/transcript?url=${encodedUrl}&text=true&mode=auto`;
    
    console.log('Calling Supadata API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': supadataKey,
      },
    });

    const responseText = await response.text();
    console.log('Supadata response status:', response.status);
    console.log('Supadata response:', responseText.substring(0, 500));

    // Handle async processing (202 response)
    if (response.status === 202) {
      const jobData = JSON.parse(responseText);
      if (jobData.jobId) {
        console.log('Job started, polling for result:', jobData.jobId);
        return await pollForResult(jobData.jobId, supadataKey);
      }
    }

    if (!response.ok) {
      console.error('Supadata API error:', response.status, responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    
    // Handle text=true response format
    if (data.content) {
      return { 
        text: data.content, 
        lang: data.lang || 'auto' 
      };
    }
    
    // Handle chunks format (text=false)
    if (data.chunks && Array.isArray(data.chunks)) {
      const combinedText = data.chunks.map((c: any) => c.text || c.content).join(' ');
      return { 
        text: combinedText, 
        lang: data.lang || 'auto' 
      };
    }

    console.error('Unexpected Supadata response format:', data);
    return null;
  } catch (error) {
    console.error('Supadata error:', error);
    return null;
  }
}

async function pollForResult(jobId: string, supadataKey: string, maxAttempts = 30): Promise<{ text: string; lang: string } | null> {
  const pollUrl = `https://api.supadata.ai/v1/transcript/${jobId}`;
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Polling attempt ${i + 1}/${maxAttempts}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
    
    const response = await fetch(pollUrl, {
      method: 'GET',
      headers: {
        'x-api-key': supadataKey,
      },
    });

    if (response.status === 202) {
      // Still processing
      continue;
    }

    if (response.ok) {
      const data = await response.json();
      if (data.content) {
        return { text: data.content, lang: data.lang || 'auto' };
      }
      if (data.chunks && Array.isArray(data.chunks)) {
        const combinedText = data.chunks.map((c: any) => c.text || c.content).join(' ');
        return { text: combinedText, lang: data.lang || 'auto' };
      }
    }

    if (!response.ok && response.status !== 202) {
      console.error('Poll error:', response.status);
      return null;
    }
  }

  console.error('Polling timeout');
  return null;
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
    const supadataKey = Deno.env.get('SUPADATA_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!supadataKey) {
      throw new Error('SUPADATA_API_KEY not configured. Por favor configura tu API key de Supadata.');
    }

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
      throw new Error('Plataforma no soportada. Usa URLs de YouTube, TikTok o Instagram.');
    }

    console.log(`Processing ${platform} video: ${url}`);

    // Use Supadata to transcribe directly from URL
    const result = await transcribeWithSupadata(url, supadataKey);
    
    if (!result || !result.text) {
      throw new Error(`No se pudo transcribir el video de ${platform}. Verifica que la URL sea válida, el video sea público y tenga audio.`);
    }

    const finalTitle = title || `Transcripción ${platform} - ${new Date().toLocaleDateString('es')}`;
    
    const { data: transcription, error: insertError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: user.id,
        title: finalTitle,
        url: url,
        platform: platform,
        transcript: result.text,
        language: result.lang,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Error al guardar la transcripción');
    }

    console.log('Transcription saved successfully, length:', result.text.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcription,
        message: 'Transcripción completada'
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
