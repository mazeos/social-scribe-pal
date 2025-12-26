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

async function extractAudioUrl(videoUrl: string, platform: string): Promise<{ url: string; filename: string } | null> {
  console.log('Extracting audio from:', videoUrl, 'platform:', platform);
  
  // Try cobalt v10 instances
  const cobaltInstances = [
    'https://api.cobalt.best',
    'https://cobalt-api.kwiatekmiki.com',
  ];

  for (const instance of cobaltInstances) {
    try {
      console.log(`Trying cobalt v10 instance: ${instance}`);
      
      const cobaltResponse = await fetch(instance, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          downloadMode: 'audio',
          audioFormat: 'mp3',
        }),
      });

      const responseText = await cobaltResponse.text();
      console.log(`Response from ${instance}:`, responseText.substring(0, 500));

      if (!cobaltResponse.ok) {
        console.error(`API error from ${instance}:`, cobaltResponse.status);
        continue;
      }

      const data = JSON.parse(responseText);

      if (data.url) {
        return { url: data.url, filename: 'audio.mp3' };
      }
      if (data.status === 'tunnel' || data.status === 'redirect' || data.status === 'stream') {
        return { url: data.url, filename: 'audio.mp3' };
      }
      if (data.audio) {
        return { url: data.audio, filename: 'audio.mp3' };
      }
      
      console.log('Unexpected response format from', instance);
    } catch (err) {
      console.error(`Error with ${instance}:`, err);
    }
  }

  // Fallback for YouTube: use ytdl-core style extraction
  if (platform === 'youtube') {
    console.log('Trying YouTube fallback extraction...');
    return await extractYouTubeAudioFallback(videoUrl);
  }

  console.error('All extraction methods failed');
  return null;
}

async function extractYouTubeAudioFallback(videoUrl: string): Promise<{ url: string; filename: string } | null> {
  try {
    // Extract video ID
    let videoId = '';
    if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (videoUrl.includes('v=')) {
      const urlObj = new URL(videoUrl);
      videoId = urlObj.searchParams.get('v') || '';
    }
    
    if (!videoId) {
      console.error('Could not extract YouTube video ID');
      return null;
    }

    console.log('Extracted video ID:', videoId);

    // Try YouTube oEmbed to verify video exists
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const oembedRes = await fetch(oembedUrl);
    
    if (!oembedRes.ok) {
      console.error('Video not found or not public');
      return null;
    }

    // Use alternative services
    const services = [
      `https://api.vevioz.com/api/button/mp3/${videoId}`,
    ];

    for (const serviceUrl of services) {
      try {
        console.log('Trying service:', serviceUrl);
        const response = await fetch(serviceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          const html = await response.text();
          // Look for download links in the response
          const downloadMatch = html.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/);
          if (downloadMatch && downloadMatch[1]) {
            console.log('Found MP3 link:', downloadMatch[1]);
            return { url: downloadMatch[1], filename: 'audio.mp3' };
          }
        }
      } catch (err) {
        console.error('Service error:', err);
      }
    }

    return null;
  } catch (error) {
    console.error('YouTube extraction error:', error);
    return null;
  }
}

async function downloadAudio(audioUrl: string): Promise<Uint8Array | null> {
  console.log('Downloading audio from:', audioUrl);
  
  try {
    const response = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('Failed to download audio:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('Downloaded audio size:', arrayBuffer.byteLength);
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error downloading audio:', error);
    return null;
  }
}

async function transcribeWithWhisper(audioData: Uint8Array, openaiKey: string): Promise<string | null> {
  console.log('Transcribing with Whisper...');
  
  try {
    const formData = new FormData();
    const blob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', response.status, errorText);
      return null;
    }

    const transcript = await response.text();
    console.log('Transcription complete, length:', transcript.length);
    return transcript;
  } catch (error) {
    console.error('Error transcribing:', error);
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
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
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

    const audioInfo = await extractAudioUrl(url, platform);
    if (!audioInfo) {
      throw new Error(`No se pudo extraer el audio del video de ${platform}. Verifica que la URL sea válida y el video sea público. Las APIs de extracción gratuitas tienen limitaciones - considera usar la opción de subir archivo.`);
    }

    const audioData = await downloadAudio(audioInfo.url);
    if (!audioData) {
      throw new Error('No se pudo descargar el audio. El video puede tener restricciones.');
    }

    const transcript = await transcribeWithWhisper(audioData, openaiKey);
    if (!transcript) {
      throw new Error('Error al transcribir el audio. Intenta de nuevo.');
    }

    const finalTitle = title || `Transcripción ${platform} - ${new Date().toLocaleDateString('es')}`;
    
    const { data: transcription, error: insertError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: user.id,
        title: finalTitle,
        url: url,
        platform: platform,
        transcript: transcript,
        language: 'auto',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Error al guardar la transcripción');
    }

    console.log('Transcription saved successfully');

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
