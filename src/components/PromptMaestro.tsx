import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

const ANALYSIS_PROMPT = `Eres un experto en copywriting y análisis de comunicación persuasiva. Tu tarea es analizar transcripciones de videos/audios usando dos frameworks fundamentales:

## FRAMEWORK 1: LAS 5 ETAPAS DE CONSCIENCIA DEL CLIENTE

### 1. UNAWARE (Inconsciente)
- El prospecto no sabe que tiene un problema
- No está buscando soluciones
- Estrategia: Educación, despertar curiosidad, mostrar síntomas

### 2. PROBLEM AWARE (Consciente del Problema)  
- Sabe que tiene un problema pero no conoce soluciones
- Siente dolor/frustración pero no sabe cómo resolverlo
- Estrategia: Agitar el problema, validar emociones, introducir que existe solución

### 3. SOLUTION AWARE (Consciente de la Solución)
- Conoce que existen soluciones pero no sabe cuál elegir
- Está investigando opciones
- Estrategia: Diferenciación, beneficios únicos, comparación con alternativas

### 4. PRODUCT AWARE (Consciente del Producto)
- Conoce tu producto/servicio específico
- Está evaluando si es para él/ella
- Estrategia: Prueba social, garantías, casos de éxito, detalles específicos

### 5. MOST AWARE (Totalmente Consciente)
- Ya te conoce, confía en ti
- Solo necesita la oferta correcta
- Estrategia: Ofertas directas, urgencia, recordatorios

---

## FRAMEWORK 2: LOS 4 PERSONAJES DEL CEREBRO

### P1 - EL ANALÍTICO (Neocórtex Izquierdo)
**Características:**
- Lógico, racional, metódico
- Busca datos, estadísticas, evidencia
- Quiere entender el "cómo" y el "por qué"
- Escéptico, necesita pruebas

**Cómo comunicarle:**
- Usa números y datos específicos
- Presenta estudios, investigaciones
- Estructura lógica paso a paso
- Evita exageraciones

### P2 - EL PROTECTOR (Sistema Límbico)
**Características:**
- Enfocado en seguridad y protección
- Busca minimizar riesgos
- Se preocupa por la familia y seres queridos
- Cauteloso ante lo nuevo

**Cómo comunicarle:**
- Garantías y políticas de devolución
- Testimonios de personas similares
- Muestra estabilidad y confianza
- Reduce percepción de riesgo

### P3 - EL EXPERIENCIAL/JUGUETÓN (Neocórtex Derecho)
**Características:**
- Creativo, visual, emocional
- Busca experiencias y sensaciones
- Le importa el "cómo se sentirá"
- Atraído por lo novedoso y emocionante

**Cómo comunicarle:**
- Usa historias y narrativas
- Describe sensaciones y emociones
- Imágenes vívidas y metáforas
- Apela a la imaginación

### P4 - EL SABIO (Sistema Límbico Profundo)
**Características:**
- Busca significado y propósito
- Conexión con valores trascendentes
- Legado e impacto duradero
- Autenticidad y verdad

**Cómo comunicarle:**
- Conecta con el "para qué" más grande
- Muestra impacto a largo plazo
- Apela a valores y principios
- Autenticidad sobre perfección

---

## INSTRUCCIONES DE ANÁLISIS

Para cada transcripción, debes:

1. **Identificar el Nivel de Consciencia** del contenido y a qué etapa está dirigido

2. **Detectar los Personajes del Comunicador**: Qué personajes (P1-P4) domina el que habla

3. **Detectar los Personajes del Receptor**: A qué personajes (P1-P4) está dirigido el mensaje

4. **Desglosar por secciones**:
   - **HOOK (Gancho)**: Primeros segundos/párrafos
   - **BODY (Cuerpo)**: Desarrollo del mensaje
   - **CTA (Llamada a la Acción)**: Cierre y siguiente paso

5. Para cada sección, explicar:
   - Qué personaje del comunicador se activa
   - A qué personaje del receptor apela
   - Por qué es efectivo o cómo podría mejorarse

Responde SIEMPRE en español y en formato estructurado.`;

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
