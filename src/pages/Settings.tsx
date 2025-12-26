import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Key, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  key_name: string;
  key_value: string;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_KEYS = [
  { name: 'OPENAI_API_KEY', label: 'OpenAI API Key', description: 'Para transcripciones con Whisper' },
  { name: 'SUPADATA_API_KEY', label: 'Supadata API Key', description: 'Para extraer audio de videos' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .order('key_name');

      if (error) throw error;

      setApiKeys(data || []);
      
      // Initialize key values from existing keys
      const values: Record<string, string> = {};
      data?.forEach(key => {
        values[key.key_name] = key.key_value;
      });
      setKeyValues(values);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error al cargar las API keys');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (keyName: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyName)) {
        next.delete(keyName);
      } else {
        next.add(keyName);
      }
      return next;
    });
  };

  const handleSaveKey = async (keyName: string) => {
    const value = keyValues[keyName]?.trim();
    
    if (!value) {
      toast.error('Ingresa un valor para la API key');
      return;
    }

    setSaving(keyName);
    try {
      const existingKey = apiKeys.find(k => k.key_name === keyName);

      if (existingKey) {
        const { error } = await supabase
          .from('user_api_keys')
          .update({ key_value: value })
          .eq('id', existingKey.id);

        if (error) throw error;
        toast.success('API key actualizada');
      } else {
        const { error } = await supabase
          .from('user_api_keys')
          .insert({
            user_id: user!.id,
            key_name: keyName,
            key_value: value
          });

        if (error) throw error;
        toast.success('API key guardada');
      }

      await fetchApiKeys();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Error al guardar la API key');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (keyName: string) => {
    const existingKey = apiKeys.find(k => k.key_name === keyName);
    if (!existingKey) return;

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', existingKey.id);

      if (error) throw error;
      
      setKeyValues(prev => {
        const next = { ...prev };
        delete next[keyName];
        return next;
      });
      
      toast.success('API key eliminada');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error al eliminar la API key');
    }
  };

  const isKeyConfigured = (keyName: string) => {
    return apiKeys.some(k => k.key_name === keyName);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configura tus propias API keys para los servicios de transcripción. 
              Estas keys se usan en lugar de las del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando...
              </div>
            ) : (
              AVAILABLE_KEYS.map(({ name, label, description }) => (
                <div key={name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {label}
                      </label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    {isKeyConfigured(name) && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                        Configurada
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={visibleKeys.has(name) ? 'text' : 'password'}
                        placeholder={`Ingresa tu ${label}`}
                        value={keyValues[name] || ''}
                        onChange={(e) => setKeyValues(prev => ({
                          ...prev,
                          [name]: e.target.value
                        }))}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {visibleKeys.has(name) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => handleSaveKey(name)}
                      disabled={saving === name}
                    >
                      {saving === name ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    {isKeyConfigured(name) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteKey(name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">
            ¿Cómo obtener las API keys?
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <strong>OpenAI:</strong>{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>
              <strong>Supadata:</strong>{' '}
              <a 
                href="https://supadata.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                supadata.ai
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
