import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Users, Lightbulb, Heart, Shield, Zap
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
    hook?: string;
    cuerpo?: string;
    cta?: string;
  };
  recomendaciones?: string[];
}

interface AnalysisDisplayProps {
  analysis: AnalysisData | null;
}

const personajeIcons: Record<string, React.ReactNode> = {
  'Triunfador': <Zap className="h-5 w-5" />,
  'Explorador': <Lightbulb className="h-5 w-5" />,
  'Controlador': <Shield className="h-5 w-5" />,
  'Protector': <Heart className="h-5 w-5" />,
};

const etapaColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
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
                Comunicador
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
        <Accordion type="single" collapsible className="w-full">
          {analysis.estructura.hook && (
            <AccordionItem value="hook">
              <AccordionTrigger className="text-sm font-medium">
                🎣 Hook
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{analysis.estructura.hook}</p>
              </AccordionContent>
            </AccordionItem>
          )}
          {analysis.estructura.cuerpo && (
            <AccordionItem value="cuerpo">
              <AccordionTrigger className="text-sm font-medium">
                📝 Cuerpo
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{analysis.estructura.cuerpo}</p>
              </AccordionContent>
            </AccordionItem>
          )}
          {analysis.estructura.cta && (
            <AccordionItem value="cta">
              <AccordionTrigger className="text-sm font-medium">
                🎯 Call to Action
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{analysis.estructura.cta}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
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
