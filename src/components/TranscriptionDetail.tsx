import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, X, ExternalLink, Calendar, Globe, Brain, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transcription } from '@/hooks/useTranscriptions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AnalysisDisplay from './AnalysisDisplay';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface TranscriptionDetailProps {
  transcription: Transcription;
  onExport: (transcription: Transcription, format: 'txt' | 'srt') => void;
  onCopy: (text: string) => void;
  onClose: () => void;
  onAnalyze?: (transcription: Transcription) => Promise<void>;
  isAnalyzing?: boolean;
}

export default function TranscriptionDetail({ 
  transcription, 
  onExport, 
  onCopy, 
  onClose,
  onAnalyze,
  isAnalyzing = false
}: TranscriptionDetailProps) {
  const [activeTab, setActiveTab] = useState('transcription');

  const handleAnalyze = async () => {
    if (onAnalyze) {
      await onAnalyze(transcription);
      setActiveTab('analysis');
    }
  };

  const exportAnalysisPDF = () => {
    const analysis = transcription.analysis as any;
    if (!analysis) {
      toast.error('No hay análisis para exportar');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
      yPos += 3;
    };

    const addSection = (title: string) => {
      yPos += 5;
      addText(title, 14, true);
      yPos += 2;
    };

    // Title
    addText(`Análisis: ${transcription.title}`, 18, true);
    addText(`Fecha: ${format(new Date(transcription.created_at), "d MMM yyyy, HH:mm", { locale: es })}`, 10);
    yPos += 5;

    // Nivel de Consciencia
    if (analysis.nivel_consciencia) {
      addSection('Nivel de Consciencia');
      addText(`Nivel: ${analysis.nivel_consciencia.nivel}`, 11, true);
      addText(analysis.nivel_consciencia.justificacion, 10);
    }

    // Hook
    if (analysis.hook) {
      addSection('Análisis del Hook');
      if (analysis.hook.transcripcion_exacta) {
        addText(`"${analysis.hook.transcripcion_exacta}"`, 10);
      }
      if (analysis.hook.mecanismo_retencion?.length) {
        addText('Mecanismo de retención:', 10, true);
        analysis.hook.mecanismo_retencion.forEach((m: string) => addText(`• ${m}`, 10));
      }
    }

    // Body
    if (analysis.body) {
      addSection('Análisis del Body');
      if (analysis.body.estructura_identificada) {
        addText(`Estructura: ${analysis.body.estructura_identificada}`, 10);
      }
    }

    // CTA
    if (analysis.cta) {
      addSection('Análisis del CTA');
      if (analysis.cta.transcripcion_exacta) {
        addText(`"${analysis.cta.transcripcion_exacta}"`, 10);
      }
      if (analysis.cta.tipo_cta) {
        addText(`Tipo: ${analysis.cta.tipo_cta}`, 10);
      }
    }

    // Fórmula Replicable
    if (analysis.formula_replicable) {
      addSection('Fórmula Replicable');
      if (analysis.formula_replicable.patron_una_linea) {
        addText(analysis.formula_replicable.patron_una_linea, 11, true);
      }
      if (analysis.formula_replicable.template) {
        addText(analysis.formula_replicable.template, 10);
      }
    }

    // Síntesis
    if (analysis.sintesis) {
      addSection('Síntesis Final');
      if (analysis.sintesis.elementos_replicables?.length) {
        addText('Elementos replicables:', 10, true);
        analysis.sintesis.elementos_replicables.forEach((e: string) => addText(`✓ ${e}`, 10));
      }
      if (analysis.sintesis.aplicacion_inmediata) {
        addText('Aplicación inmediata:', 10, true);
        addText(analysis.sintesis.aplicacion_inmediata, 10);
      }
    }

    pdf.save(`analisis-${transcription.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    toast.success('PDF descargado');
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{transcription.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(transcription.created_at), "d MMM yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1 capitalize">
                <Globe className="h-3.5 w-3.5" />
                {transcription.platform}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCopy(transcription.transcript)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport(transcription, 'txt')}>
                <FileText className="mr-2 h-4 w-4" />
                Texto plano (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(transcription, 'srt')}>
                <FileText className="mr-2 h-4 w-4" />
                Subtítulos (.srt)
              </DropdownMenuItem>
              {transcription.analysis && (
                <DropdownMenuItem onClick={exportAnalysisPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Análisis PDF
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(transcription.url, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver original
          </Button>

          <Button 
            variant="default" 
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analizando...' : 'Analizar'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcription">Transcripción</TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Análisis
              {transcription.analysis && (
                <span className="h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcription" className="mt-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <ScrollArea className="h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {transcription.transcript}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-4">
            <ScrollArea className="h-[400px]">
              <AnalysisDisplay analysis={transcription.analysis as any} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
