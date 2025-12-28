import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Users, Lightbulb, Copy, Check, ArrowRight, Target, Repeat, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SectionAnalysis {
  transcripcion_exacta?: string;
  estructura_identificada?: string;
  creador_personaje?: string;
  creador_justificacion?: string;
  receptor_personaje?: string;
  receptor_justificacion?: string;
  mecanismo_retencion?: string;
  transiciones?: string;
  tipo_cta?: string;
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
  hook?: SectionAnalysis;
  body?: SectionAnalysis;
  cta?: SectionAnalysis;
  secuencia_personajes?: {
    creador: string;
    receptor: string;
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
  // Legacy format support
  etapa_consciencia?: {
    nivel: number;
    nombre: string;
    descripcion: string;
  };
  comunicador?: {
    personaje_dominante: string;
    caracteristicas: string[];
  };
  receptor?: {
    personaje_objetivo: string;
    estrategia: string;
  };
  estructura?: {
    hook?: string | object;
    cuerpo?: string | object;
    cta?: string | object;
  };
  recomendaciones?: string[];
}

interface AnalysisDisplayProps {
  analysis: AnalysisData | null;
}

const personajeNames: Record<string, string> = {
  'P1': 'Analítico',
  'P2': 'Protector',
  'P3': 'Experiencial',
  'P4': 'Sabio',
};

const personajeColors: Record<string, string> = {
  'P1': 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  'P2': 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  'P3': 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  'P4': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const nivelColors: Record<string, string> = {
  'UNAWARE': 'bg-gray-500',
  'PROBLEM AWARE': 'bg-red-500',
  'SOLUTION AWARE': 'bg-yellow-500',
  'PRODUCT AWARE': 'bg-blue-500',
  'MOST AWARE': 'bg-green-500',
};

const nivelOrder = ['UNAWARE', 'PROBLEM AWARE', 'SOLUTION AWARE', 'PRODUCT AWARE', 'MOST AWARE'];

const renderPersonajeBadge = (personaje: string, role: 'creador' | 'receptor') => {
  const name = personajeNames[personaje] || personaje;
  const colorClass = personajeColors[personaje] || 'bg-muted text-muted-foreground border-muted';
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      {role === 'creador' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      <span className="font-bold">{personaje}</span>
      <span className="opacity-75">({name})</span>
    </div>
  );
};

const SectionCard = ({ 
  section, 
  title, 
  emoji 
}: { 
  section: SectionAnalysis | undefined; 
  title: string; 
  emoji: string;
}) => {
  if (!section) return null;

  return (
    <AccordionItem value={title.toLowerCase()}>
      <AccordionTrigger className="text-sm font-medium hover:no-underline">
        <span className="flex items-center gap-2">
          <span>{emoji}</span>
          <span>{title}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2">
        {/* Transcripción / Estructura */}
        {(section.transcripcion_exacta || section.estructura_identificada) && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm italic text-foreground">
              "{section.transcripcion_exacta || section.estructura_identificada}"
            </p>
          </div>
        )}

        {/* Tabla de Personajes */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Rol</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Personaje</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Justificación</th>
              </tr>
            </thead>
            <tbody>
              {section.creador_personaje && (
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Creador
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {renderPersonajeBadge(section.creador_personaje, 'creador')}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {section.creador_justificacion}
                  </td>
                </tr>
              )}
              {section.receptor_personaje && (
                <tr>
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      Receptor
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {renderPersonajeBadge(section.receptor_personaje, 'receptor')}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {section.receptor_justificacion}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        {section.mecanismo_retencion && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">Mecanismo de retención:</p>
            <p className="text-sm text-foreground">{section.mecanismo_retencion}</p>
          </div>
        )}

        {section.transiciones && section.transiciones !== 'Sin transiciones' && (
          <div className="p-3 rounded-lg bg-accent/50 border border-accent">
            <p className="text-xs font-medium text-muted-foreground mb-1">Transiciones:</p>
            <p className="text-sm text-foreground">{section.transiciones}</p>
          </div>
        )}

        {section.tipo_cta && (
          <Badge variant="outline" className="mt-2">
            Tipo: {section.tipo_cta}
          </Badge>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

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

  // Check if it's the new format
  const isNewFormat = analysis.nivel_consciencia || analysis.hook || analysis.secuencia_personajes;

  const copyFormula = () => {
    if (analysis.formula_replicable?.patron_una_linea) {
      navigator.clipboard.writeText(analysis.formula_replicable.patron_una_linea);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  // Legacy format support
  if (!isNewFormat) {
    return (
      <div className="space-y-4">
        {analysis.etapa_consciencia && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Etapa de Consciencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Nivel {analysis.etapa_consciencia.nivel}: {analysis.etapa_consciencia.nombre}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {analysis.etapa_consciencia.descripcion}
              </p>
            </CardContent>
          </Card>
        )}
        {analysis.recomendaciones && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {analysis.recomendaciones.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // New format
  return (
    <div className="space-y-4">
      {/* Metadata */}
      {analysis.metadata && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {analysis.metadata.creador && analysis.metadata.creador !== 'Desconocido' && (
            <Badge variant="outline">👤 {analysis.metadata.creador}</Badge>
          )}
          {analysis.metadata.plataforma && analysis.metadata.plataforma !== 'Desconocida' && (
            <Badge variant="outline">📱 {analysis.metadata.plataforma}</Badge>
          )}
          {analysis.metadata.duracion_aproximada && analysis.metadata.duracion_aproximada !== 'No especificada' && (
            <Badge variant="outline">⏱️ {analysis.metadata.duracion_aproximada}</Badge>
          )}
        </div>
      )}

      {/* Nivel de Consciencia */}
      {analysis.nivel_consciencia && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Nivel de Consciencia Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex gap-1">
                {nivelOrder.map((nivel) => (
                  <div
                    key={nivel}
                    className={`h-3 w-8 rounded ${
                      nivelOrder.indexOf(nivel) <= nivelOrder.indexOf(analysis.nivel_consciencia!.nivel)
                        ? nivelColors[nivel]
                        : 'bg-muted'
                    }`}
                    title={nivel}
                  />
                ))}
              </div>
              <Badge variant="secondary" className="font-medium">
                {analysis.nivel_consciencia.nivel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {analysis.nivel_consciencia.justificacion}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Análisis de Secciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Análisis de Estructura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <SectionCard section={analysis.hook} title="Hook" emoji="🎣" />
            <SectionCard section={analysis.body} title="Body" emoji="📝" />
            <SectionCard section={analysis.cta} title="Call to Action" emoji="🎯" />
          </Accordion>
        </CardContent>
      </Card>

      {/* Secuencia de Personajes */}
      {analysis.secuencia_personajes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Secuencia de Personajes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground w-20">CREADOR:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                {analysis.secuencia_personajes.creador}
              </code>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground w-20">RECEPTOR:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                {analysis.secuencia_personajes.receptor}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fórmula Replicable */}
      {analysis.formula_replicable && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Fórmula Replicable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Template:</p>
              <p className="text-sm font-mono">{analysis.formula_replicable.template}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-primary">Patrón en una línea:</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={copyFormula}
                >
                  {copiedFormula ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm font-medium">{analysis.formula_replicable.patron_una_linea}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Síntesis Final */}
      {analysis.sintesis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Síntesis Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Elementos Replicables */}
            {analysis.sintesis.elementos_replicables?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                  ✓ ELEMENTOS REPLICABLES
                </p>
                <ul className="text-sm space-y-1">
                  {analysis.sintesis.elementos_replicables.map((elem, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500">•</span>
                      <span>{elem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Elementos No Copiables */}
            {analysis.sintesis.elementos_no_copiables?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                  ✗ ELEMENTOS NO COPIABLES
                </p>
                <ul className="text-sm space-y-1">
                  {analysis.sintesis.elementos_no_copiables.map((elem, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">•</span>
                      <span>{elem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Aplicación Inmediata */}
            {analysis.sintesis.aplicacion_inmediata && (
              <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  🚀 APLICACIÓN INMEDIATA
                </p>
                <p className="text-sm font-medium">{analysis.sintesis.aplicacion_inmediata}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
