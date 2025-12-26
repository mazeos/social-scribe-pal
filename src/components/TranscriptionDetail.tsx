import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, X, ExternalLink, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transcription } from '@/hooks/useTranscriptions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TranscriptionDetailProps {
  transcription: Transcription;
  onExport: (transcription: Transcription, format: 'txt' | 'srt') => void;
  onCopy: (text: string) => void;
  onClose: () => void;
}

export default function TranscriptionDetail({ 
  transcription, 
  onExport, 
  onCopy, 
  onClose 
}: TranscriptionDetailProps) {
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
        </div>

        {/* Transcript Content */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <ScrollArea className="h-[400px]">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {transcription.transcript}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
