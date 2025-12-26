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

async function extractAudioUrl(videoUrl: string): Promise<{ url: string; filename: string } | null> {
  console.log('Extracting audio from:', videoUrl);
  
  // Try multiple cobalt instances for reliability
  const cobaltInstances = [
    'https://api.cobalt.tools',
    'https://cobalt-api.hyper.lol',
    'https://co.wuk.sh',
  ];

  for (const instance of cobaltInstances) {
    try {
      console.log(`Trying cobalt instance: ${instance}`);
      
      const cobaltResponse = await fetch(`${instance}/api/json`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          url: videoUrl,
          vCodec: 'h264',
          vQuality: '720',
          aFormat: 'mp3',
          isAudioOnly: true,
          filenamePattern: 'basic',
          dubLang: false,
        }),
      });

      const responseText = await cobaltResponse.text();
      console.log(`Cobalt response from ${instance}:`, responseText.substring(0, 500));

      if (!cobaltResponse.ok) {
        console.error(`Cobalt API error from ${instance}:`, cobaltResponse.status);
        continue;
      }

      const cobaltData = JSON.parse(responseText);

      // Handle different response formats
      if (cobaltData.url) {
        return {
          url: cobaltData.url,
          filename: cobaltData.filename || 'audio.mp3',
        };
      }

      if (cobaltData.status === 'stream' || cobaltData.status === 'redirect') {
        return {
          url: cobaltData.url,
          filename: cobaltData.filename || 'audio.mp3',
        };
      }

      if (cobaltData.status === 'picker' && cobaltData.picker?.length > 0) {
        const audioOption = cobaltData.picker.find((p: any) => p.type === 'audio') || cobaltData.picker[0];
        return {
          url: audioOption.url,
          filename: 'audio.mp3',
        };
      }

      // New API format
      if (cobaltData.audio) {
        return {
          url: cobaltData.audio,
          filename: 'audio.mp3',
        };
      }

      console.log(`Unexpected response format from ${instance}`);
    } catch (error) {
      console.error(`Error with ${instance}:`, error);
    }
  }

  console.error('All cobalt instances failed');
  return null;
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
    // Create form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Support Spanish and English
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

    // Step 1: Extract audio URL from video
    const audioInfo = await extractAudioUrl(url);
    if (!audioInfo) {
      throw new Error(`No se pudo extraer el audio del video de ${platform}. Verifica que la URL sea válida y el video sea público.`);
    }

    // Step 2: Download the audio file
    const audioData = await downloadAudio(audioInfo.url);
    if (!audioData) {
      throw new Error('No se pudo descargar el audio. El video puede tener restricciones.');
    }

    // Step 3: Transcribe with Whisper
    const transcript = await transcribeWithWhisper(audioData, openaiKey);
    if (!transcript) {
      throw new Error('Error al transcribir el audio. Intenta de nuevo.');
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
        language: 'es',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save transcription');
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
