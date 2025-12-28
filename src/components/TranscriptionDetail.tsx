import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, X, ExternalLink, Calendar, Globe, Brain, Loader2 } from 'lucide-react';
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
                Texto plano (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(transcription, 'srt')}>
                Subtítulos (.srt)
              </DropdownMenuItem>
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
