import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranscriptions } from '@/hooks/useTranscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, LogOut, Plus, Search, Youtube, 
  FileText, Download, Trash2, Clock, ExternalLink, Settings,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TranscriptionModal from '@/components/TranscriptionModal';
import TranscriptionDetail from '@/components/TranscriptionDetail';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Transcription } from '@/hooks/useTranscriptions';

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4 text-red-500" />,
  tiktok: <span className="text-xs font-bold">TT</span>,
  instagram: <span className="text-xs font-bold text-pink-500">IG</span>,
};

export default function Dashboard() {
  const { user, session, signOut } = useAuth();
  const { transcriptions, loading, createTranscription, deleteTranscription, updateTranscription, refetch } = useTranscriptions();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateTranscription = async (url: string, title: string) => {
    setIsCreating(true);
    try {
      const result = await createTranscription(url, title);
      if (result) {
        setShowNewModal(false);
        setSelectedTranscription(result);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta transcripción?')) {
      await deleteTranscription(id);
      if (selectedTranscription?.id === id) {
        setSelectedTranscription(null);
      }
    }
  };

  const handleExport = (transcription: Transcription, format: 'txt' | 'srt') => {
    let content = '';
    let filename = '';

    if (format === 'txt') {
      content = transcription.transcript;
      filename = `${transcription.title}.txt`;
    } else {
      // Simple SRT format
      content = `1\n00:00:00,000 --> 00:05:00,000\n${transcription.transcript}`;
      filename = `${transcription.title}.srt`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exportado como ${format.toUpperCase()}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleAnalyze = async (transcription: Transcription) => {
    if (!session) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            transcriptionId: transcription.id,
            transcript: transcription.transcript 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar');
      }

      await refetch();
      // Update selected transcription with new analysis
      setSelectedTranscription(prev => prev ? { ...prev, analysis: data.analysis } : null);
      toast.success('Análisis completado');
    } catch (error) {
      console.error('Error analyzing transcription:', error);
      toast.error(error instanceof Error ? error.message : 'Error al analizar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTranscriptions = transcriptions.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">TranscribeAI</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transcripciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowNewModal(true)} className="gradient-bg hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nueva transcripción
          </Button>
        </div>

        {/* Content - Layout with collapsible history */}
        <div className="flex gap-6">
          {/* Transcriptions List - Collapsible */}
          <div 
            className={`transition-all duration-300 space-y-3 ${
              historyCollapsed 
                ? 'w-12 min-w-12 max-w-12' 
                : 'w-full lg:w-[30%] lg:min-w-[280px] lg:max-w-[360px]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setHistoryCollapsed(!historyCollapsed)}
                title={historyCollapsed ? 'Expandir historial' : 'Colapsar historial'}
              >
                {historyCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
              {!historyCollapsed && (
                <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide flex-1">
                  <Clock className="h-4 w-4" />
                  Historial
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                    {filteredTranscriptions.length}
                  </span>
                </h2>
              )}
            </div>

            {!historyCollapsed && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredTranscriptions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-center text-sm text-muted-foreground">
                        {searchQuery ? 'Sin resultados' : 'Sin transcripciones'}
                      </p>
                      {!searchQuery && (
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => setShowNewModal(true)}
                          className="mt-1"
                        >
                          Crear primera
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    {filteredTranscriptions.map((t) => (
                      <Card 
                        key={t.id}
                        className={`cursor-pointer transition-all hover:shadow-sm hover:bg-accent/50 ${
                          selectedTranscription?.id === t.id ? 'ring-2 ring-primary bg-accent/30' : ''
                        }`}
                        onClick={() => setSelectedTranscription(t)}
                      >
                        <CardContent className="flex items-center gap-3 p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {platformIcons[t.platform] || <FileText className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">{t.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(t.created_at), "d MMM, HH:mm", { locale: es })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(t.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail View - Main 70% */}
          <div className="hidden lg:block flex-1">
            {selectedTranscription ? (
              <TranscriptionDetail
                transcription={selectedTranscription}
                onExport={handleExport}
                onCopy={copyToClipboard}
                onClose={() => setSelectedTranscription(null)}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <Card className="border-dashed h-[calc(100vh-220px)]">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <p className="text-center text-muted-foreground">
                    Selecciona una transcripción para ver el detalle
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Mobile Detail View */}
          {selectedTranscription && (
            <div className="fixed inset-0 z-50 bg-background lg:hidden overflow-auto">
              <div className="p-4">
                <TranscriptionDetail
                  transcription={selectedTranscription}
                  onExport={handleExport}
                  onCopy={copyToClipboard}
                  onClose={() => setSelectedTranscription(null)}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Transcription Modal */}
      <TranscriptionModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreateTranscription}
        loading={isCreating}
      />
    </div>
  );
}
