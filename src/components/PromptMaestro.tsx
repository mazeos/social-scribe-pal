import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

const ANALYSIS_PROMPT = `Eres un experto en análisis de comunicación y marketing. Analiza transcripciones usando dos frameworks:

## FRAMEWORK 1: LAS 5 ETAPAS DE CONSCIENCIA DEL CLIENTE

IMPORTANTE: Clasifica según lo que REALMENTE aparece en el contenido:

1. **UNAWARE (Inconsciente - Nivel 1)**: El contenido despierta curiosidad sobre un problema que el receptor NO sabía que tenía. No menciona soluciones específicas.

2. **PROBLEM AWARE (Consciente del Problema - Nivel 2)**: El contenido habla del problema pero NO presenta una solución clara. El receptor entiende que tiene un problema.

3. **SOLUTION AWARE (Consciente de la Solución - Nivel 3)**: El contenido presenta UNA SOLUCIÓN o método pero NO menciona un producto/servicio específico para comprar. Enseña "cómo" hacer algo.

4. **PRODUCT AWARE (Consciente del Producto - Nivel 4)**: El contenido menciona EXPLÍCITAMENTE un producto, servicio, curso u oferta específica. Hay una invitación a conocer/comprar algo concreto.

5. **MOST AWARE (Totalmente Consciente - Nivel 5)**: El contenido incluye una OFERTA DIRECTA con precio, descuento, urgencia o garantía. El receptor solo necesita decidir comprar.

**REGLA CRÍTICA**: Si NO hay mención explícita de un producto/servicio/oferta para comprar, NO puede ser nivel 4 o 5. Si solo enseña un método o tip, es nivel 3.

---

## FRAMEWORK 2: LOS 4 PERSONAJES DEL CEREBRO (Las 4 P)

Cada comunicación tiene DOS personajes en juego:
- **EMISOR (P del comunicador)**: Qué personalidad proyecta quien habla
- **RECEPTOR (P objetivo)**: A qué personalidad intenta persuadir

### 1. EL TRIUNFADOR
- Busca éxito, reconocimiento y estatus
- Responde a: logros, exclusividad, ser el mejor
- Lenguaje: "el mejor", "exclusivo", "resultados", "ganar"

### 2. EL EXPLORADOR  
- Busca novedad, aventura y libertad
- Responde a: descubrimiento, cambio, experiencias únicas
- Lenguaje: "nuevo", "diferente", "descubre", "innovador"

### 3. EL CONTROLADOR
- Busca seguridad, orden y certeza
- Responde a: datos, garantías, procesos claros
- Lenguaje: "paso a paso", "garantizado", "comprobado", "sistema"

### 4. EL PROTECTOR
- Busca conexión, pertenencia y cuidar a otros
- Responde a: comunidad, familia, impacto social
- Lenguaje: "juntos", "familia", "comunidad", "ayudar"

---

## ANÁLISIS DE ESTRUCTURA

Para cada sección (Hook, Cuerpo, CTA), se debe identificar:

**EMISOR P**: Qué personalidad proyecta el comunicador
**EMISOR PORQUE**: Por qué proyecta esa P (evidencia del texto)

**RECEPTOR P**: A qué personalidad del receptor apela
**RECEPTOR PORQUE**: Por qué apela a esa P (estrategia usada)

### Ejemplo de análisis correcto:

**HOOK:**
- Emisor: CONTROLADOR porque usa "paso a paso" y presenta un método estructurado
- Receptor: TRIUNFADOR porque promete "grabar 10 videos en 1 hora" (eficiencia/logro)

**CUERPO:**
- Emisor: CONTROLADOR porque enumera pasos claros y un proceso definido
- Receptor: CONTROLADOR porque apela a la certeza de un sistema probado

**CTA:**
- Emisor: EXPLORADOR porque invita a "probar algo nuevo"
- Receptor: PROTECTOR porque menciona compartir con la comunidad`;


export function PromptMaestro() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Prompt Maestro de Análisis</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Consulta el prompt que utiliza la IA para analizar tus transcripciones.
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border border-border bg-muted/30 p-4">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {ANALYSIS_PROMPT}
            </pre>
          </ScrollArea>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Este prompt es de solo lectura y se usa internamente para el análisis.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
