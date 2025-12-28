import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Users, Lightbulb, Copy, Check, Target, Repeat, Sparkles, ArrowRight, Quote, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Personalidad {
  rol: string;
  personaje: string;
  nombre?: string;
  justificacion: string;
}

interface Transicion {
  cita: string;
  creador_p: string;
  creador_porque: string;
  receptor_p: string;
  receptor_porque: string;
}

interface HookSection {
  transcripcion_exacta?: string;
  personalidades?: Personalidad[];
  mecanismo_retencion?: string[];
}

interface BodySection {
  estructura_identificada?: string;
  personalidades?: Personalidad[];
  transiciones?: Transicion[];
}

interface CtaSection {
  transcripcion_exacta?: string;
  personalidades?: Personalidad[];
  tipo_cta?: string;
  descripcion_cta?: string;
}

interface AnalysisData {
  metadata?: {
    creador?: string;
    plataforma?: string;
    duracion_aproximada?: string;
  };
  nivel_consciencia?: {
    nivel: string;
    justificacion: string;
  };
  hook?: HookSection;
  body?: BodySection;
  cta?: CtaSection;
  secuencia_personajes?: {
    creador: string;
    receptor: string;
    patron_dominante?: string;
  };
  formula_replicable?: {
    template: string;
    patron_una_linea: string;
  };
  sintesis?: {
    elementos_replicables: string[];
    elementos_no_copiables: string[];
    aplicacion_inmediata: string;
  };
  // Legacy support
  etapa_consciencia?: { nivel: number; nombre: string; descripcion: string; };
  recomendaciones?: string[];
}

interface AnalysisDisplayProps {
  analysis: AnalysisData | null;
}

const personajeColors: Record<string, string> = {
  'P1': 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  'P2': 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  'P3': 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  'P4': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const personajeNames: Record<string, string> = {
  'P1': 'Analítico',
  'P2': 'Protector', 
  'P3': 'Experiencial',
  'P4': 'Sabio',
};

const nivelColors: Record<string, string> = {
  'UNAWARE': 'bg-gray-500',
  'PROBLEM AWARE': 'bg-orange-500',
  'SOLUTION AWARE': 'bg-yellow-500',
  'PRODUCT AWARE': 'bg-blue-500',
  'MOST AWARE': 'bg-green-500',
};

const getPersonajeColor = (personaje: string) => {
  // Handle combined personajes like "P3+P1" or sequences like "P4→P2→P4→P1"
  const firstP = personaje.match(/P[1-4]/)?.[0];
  return personajeColors[firstP || 'P1'] || 'bg-muted text-muted-foreground border-muted';
};

const renderPersonajeBadge = (personaje: string, nombre?: string) => {
  const colorClass = getPersonajeColor(personaje);
  const displayName = nombre || personajeNames[personaje] || personaje;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
      {personaje}
      {nombre && <span className="opacity-75">({displayName})</span>}
    </span>
  );
};

const PersonalidadesTable = ({ personalidades }: { personalidades: Personalidad[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
      <thead className="bg-muted/50">
        <tr>
          <th className="text-left py-2 px-3 font-medium text-muted-foreground w-24">Rol</th>
          <th className="text-left py-2 px-3 font-medium text-muted-foreground w-32">Personaje</th>
          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Justificación específica</th>
        </tr>
      </thead>
      <tbody>
        {personalidades.map((p, i) => (
          <tr key={i} className="border-t border-border/50">
            <td className="py-2 px-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {p.rol === 'Creador' ? <User className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {p.rol}
              </span>
            </td>
            <td className="py-2 px-3">
              {renderPersonajeBadge(p.personaje, p.nombre)}
            </td>
            <td className="py-2 px-3 text-muted-foreground">
              {p.justificacion}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TransicionesSection = ({ transiciones }: { transiciones: Transicion[] }) => (
  <div className="space-y-3">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      Transiciones detalladas:
    </p>
    {transiciones.map((t, i) => (
      <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
        <div className="flex items-start gap-2">
          <Quote className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm italic">"{t.cita}"</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-background rounded">
            <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Creador: </span>
              {renderPersonajeBadge(t.creador_p)}
              <p className="text-muted-foreground mt-1">{t.creador_porque}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-background rounded">
            <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Receptor: </span>
              {renderPersonajeBadge(t.receptor_p)}
              <p className="text-muted-foreground mt-1">{t.receptor_porque}</p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const [copiedFormula, setCopiedFormula] = useState(false);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Brain className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-center">
          No hay análisis disponible.<br />
          Presiona "Analizar" para generar el análisis con IA.
        </p>
      </div>
    );
  }

  const isNewFormat = analysis.nivel_consciencia || analysis.hook?.personalidades;

  const copyFormula = () => {
    if (analysis.formula_replicable?.patron_una_linea) {
      navigator.clipboard.writeText(analysis.formula_replicable.patron_una_linea);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  // Legacy format
  if (!isNewFormat) {
    return (
      <div className="space-y-4">
        {analysis.etapa_consciencia && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Etapa de Consciencia</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Nivel {analysis.etapa_consciencia.nivel}: {analysis.etapa_consciencia.nombre}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">{analysis.etapa_consciencia.descripcion}</p>
            </CardContent>
          </Card>
        )}
        {analysis.recomendaciones && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Recomendaciones</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {analysis.recomendaciones.map((rec, i) => <li key={i}>• {rec}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. METADATA */}
      {analysis.metadata && (
        <div className="flex flex-wrap gap-2 text-xs">
          {analysis.metadata.creador && analysis.metadata.creador !== 'No identificado' && (
            <Badge variant="outline">👤 {analysis.metadata.creador}</Badge>
          )}
          {analysis.metadata.plataforma && (
            <Badge variant="outline">📱 {analysis.metadata.plataforma}</Badge>
          )}
          {analysis.metadata.duracion_aproximada && (
            <Badge variant="outline">⏱️ {analysis.metadata.duracion_aproximada}</Badge>
          )}
        </div>
      )}

      {/* 2. NIVEL DE CONSCIENCIA */}
      {analysis.nivel_consciencia && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Nivel de Consciencia Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`${nivelColors[analysis.nivel_consciencia.nivel.split(' → ')[0]] || 'bg-muted'} text-white border-0`}
              >
                {analysis.nivel_consciencia.nivel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.nivel_consciencia.justificacion}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 3. ANÁLISIS DEL HOOK */}
      {analysis.hook && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              🎣 Análisis del Hook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.hook.transcripcion_exacta && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Transcripción exacta:</p>
                <p className="text-sm italic">"{analysis.hook.transcripcion_exacta}"</p>
              </div>
            )}
            
            {analysis.hook.personalidades && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Personalidades activas:
                </p>
                <PersonalidadesTable personalidades={analysis.hook.personalidades} />
              </>
            )}

            {analysis.hook.mecanismo_retencion && analysis.hook.mecanismo_retencion.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-2">Mecanismo de retención:</p>
                <ul className="text-sm space-y-1">
                  {analysis.hook.mecanismo_retencion.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. ANÁLISIS DEL BODY */}
      {analysis.body && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              📝 Análisis del Body
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.body.estructura_identificada && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Estructura identificada:</p>
                <p className="text-sm font-mono">{analysis.body.estructura_identificada}</p>
              </div>
            )}
            
            {analysis.body.personalidades && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Personalidades activas:
                </p>
                <PersonalidadesTable personalidades={analysis.body.personalidades} />
              </>
            )}

            {analysis.body.transiciones && analysis.body.transiciones.length > 0 && (
              <TransicionesSection transiciones={analysis.body.transiciones} />
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. ANÁLISIS DEL CTA */}
      {analysis.cta && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              🎯 Análisis del CTA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.cta.transcripcion_exacta && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Transcripción exacta:</p>
                <p className="text-sm italic">"{analysis.cta.transcripcion_exacta}"</p>
              </div>
            )}
            
            {analysis.cta.personalidades && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Personalidades activas:
                </p>
                <PersonalidadesTable personalidades={analysis.cta.personalidades} />
              </>
            )}

            {analysis.cta.tipo_cta && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  Tipo: {analysis.cta.tipo_cta}
                </Badge>
              </div>
            )}

            {analysis.cta.descripcion_cta && (
              <p className="text-sm text-muted-foreground">{analysis.cta.descripcion_cta}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. SECUENCIA DE PERSONAJES */}
      {analysis.secuencia_personajes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Secuencia Completa de Personajes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 font-mono text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-24">CREADOR:</span>
                <code className="bg-background px-2 py-1 rounded">{analysis.secuencia_personajes.creador}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-24">RECEPTOR:</span>
                <code className="bg-background px-2 py-1 rounded">{analysis.secuencia_personajes.receptor}</code>
              </div>
            </div>
            {analysis.secuencia_personajes.patron_dominante && (
              <div className="p-2 rounded bg-accent/50 text-sm">
                <span className="font-medium">Patrón dominante: </span>
                {analysis.secuencia_personajes.patron_dominante}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 7. FÓRMULA REPLICABLE */}
      {analysis.formula_replicable && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Fórmula Estructural Replicable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Template abstracto:</p>
              <p className="text-sm font-mono whitespace-pre-wrap">{analysis.formula_replicable.template}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border-2 border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-primary">Patrón en una línea:</p>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={copyFormula}>
                  {copiedFormula ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-sm font-medium leading-relaxed">{analysis.formula_replicable.patron_una_linea}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8. SÍNTESIS FINAL */}
      {analysis.sintesis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Síntesis Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.sintesis.elementos_replicables?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                  ✓ {analysis.sintesis.elementos_replicables.length} Elementos Replicables
                </p>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  {analysis.sintesis.elementos_replicables.map((elem, i) => (
                    <li key={i} className="text-foreground">
                      <span className="text-muted-foreground">{elem}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Separator />

            {analysis.sintesis.elementos_no_copiables?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">
                  ✗ {analysis.sintesis.elementos_no_copiables.length} Elementos No Copiables
                </p>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  {analysis.sintesis.elementos_no_copiables.map((elem, i) => (
                    <li key={i} className="text-foreground">
                      <span className="text-muted-foreground">{elem}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Separator />

            {analysis.sintesis.aplicacion_inmediata && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                  🚀 Aplicación Inmediata
                </p>
                <p className="text-sm font-medium leading-relaxed">{analysis.sintesis.aplicacion_inmediata}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
