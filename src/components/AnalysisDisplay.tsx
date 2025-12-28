import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Users, Lightbulb, Heart, Shield, Zap, MessageCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface StructureSection {
  texto_resumen?: string;
  emisor_p?: string;
  emisor_porque?: string;
  receptor_p?: string;
  receptor_porque?: string;
}

interface AnalysisData {
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
    hook?: string | StructureSection;
    cuerpo?: string | StructureSection;
    cta?: string | StructureSection;
  };
  recomendaciones?: string[];
}

interface AnalysisDisplayProps {
  analysis: AnalysisData | null;
}

const personajeIcons: Record<string, React.ReactNode> = {
  'Triunfador': <Zap className="h-4 w-4" />,
  'Explorador': <Lightbulb className="h-4 w-4" />,
  'Controlador': <Shield className="h-4 w-4" />,
  'Protector': <Heart className="h-4 w-4" />,
};

const personajeColors: Record<string, string> = {
  'Triunfador': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  'Explorador': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  'Controlador': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  'Protector': 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
};

const etapaColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

const renderPersonajeBadge = (personaje: string, role: 'emisor' | 'receptor') => {
  const icon = personajeIcons[personaje] || <User className="h-4 w-4" />;
  const colorClass = personajeColors[personaje] || 'bg-muted text-muted-foreground';
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
      {role === 'emisor' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      {icon}
      <span>{personaje}</span>
    </div>
  );
};

const renderStructureSection = (
  section: string | StructureSection | undefined, 
  title: string, 
  emoji: string
) => {
  if (!section) return null;
  
  // Handle old format (string only)
  if (typeof section === 'string') {
    return (
      <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="text-sm font-medium">
          {emoji} {title}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">{section}</p>
        </AccordionContent>
      </AccordionItem>
    );
  }
  
  // Handle new format with P analysis
  return (
    <AccordionItem value={title.toLowerCase()}>
      <AccordionTrigger className="text-sm font-medium">
        {emoji} {title}
      </AccordionTrigger>
      <AccordionContent className="space-y-3">
        {section.texto_resumen && (
          <p className="text-sm text-foreground">{section.texto_resumen}</p>
        )}
        
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Emisor */}
          {section.emisor_p && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">EMISOR</span>
              </div>
              {renderPersonajeBadge(section.emisor_p, 'emisor')}
              {section.emisor_porque && (
                <p className="text-xs text-muted-foreground mt-1">{section.emisor_porque}</p>
              )}
            </div>
          )}
          
          {/* Receptor */}
          {section.receptor_p && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">RECEPTOR</span>
              </div>
              {renderPersonajeBadge(section.receptor_p, 'receptor')}
              {section.receptor_porque && (
                <p className="text-xs text-muted-foreground mt-1">{section.receptor_porque}</p>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
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

  return (
    <div className="space-y-4">
      {/* Etapa de Consciencia */}
      {analysis.etapa_consciencia && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Etapa de Consciencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((nivel) => (
                  <div
                    key={nivel}
                    className={`h-3 w-8 rounded ${
                      nivel <= analysis.etapa_consciencia!.nivel
                        ? etapaColors[nivel]
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div>
                <Badge variant="secondary">
                  Nivel {analysis.etapa_consciencia.nivel}: {analysis.etapa_consciencia.nombre}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {analysis.etapa_consciencia.descripcion}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Personajes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Comunicador */}
        {analysis.comunicador && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Comunicador (Emisor)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {personajeIcons[analysis.comunicador.personaje_dominante] || <User className="h-5 w-5" />}
                <span className="font-medium">{analysis.comunicador.personaje_dominante}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analysis.comunicador.caracteristicas?.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Receptor */}
        {analysis.receptor && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Receptor Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {personajeIcons[analysis.receptor.personaje_objetivo] || <Users className="h-5 w-5" />}
                <span className="font-medium">{analysis.receptor.personaje_objetivo}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.receptor.estrategia}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estructura del Mensaje */}
      {analysis.estructura && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Estructura del Mensaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {renderStructureSection(analysis.estructura.hook, 'Hook', '🎣')}
              {renderStructureSection(analysis.estructura.cuerpo, 'Cuerpo', '📝')}
              {renderStructureSection(analysis.estructura.cta, 'Call to Action', '🎯')}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      {analysis.recomendaciones && analysis.recomendaciones.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {analysis.recomendaciones.map((rec, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
