import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranscriptions } from '@/hooks/useTranscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, LogOut, Plus, Search, Youtube, 
  FileText, Download, Trash2, Clock, ExternalLink, Settings 
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
  const { user, signOut } = useAuth();
  const { transcriptions, loading, createTranscription, deleteTranscription } = useTranscriptions();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transcriptions List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Historial
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {filteredTranscriptions.length}
              </span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTranscriptions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-center text-muted-foreground">
                    {searchQuery ? 'No se encontraron resultados' : 'Aún no tienes transcripciones'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowNewModal(true)}
                      className="mt-2"
                    >
                      Crear tu primera transcripción
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTranscriptions.map((t, idx) => (
                  <Card 
                    key={t.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTranscription?.id === t.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => setSelectedTranscription(t)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {platformIcons[t.platform] || <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{t.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(t.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(t.url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(t.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detail View */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedTranscription ? (
              <TranscriptionDetail
                transcription={selectedTranscription}
                onExport={handleExport}
                onCopy={copyToClipboard}
                onClose={() => setSelectedTranscription(null)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <p className="text-center text-muted-foreground">
                    Selecciona una transcripción para ver el detalle
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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
