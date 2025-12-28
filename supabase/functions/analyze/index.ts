import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_PROMPT = `Eres un experto en análisis de comunicación y marketing. Analiza la siguiente transcripción utilizando dos frameworks principales:

## FRAMEWORK 1: Las 5 Etapas de Consciencia del Cliente

IMPORTANTE: Clasifica según lo que REALMENTE aparece en el contenido:

1. **Inconsciente (Nivel 1)**: El contenido despierta curiosidad sobre un problema que el receptor NO sabía que tenía. No menciona soluciones específicas.
2. **Consciente del Problema (Nivel 2)**: El contenido habla del problema pero NO presenta una solución clara. El receptor entiende que tiene un problema.
3. **Consciente de la Solución (Nivel 3)**: El contenido presenta UNA SOLUCIÓN o método pero NO menciona un producto/servicio específico para comprar. Enseña "cómo" hacer algo.
4. **Consciente del Producto (Nivel 4)**: El contenido menciona EXPLÍCITAMENTE un producto, servicio, curso o oferta específica. Hay una invitación a conocer/comprar algo concreto.
5. **Totalmente Consciente (Nivel 5)**: El contenido incluye una OFERTA DIRECTA con precio, descuento, urgencia o garantía. El receptor solo necesita decidir comprar.

REGLA CRÍTICA: Si NO hay mención explícita de un producto/servicio/oferta para comprar, NO puede ser nivel 4 o 5. Si solo enseña un método o tip, es nivel 3 (Consciente de la Solución).

## FRAMEWORK 2: Los 4 Personajes del Cerebro (Las 4 P)

Cada comunicación tiene DOS personajes en juego:
- **EMISOR (P del comunicador)**: Qué personalidad proyecta quien habla
- **RECEPTOR (P objetivo)**: A qué personalidad intenta persuadir

1. **El Triunfador**: Busca éxito, reconocimiento y estatus. Responde a: logros, exclusividad, ser el mejor.
2. **El Explorador**: Busca novedad, aventura y libertad. Responde a: descubrimiento, cambio, experiencias únicas.
3. **El Controlador**: Busca seguridad, orden y certeza. Responde a: datos, garantías, procesos claros.
4. **El Protector**: Busca conexión, pertenencia y cuidar a otros. Responde a: comunidad, familia, impacto social.

## INSTRUCCIONES DE ANÁLISIS

Analiza la transcripción y responde en formato JSON con esta estructura exacta:
{
  "etapa_consciencia": {
    "nivel": [1-5],
    "nombre": "[nombre de la etapa]",
    "descripcion": "[explicación de por qué está en esta etapa, citando evidencia del texto]"
  },
  "comunicador": {
    "personaje_dominante": "[Triunfador/Explorador/Controlador/Protector]",
    "caracteristicas": ["característica 1", "característica 2", "característica 3"]
  },
  "receptor": {
    "personaje_objetivo": "[Triunfador/Explorador/Controlador/Protector]",
    "estrategia": "[cómo el mensaje intenta conectar con este personaje]"
  },
  "estructura": {
    "hook": {
      "texto_resumen": "[resumen del hook]",
      "emisor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "emisor_porque": "[por qué el emisor proyecta esta P en el hook]",
      "receptor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "receptor_porque": "[por qué apela a esta P del receptor]"
    },
    "cuerpo": {
      "texto_resumen": "[resumen del cuerpo]",
      "emisor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "emisor_porque": "[por qué el emisor proyecta esta P en el cuerpo]",
      "receptor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "receptor_porque": "[por qué apela a esta P del receptor]"
    },
    "cta": {
      "texto_resumen": "[resumen del CTA]",
      "emisor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "emisor_porque": "[por qué el emisor proyecta esta P en el CTA]",
      "receptor_p": "[Triunfador/Explorador/Controlador/Protector]",
      "receptor_porque": "[por qué apela a esta P del receptor]"
    }
  },
  "recomendaciones": [
    "recomendación 1 para mejorar",
    "recomendación 2 para mejorar",
    "recomendación 3 para mejorar"
  ]
}

TRANSCRIPCIÓN A ANALIZAR:
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { transcriptionId, transcript } = await req.json();

    if (!transcriptionId || !transcript) {
      return new Response(
        JSON.stringify({ error: "Missing transcriptionId or transcript" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's AI provider settings
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id);

    if (apiKeysError) {
      console.error("Error fetching API keys:", apiKeysError);
      return new Response(
        JSON.stringify({ error: "Error fetching API configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find provider and API key - match the key names from Settings page
    const providerSetting = apiKeys?.find(k => k.key_name === "ANALYSIS_PROVIDER");
    const provider = providerSetting?.key_value || "gemini";
    
    console.log("Provider selected:", provider);
    console.log("Available keys:", apiKeys?.map(k => k.key_name));
    
    const apiKeyRecord = apiKeys?.find(k => 
      k.key_name === (provider === "gemini" ? "GEMINI_API_KEY" : "CLAUDE_API_KEY")
    );

    if (!apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: `API key for ${provider === "gemini" ? "Gemini" : "Claude"} not configured. Go to Settings to add it.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = apiKeyRecord.key_value;
    let analysis;

    if (provider === "gemini") {
      // Call Gemini API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: MASTER_PROMPT + transcript }]
            }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      const geminiData = await geminiResponse.json();
      
      if (!geminiResponse.ok) {
        console.error("Gemini API error:", geminiData);
        return new Response(
          JSON.stringify({ error: geminiData.error?.message || "Gemini API error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        return new Response(
          JSON.stringify({ error: "No response from Gemini" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not parse Gemini response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

    } else if (provider === "claude") {
      // Call Claude API
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: MASTER_PROMPT + transcript
          }]
        })
      });

      const claudeData = await claudeResponse.json();
      
      if (!claudeResponse.ok) {
        console.error("Claude API error:", claudeData);
        return new Response(
          JSON.stringify({ error: claudeData.error?.message || "Claude API error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const responseText = claudeData.content?.[0]?.text;
      if (!responseText) {
        return new Response(
          JSON.stringify({ error: "No response from Claude" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not parse Claude response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Save analysis to database
    const { error: updateError } = await supabase
      .from("transcriptions")
      .update({ analysis })
      .eq("id", transcriptionId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error saving analysis:", updateError);
      return new Response(
        JSON.stringify({ error: "Error saving analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Analyze function error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
