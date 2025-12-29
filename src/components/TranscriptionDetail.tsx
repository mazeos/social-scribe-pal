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
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let yPos = margin;

    const lineHeight = 5;
    const sectionGap = 8;
    const paragraphGap = 4;

    // Brand colors - Green lime (#CBFC47 = RGB 203, 252, 71)
    const brandGreen: [number, number, number] = [203, 252, 71];
    const black: [number, number, number] = [0, 0, 0];
    const darkGray: [number, number, number] = [40, 40, 40];
    const mediumGray: [number, number, number] = [100, 100, 100];
    const lightGray: [number, number, number] = [245, 245, 245];

    const checkNewPage = (neededSpace: number = 20) => {
      if (yPos + neededSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = darkGray) => {
      if (!text) return;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(String(text), maxWidth);
      lines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, margin, yPos);
        yPos += lineHeight;
      });
    };

    const addSectionTitle = (title: string) => {
      checkNewPage(25);
      yPos += sectionGap;
      // Black background with green text
      pdf.setFillColor(0, 0, 0);
      pdf.rect(margin, yPos - 4, maxWidth, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
      pdf.text(title.toUpperCase(), margin + 3, yPos + 1);
      yPos += 10;
    };

    const addSubtitle = (title: string) => {
      checkNewPage(15);
      yPos += paragraphGap;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(black[0], black[1], black[2]);
      pdf.text(title, margin, yPos);
      yPos += lineHeight + 1;
    };

    const addQuote = (text: string) => {
      if (!text) return;
      checkNewPage(15);
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      const quoteText = `"${text}"`;
      const lines = pdf.splitTextToSize(quoteText, maxWidth - 10);
      const boxHeight = lines.length * lineHeight + 6;
      pdf.rect(margin, yPos - 2, maxWidth, boxHeight, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPos + 2);
        yPos += lineHeight;
      });
      yPos += 4;
    };

    const addBulletList = (items: string[], bulletChar: string = '•') => {
      if (!items || !items.length) return;
      items.forEach((item) => {
        if (!item) return;
        checkNewPage(10);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const lines = pdf.splitTextToSize(`${bulletChar} ${item}`, maxWidth - 8);
        lines.forEach((line: string, idx: number) => {
          pdf.text(idx === 0 ? line : `   ${line}`, margin + 3, yPos);
          yPos += lineHeight;
        });
      });
      yPos += 2;
    };

    const addPersonalityTable = (personalities: any[]) => {
      if (!personalities || !personalities.length) return;
      personalities.forEach((p) => {
        if (!p) return;
        checkNewPage(20);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        pdf.text(`${p.rol || 'N/A'}:`, margin + 3, yPos);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(black[0], black[1], black[2]);
        pdf.text(` ${p.personaje || 'N/A'} (${p.nombre || 'N/A'})`, margin + 25, yPos);
        yPos += lineHeight;
        if (p.justificacion) {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          const lines = pdf.splitTextToSize(p.justificacion, maxWidth - 10);
          lines.forEach((line: string) => {
            checkNewPage();
            pdf.text(line, margin + 5, yPos);
            yPos += lineHeight;
          });
        }
        yPos += 2;
      });
    };

    // === HEADER - Black background with green accent ===
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    // Green accent bar
    pdf.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    pdf.rect(0, 36, pageWidth, 4, 'F');
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    const titleLines = pdf.splitTextToSize(transcription.title, maxWidth - 10);
    pdf.text(titleLines[0] || 'Análisis', margin, 18);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    pdf.text(`Generado: ${format(new Date(), "d MMM yyyy, HH:mm", { locale: es })}  |  Plataforma: ${transcription.platform}`, margin, 28);
    yPos = 50;

    // === TRANSCRIPCIÓN COMPLETA ===
    addSectionTitle('Transcripción Completa');
    pdf.setFillColor(250, 250, 250);
    const transcriptText = transcription.transcript;
    const transcriptLines = pdf.splitTextToSize(transcriptText, maxWidth - 10);
    
    // Calculate box height with proper page breaks
    let tempY = yPos;
    transcriptLines.forEach((line: string) => {
      if (tempY + lineHeight > pageHeight - margin) {
        tempY = margin + lineHeight;
      } else {
        tempY += lineHeight;
      }
    });
    
    // Draw transcript with gray background
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    transcriptLines.forEach((line: string) => {
      checkNewPage(10);
      pdf.text(line, margin + 3, yPos);
      yPos += lineHeight;
    });
    yPos += 5;

    // === METADATA ===
    if (analysis.metadata) {
      addSectionTitle('Información General');
      const meta = analysis.metadata;
      if (meta.creador) addText(`Creador: ${meta.creador}`, 10, false, black);
      if (meta.plataforma) addText(`Plataforma: ${meta.plataforma}`, 10, false, black);
      if (meta.duracion_aproximada) addText(`Duración: ${meta.duracion_aproximada}`, 10, false, black);
    }

    // === NIVEL DE CONSCIENCIA ===
    if (analysis.nivel_consciencia) {
      addSectionTitle('Nivel de Consciencia');
      addSubtitle(analysis.nivel_consciencia.nivel || 'No identificado');
      addText(analysis.nivel_consciencia.justificacion, 9);
    }

    // === HOOK ===
    if (analysis.hook) {
      addSectionTitle('Análisis del Hook');
      if (analysis.hook.transcripcion_exacta) {
        addSubtitle('Transcripción');
        addQuote(analysis.hook.transcripcion_exacta);
      }
      if (analysis.hook.personalidades?.length) {
        addSubtitle('Personalidades');
        addPersonalityTable(analysis.hook.personalidades);
      }
      if (analysis.hook.mecanismo_retencion?.length) {
        addSubtitle('Mecanismos de Retención');
        addBulletList(analysis.hook.mecanismo_retencion);
      }
    }

    // === BODY ===
    if (analysis.body) {
      addSectionTitle('Análisis del Body');
      if (analysis.body.estructura_identificada) {
        addSubtitle('Estructura');
        addText(analysis.body.estructura_identificada, 9);
      }
      if (analysis.body.personalidades?.length) {
        addSubtitle('Personalidades');
        addPersonalityTable(analysis.body.personalidades);
      }
      if (analysis.body.transiciones?.length) {
        addSubtitle('Transiciones');
        analysis.body.transiciones.forEach((t: any) => {
          checkNewPage(25);
          if (t.cita) addQuote(t.cita);
          addText(`Creador (${t.creador_p || 'N/A'}): ${t.creador_porque || ''}`, 9);
          addText(`Receptor (${t.receptor_p || 'N/A'}): ${t.receptor_porque || ''}`, 9);
          yPos += 3;
        });
      }
    }

    // === CTA ===
    if (analysis.cta) {
      addSectionTitle('Análisis del CTA');
      if (analysis.cta.transcripcion_exacta) {
        addSubtitle('Transcripción');
        addQuote(analysis.cta.transcripcion_exacta);
      }
      if (analysis.cta.tipo_cta) {
        addText(`Tipo de CTA: ${analysis.cta.tipo_cta}`, 10, true, black);
      }
      if (analysis.cta.descripcion_cta) {
        addText(analysis.cta.descripcion_cta, 9);
      }
      if (analysis.cta.personalidades?.length) {
        addSubtitle('Personalidades');
        addPersonalityTable(analysis.cta.personalidades);
      }
    }

    // === SECUENCIA DE PERSONAJES ===
    if (analysis.secuencia_personajes) {
      addSectionTitle('Secuencia de Personajes');
      const seq = analysis.secuencia_personajes;
      if (seq.creador) addText(`Creador: ${seq.creador}`, 10, false, black);
      if (seq.receptor) addText(`Receptor: ${seq.receptor}`, 10, false, black);
      if (seq.patron_dominante) {
        addSubtitle('Patrón Dominante');
        addText(seq.patron_dominante, 10, true, black);
      }
    }

    // === FÓRMULA REPLICABLE - Highlighted box ===
    if (analysis.formula_replicable) {
      addSectionTitle('Fórmula Replicable');
      if (analysis.formula_replicable.patron_una_linea) {
        checkNewPage(20);
        // Black box with green text for emphasis
        pdf.setFillColor(0, 0, 0);
        const patternText = analysis.formula_replicable.patron_una_linea;
        const patternLines = pdf.splitTextToSize(patternText, maxWidth - 16);
        const boxHeight = patternLines.length * lineHeight + 10;
        pdf.rect(margin, yPos - 2, maxWidth, boxHeight, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        patternLines.forEach((line: string) => {
          pdf.text(line, margin + 8, yPos + 4);
          yPos += lineHeight;
        });
        yPos += 8;
      }
      if (analysis.formula_replicable.template) {
        addSubtitle('Template');
        addText(analysis.formula_replicable.template, 9);
      }
    }

    // === SÍNTESIS ===
    if (analysis.sintesis) {
      addSectionTitle('Síntesis Final');
      if (analysis.sintesis.elementos_replicables?.length) {
        addSubtitle('Elementos Replicables');
        addBulletList(analysis.sintesis.elementos_replicables, '✓');
      }
      if (analysis.sintesis.elementos_no_copiables?.length) {
        addSubtitle('Elementos No Copiables');
        addBulletList(analysis.sintesis.elementos_no_copiables, '✗');
      }
      if (analysis.sintesis.aplicacion_inmediata) {
        addSubtitle('Aplicación Inmediata');
        checkNewPage(20);
        // Light green background for action item
        pdf.setFillColor(236, 253, 224);
        const appText = analysis.sintesis.aplicacion_inmediata;
        const appLines = pdf.splitTextToSize(appText, maxWidth - 16);
        const boxHeight = appLines.length * lineHeight + 10;
        pdf.rect(margin, yPos - 2, maxWidth, boxHeight, 'F');
        pdf.setDrawColor(brandGreen[0], brandGreen[1], brandGreen[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPos - 2, maxWidth, boxHeight, 'S');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        appLines.forEach((line: string) => {
          pdf.text(line, margin + 8, yPos + 4);
          yPos += lineHeight;
        });
        yPos += 6;
      }
    }

    // === FOOTER ===
    pdf.setFontSize(8);
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.text('Generado con Video Analyzer', margin, pageHeight - 8);

    const fileName = `analisis-${transcription.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50)}.pdf`;
    pdf.save(fileName);
    toast.success('PDF descargado correctamente');
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
