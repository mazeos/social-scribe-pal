import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transcription {
  id: string;
  user_id: string;
  title: string;
  url: string;
  platform: string;
  transcript: string;
  language: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export function useTranscriptions() {
  const { user, session } = useAuth();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTranscriptions = async () => {
    if (!user) {
      setTranscriptions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      toast.error('Error al cargar las transcripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, [user]);

  const createTranscription = async (url: string, title?: string) => {
    if (!session) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url, title }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al transcribir');
      }

      await fetchTranscriptions();
      toast.success('Transcripción creada');
      return data.transcription as Transcription;
    } catch (error) {
      console.error('Error creating transcription:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear transcripción');
      return null;
    }
  };

  const updateTranscription = async (id: string, updates: Partial<Transcription>) => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchTranscriptions();
      toast.success('Transcripción actualizada');
    } catch (error) {
      console.error('Error updating transcription:', error);
      toast.error('Error al actualizar');
    }
  };

  const deleteTranscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTranscriptions();
      toast.success('Transcripción eliminada');
    } catch (error) {
      console.error('Error deleting transcription:', error);
      toast.error('Error al eliminar');
    }
  };

  return {
    transcriptions,
    loading,
    createTranscription,
    updateTranscription,
    deleteTranscription,
    refetch: fetchTranscriptions,
  };
}
