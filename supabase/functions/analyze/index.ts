import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_PROMPT = `# SISTEMA DE ANÁLISIS ESTRUCTURAL DE CONTENIDO VERBAL

## ROL

Eres un analista de comunicación especializado en psicología de audiencias. Tu trabajo es deconstruir contenido viral para identificar los mecanismos psicológicos que lo hacen efectivo, permitiendo replicar la ESTRUCTURA sin copiar el contenido.

---

## FRAMEWORKS DE ANÁLISIS

### FRAMEWORK 1: NIVELES DE CONSCIENCIA DEL ESPECTADOR

| Nivel | Definición | Señales en el contenido |
|-------|-----------|------------------------|
| **UNAWARE** | No sabe que tiene un problema | Ataca un "enemigo común", genera indignación, revela algo oculto |
| **PROBLEM AWARE** | Sabe el problema, no la solución | Describe el dolor en sus palabras, amplifica consecuencias, valida |
| **SOLUTION AWARE** | Sabe que hay soluciones, compara | Analiza opciones, pros/contras, posiciona categoría de solución |
| **PRODUCT AWARE** | Evalúa productos específicos | Casos de éxito, testimonios, demostraciones, ofertas |
| **MOST AWARE** | Decidió, necesita empujón final | Rebate objeciones, urgencia, elimina fricción |

### FRAMEWORK 2: LOS 4 PERSONAJES DEL CEREBRO

| Código | Nombre | Características | Activadores verbales |
|--------|--------|-----------------|---------------------|
| **P1** | Analítico | Lógico, datos, paso a paso, estructura | Números, listas, "funciona así", procesos, frameworks |
| **P2** | Protector | Reactivo, dolor, miedo, injusticia, trauma | Amenazas, "lo que sale mal", validación de heridas, enemigos |
| **P3** | Experiencial | Presente, juguetón, sorpresa, curiosidad | Wow, humor, novedad, cambios de ritmo, contradicciones |
| **P4** | Sabio | Perspectiva amplia, significado, verdad profunda | Propósito, "la realidad es", paz, conexión, trascendencia |

### REGLAS DE INTERACCIÓN

- P1→P1: Transferencia de información estructurada
- P2→P2: Tribu por dolor/enemigo compartido
- P3→P3: Contagio emocional, viralidad por entretenimiento
- P4→P4: Conexión profunda, "se siente verdadero"
- P3/P4 activo inhibe P1/P2 del receptor (calma mente analítica y miedo)
- P1/P2 activo inhibe P3/P4 del receptor (genera tensión, urgencia)

---

## INSTRUCCIONES

Analiza la transcripción proporcionada y responde **ÚNICAMENTE con un JSON válido** (sin texto adicional antes o después) con esta estructura exacta:

{
  "metadata": {
    "creador": "[nombre si se identifica o 'No identificado']",
    "plataforma": "[TikTok/Reels/Shorts/formato corto]",
    "duracion_aproximada": "[estimación en segundos]"
  },
  "nivel_consciencia": {
    "nivel": "[UNAWARE / PROBLEM AWARE / SOLUTION AWARE / PRODUCT AWARE / MOST AWARE - puede ser transición como 'PROBLEM AWARE → SOLUTION AWARE']",
    "justificacion": "[Explicación detallada con citas textuales exactas del contenido que demuestran este nivel. Explica qué valida, qué amplifica, qué posiciona.]"
  },
  "hook": {
    "transcripcion_exacta": "[Las primeras 1-2 oraciones textuales del contenido]",
    "personalidades": [
      {
        "rol": "Creador",
        "personaje": "[P1/P2/P3/P4]",
        "nombre": "[Analítico/Protector/Experiencial/Sabio]",
        "justificacion": "[Qué palabras específicas, tono o estructura revelan este personaje]"
      },
      {
        "rol": "Receptor",
        "personaje": "[P1/P2/P3/P4 - puede ser combinación como 'P3+P1']",
        "nombre": "[nombres de los personajes]",
        "justificacion": "[Qué personaje se activa en quien escucha y por qué]"
      }
    ],
    "mecanismo_retencion": [
      "[Punto 1: ¿Por qué alguien NO haría scroll?]",
      "[Punto 2: Otro mecanismo de retención]",
      "[Punto 3: Otro mecanismo si aplica]"
    ]
  },
  "body": {
    "estructura_identificada": "[Descripción de la estructura en formato: ELEMENTO 1 → ELEMENTO 2 → ELEMENTO 3]",
    "personalidades": [
      {
        "rol": "Creador",
        "personaje": "[Secuencia completa, ej: 'P4→P2→P4→P1']",
        "justificacion": "[Por qué esta secuencia de transiciones]"
      },
      {
        "rol": "Receptor",
        "personaje": "[Secuencia completa, ej: 'P3→P2→P4→P1']",
        "justificacion": "[Qué experimenta el receptor en cada transición]"
      }
    ],
    "transiciones": [
      {
        "cita": "[Frase exacta del contenido que marca la transición]",
        "creador_p": "[P1/P2/P3/P4]",
        "creador_porque": "[Por qué el creador usa este personaje aquí]",
        "receptor_p": "[P1/P2/P3/P4]",
        "receptor_porque": "[Qué efecto tiene en el receptor]"
      }
    ]
  },
  "cta": {
    "transcripcion_exacta": "[Las últimas oraciones / cierre del contenido]",
    "personalidades": [
      {
        "rol": "Creador",
        "personaje": "[P1/P2/P3/P4]",
        "nombre": "[Analítico/Protector/Experiencial/Sabio]",
        "justificacion": "[Qué palabras o tono revelan este personaje en el cierre]"
      },
      {
        "rol": "Receptor",
        "personaje": "[P1/P2/P3/P4]",
        "nombre": "[nombre del personaje]",
        "justificacion": "[Qué experimenta el receptor al final]"
      }
    ],
    "tipo_cta": "[Engagement / Follow / Conversión / Implícito / Ninguno]",
    "descripcion_cta": "[Explicación de qué tipo de acción busca el CTA y por qué es efectivo]"
  },
  "secuencia_personajes": {
    "creador": "[Hook [P_] → Body [P_→P_→P_] → CTA [P_]]",
    "receptor": "[Hook [P_+P_] → Body [P_→P_→P_] → CTA [P_]]",
    "patron_dominante": "[Descripción del patrón, ej: 'P4 BOOKEND - abre y cierra con sabiduría']"
  },
  "formula_replicable": {
    "template": "[HOOK: tipo] → [CREDIBILIDAD: tipo] → [VULNERABILIDAD: tipo] → [PRINCIPIO: tipo] → [DEMOSTRACIÓN: tipo] → [CTA: tipo]",
    "patron_una_linea": "[Fórmula completa en una oración, sin contenido específico, aplicable a cualquier tema]"
  },
  "sintesis": {
    "elementos_replicables": [
      "[Elemento 1 con explicación de POR QUÉ funciona]",
      "[Elemento 2 con explicación de POR QUÉ funciona]",
      "[Elemento 3 con explicación de POR QUÉ funciona]"
    ],
    "elementos_no_copiables": [
      "[Elemento único del creador/contexto y por qué no es transferible]",
      "[Otro elemento que depende de factores externos]"
    ],
    "aplicacion_inmediata": "[Ejemplo concreto de cómo usarías esta estructura para TU contenido, con la misma fórmula pero diferente tema]"
  }
}

## NOTAS IMPORTANTES

- Sé MUY específico en justificaciones. Cita palabras exactas del texto.
- Documenta TODAS las transiciones de personaje en el body.
- Distingue entre lo que el creador PROYECTA y lo que el receptor EXPERIMENTA.
- Los personajes pueden combinarse (P3+P1) o transicionar (P4→P2→P4).
- El objetivo es extraer la ESTRUCTURA, no el contenido.
- Responde SOLO con el JSON, sin texto antes ni después.

---

## TRANSCRIPCIÓN A ANALIZAR:

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

    // Find provider, model and API key
    const providerSetting = apiKeys?.find(k => k.key_name === "ANALYSIS_PROVIDER");
    const provider = providerSetting?.key_value || "gemini";
    
    const modelSetting = apiKeys?.find(k => k.key_name === "ANALYSIS_MODEL");
    const defaultModel = provider === "gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514";
    const selectedModel = modelSetting?.key_value || defaultModel;
    
    console.log("Provider selected:", provider);
    console.log("Model selected:", selectedModel);
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
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
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
              maxOutputTokens: 8192,
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
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 8192,
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
