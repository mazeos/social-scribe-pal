import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link2, Youtube } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const urlSchema = z.string().url('Ingresa una URL válida').refine(
  (url) => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('tiktok.com') || 
           url.includes('instagram.com');
  },
  'Solo se admiten URLs de YouTube, TikTok o Instagram'
);

interface TranscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string, title: string) => Promise<void>;
  loading: boolean;
}

export default function TranscriptionModal({ open, onClose, onSubmit, loading }: TranscriptionModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      urlSchema.parse(url);
      await onSubmit(url, title);
      setUrl('');
      setTitle('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    }
  };

  const detectPlatform = (url: string): string | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    return null;
  };

  const platform = detectPlatform(url);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Link2 className="h-4 w-4 text-primary-foreground" />
            </div>
            Nueva transcripción
          </DialogTitle>
          <DialogDescription>
            Pega la URL del video que quieres transcribir
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL del video</Label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-20"
              />
              {platform && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  {platform}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Soporta YouTube, TikTok e Instagram
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              placeholder="Mi transcripción"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-bg hover:opacity-90" disabled={loading || !url}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Transcribir'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
