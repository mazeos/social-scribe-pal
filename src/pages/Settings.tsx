import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Eye, EyeOff, Key, Save, Trash2, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  key_name: string;
  key_value: string;
  created_at: string;
  updated_at: string;
}

const TRANSCRIPTION_KEYS = [
  { name: 'OPENAI_API_KEY', label: 'OpenAI API Key', description: 'Para transcripciones con Whisper' },
  { name: 'SUPADATA_API_KEY', label: 'Supadata API Key', description: 'Para extraer audio de videos' },
];

const ANALYSIS_KEYS = [
  { name: 'GEMINI_API_KEY', label: 'Google Gemini API Key', description: 'Para análisis con Gemini' },
  { name: 'CLAUDE_API_KEY', label: 'Anthropic Claude API Key', description: 'Para análisis con Claude' },
];

type AnalysisProvider = 'gemini' | 'claude';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [analysisProvider, setAnalysisProvider] = useState<AnalysisProvider>('gemini');
  const [savingProvider, setSavingProvider] = useState(false);

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
      
      // Get analysis provider preference
      const providerKey = data?.find(k => k.key_name === 'ANALYSIS_PROVIDER');
      if (providerKey) {
        setAnalysisProvider(providerKey.key_value as AnalysisProvider);
      }
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

  const handleProviderChange = async (provider: AnalysisProvider) => {
    // Check if the required API key is configured for the selected provider
    if (provider === 'gemini' && !isKeyConfigured('GEMINI_API_KEY')) {
      toast.error('Primero configura tu API key de Gemini');
      return;
    }
    if (provider === 'claude' && !isKeyConfigured('CLAUDE_API_KEY')) {
      toast.error('Primero configura tu API key de Claude');
      return;
    }

    setSavingProvider(true);
    try {
      const existingKey = apiKeys.find(k => k.key_name === 'ANALYSIS_PROVIDER');

      if (existingKey) {
        const { error } = await supabase
          .from('user_api_keys')
          .update({ key_value: provider })
          .eq('id', existingKey.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_api_keys')
          .insert({
            user_id: user!.id,
            key_name: 'ANALYSIS_PROVIDER',
            key_value: provider
          });

        if (error) throw error;
      }

      setAnalysisProvider(provider);
      toast.success(`Proveedor de análisis: ${provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}`);
      await fetchApiKeys();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Error al guardar el proveedor');
    } finally {
      setSavingProvider(false);
    }
  };

  const isKeyConfigured = (keyName: string) => {
    return apiKeys.some(k => k.key_name === keyName);
  };

  const renderApiKeyInput = (name: string, label: string, description: string) => (
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
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Transcription API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys de Transcripción
            </CardTitle>
            <CardDescription>
              Configura tus propias API keys para los servicios de transcripción.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando...
              </div>
            ) : (
              TRANSCRIPTION_KEYS.map(({ name, label, description }) => 
                renderApiKeyInput(name, label, description)
              )
            )}
          </CardContent>
        </Card>

        {/* Analysis Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Proveedor de IA para Análisis
            </CardTitle>
            <CardDescription>
              Elige qué modelo de IA usará para analizar tus transcripciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={analysisProvider} 
              onValueChange={(value) => handleProviderChange(value as AnalysisProvider)}
              className="space-y-3"
              disabled={savingProvider}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Google Gemini</span>
                    {isKeyConfigured('GEMINI_API_KEY') && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                        API Key configurada
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa tu propia API key de Google AI Studio.
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="claude" id="claude" />
                <Label htmlFor="claude" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Anthropic Claude</span>
                    {isKeyConfigured('CLAUDE_API_KEY') && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                        API Key configurada
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa tu propia API key de Anthropic.
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {/* API Keys for selected provider */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-4">
                Configurar API Key
              </h4>
              {analysisProvider === 'gemini' && 
                renderApiKeyInput('GEMINI_API_KEY', 'Google Gemini API Key', 'Obtén tu key en Google AI Studio')
              }
              {analysisProvider === 'claude' && 
                renderApiKeyInput('CLAUDE_API_KEY', 'Anthropic Claude API Key', 'Obtén tu key en console.anthropic.com')
              }
            </div>
          </CardContent>
        </Card>

        {/* Help section */}
        <div className="p-4 bg-muted/50 rounded-lg">
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
            <li>
              <strong>Google Gemini:</strong>{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                aistudio.google.com/app/apikey
              </a>
            </li>
            <li>
              <strong>Anthropic Claude:</strong>{' '}
              <a 
                href="https://console.anthropic.com/settings/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                console.anthropic.com/settings/keys
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
