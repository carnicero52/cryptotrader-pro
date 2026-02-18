'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  MessageSquare, 
  BookOpen, 
  ArrowRight,
  Send,
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  LogOut,
  TestTube,
  Upload,
  File,
  X,
  Loader2,
  Sparkles,
  Cpu,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  // Configuración IA
  modoBot: string;
  iaProvider: string;
  iaApiKey?: string;
  iaModelo?: string;
  iaTemperature: number;
  // Notificaciones
  notifTelegramActivo: boolean;
  notifTelegramBotToken?: string;
  notifTelegramChatId?: string;
  notifEmailActivo: boolean;
  notifEmailSmtp?: string;
  notifEmailPuerto?: number;
  notifEmailUsuario?: string;
  notifEmailPassword?: string;
  notifWhatsappActivo: boolean;
  notifWhatsappApiUrl?: string;
  notifWhatsappApiKey?: string;
  notifWhatsappNumero?: string;
}

export default function AdminPage() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingNotif, setTestingNotif] = useState<string | null>(null);
  const { toast } = useToast();

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.negocio) {
        setNegocio(data.negocio);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      const data = await response.json();

      if (data.negocio) {
        setNegocio(data.negocio);
        toast({ title: 'Bienvenido', description: `Hola, ${data.negocio.nombre}` });
      } else {
        toast({ title: 'Error', description: data.error || 'Credenciales inválidas', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al iniciar sesión', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setNegocio(null);
    toast({ title: 'Sesión cerrada' });
  };

  const updateNegocio = async (data: Partial<Negocio>) => {
    try {
      const response = await fetch('/api/admin/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setNegocio(prev => prev ? { ...prev, ...data } : null);
        toast({ title: 'Configuración guardada' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    }
  };

  const testNotificacion = async (tipo: 'telegram' | 'email' | 'whatsapp') => {
    if (!negocio) return;
    setTestingNotif(tipo);
    
    try {
      const response = await fetch('/api/admin/test-notificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({ title: '¡Notificación enviada!', description: `Revisa tu ${tipo}` });
      } else {
        toast({ title: 'Error', description: result.error || 'No se pudo enviar', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al enviar notificación de prueba', variant: 'destructive' });
    } finally {
      setTestingNotif(null);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'No pude procesar tu mensaje.' 
      }]);
    } catch {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al conectar con el asistente.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-white">Acceder a tu panel</CardTitle>
            <CardDescription className="text-slate-400">Ingresa tus credenciales</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  required 
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••" 
                  required 
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                Entrar
              </Button>
            </form>
            <p className="text-center text-sm text-slate-400 mt-4">
              ¿No tienes cuenta?{' '}
              <a href="/" className="text-violet-400 hover:underline">Registra tu negocio</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">{negocio.nombre}</h1>
              <p className="text-xs text-slate-400">Asistente Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-violet-600">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="conocimiento" className="gap-2 data-[state=active]:bg-violet-600">
              <BookOpen className="w-4 h-4" />
              Conocimiento
            </TabsTrigger>
            <TabsTrigger value="ia" className="gap-2 data-[state=active]:bg-violet-600">
              <Cpu className="w-4 h-4" />
              IA y Modos
            </TabsTrigger>
            <TabsTrigger value="canales" className="gap-2 data-[state=active]:bg-violet-600">
              <Send className="w-4 h-4" />
              Canales
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="gap-2 data-[state=active]:bg-violet-600">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="max-w-3xl mx-auto">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-violet-400" />
                    Prueba tu Asistente
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Conversa con tu asistente para probar sus respuestas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-slate-500 py-12">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Envía un mensaje para probar tu asistente</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            msg.role === 'user' 
                              ? 'bg-violet-600 text-white' 
                              : 'bg-slate-700 text-slate-200'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 rounded-xl px-4 py-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Button onClick={sendChatMessage} disabled={chatLoading} className="bg-violet-600 hover:bg-violet-700">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Public Chat Link */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Link público de tu chat:</p>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}/chat/${negocio.slug}`}
                        readOnly
                        className="bg-slate-900 border-slate-600 text-slate-300"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/chat/${negocio.slug}`);
                          toast({ title: 'Link copiado' });
                        }}
                        className="border-slate-600 text-slate-300"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conocimiento Tab */}
          <TabsContent value="conocimiento">
            <KnowledgeTab negocioId={negocio.id} />
          </TabsContent>

          {/* IA y Modos Tab */}
          <TabsContent value="ia">
            <div className="max-w-2xl space-y-6">
              {/* Modo del Bot */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-violet-400" />
                    Modo de Operación
                  </CardTitle>
                  <CardDescription className="text-slate-400">Selecciona cómo debe comportarse el asistente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { value: 'faq', label: '📝 Solo FAQs', desc: 'Responde solo con información predefinida' },
                      { value: 'consulta', label: '📚 Consulta', desc: 'Responde consultas sobre productos/servicios' },
                      { value: 'conversacional', label: '💬 Conversacional', desc: 'Chat natural y fluido con el usuario' },
                      { value: 'hibrido', label: '🔀 Híbrido', desc: 'Combina todos los modos (Recomendado)' },
                    ].map((modo) => (
                      <button
                        key={modo.value}
                        type="button"
                        onClick={() => updateNegocio({ modoBot: modo.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          negocio.modoBot === modo.value
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-600 hover:border-violet-400 hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-white">{modo.label}</div>
                        <div className="text-sm text-slate-400 mt-1">{modo.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Proveedor de IA */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    Proveedor de IA
                  </CardTitle>
                  <CardDescription className="text-slate-400">Selecciona el servicio de inteligencia artificial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { value: 'z-ai', label: 'Z-AI', desc: 'Incluido gratis' },
                      { value: 'openai', label: 'OpenAI', desc: 'GPT-4 / GPT-3.5' },
                      { value: 'deepseek', label: 'DeepSeek', desc: 'R1 / V3' },
                    ].map((provider) => (
                      <button
                        key={provider.value}
                        type="button"
                        onClick={() => updateNegocio({ iaProvider: provider.value })}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          negocio.iaProvider === provider.value
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-600 hover:border-violet-400 hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-white">{provider.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{provider.desc}</div>
                      </button>
                    ))}
                  </div>

                  {negocio.iaProvider !== 'z-ai' && (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                      <div className="space-y-2">
                        <Label className="text-slate-300">API Key de {negocio.iaProvider.toUpperCase()}</Label>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          defaultValue={negocio.iaApiKey || ''}
                          onBlur={(e) => updateNegocio({ iaApiKey: e.target.value })}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Modelo (opcional)</Label>
                        <Input
                          placeholder="Ej: gpt-4, deepseek-chat"
                          defaultValue={negocio.iaModelo || ''}
                          onBlur={(e) => updateNegocio({ iaModelo: e.target.value })}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Creatividad */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Nivel de Creatividad
                  </CardTitle>
                  <CardDescription className="text-slate-400">Ajusta qué tan creativas son las respuestas del bot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(negocio.iaTemperature * 100)}
                      onChange={(e) => updateNegocio({ iaTemperature: parseInt(e.target.value) / 100 })}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="w-16 text-center font-semibold text-violet-400">
                      {Math.round(negocio.iaTemperature * 100)}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>🎯 Preciso (0%)</span>
                    <span>🎨 Creativo (100%)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Canales Tab */}
          <TabsContent value="canales">
            <div className="max-w-2xl space-y-6">
              {/* Telegram */}
              <Card className={`border-slate-700 bg-slate-800 ${negocio.notifTelegramActivo ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-400" />
                        Telegram
                        {negocio.notifTelegramActivo && (
                          <Badge className="bg-blue-500/20 text-blue-400 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-slate-400">Conecta un bot de Telegram</CardDescription>
                    </div>
                    <Switch
                      checked={negocio.notifTelegramActivo}
                      onCheckedChange={(checked) => updateNegocio({ notifTelegramActivo: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Bot Token</Label>
                      <Input 
                        type="password"
                        placeholder="123456789:ABCdefGHIjklMNOpqr"
                        defaultValue={negocio.notifTelegramBotToken || ''}
                        onBlur={(e) => updateNegocio({ notifTelegramBotToken: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-500">Obtenlo de @BotFather en Telegram</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Chat ID</Label>
                      <Input 
                        placeholder="-100123456789"
                        defaultValue={negocio.notifTelegramChatId || ''}
                        onBlur={(e) => updateNegocio({ notifTelegramChatId: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-500">ID de tu grupo o canal</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotificacion('telegram')}
                    disabled={testingNotif === 'telegram'}
                    className="border-slate-600 text-slate-300"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingNotif === 'telegram' ? 'Enviando...' : 'Probar conexión'}
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className={`border-slate-700 bg-slate-800 ${negocio.notifWhatsappActivo ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-400" />
                        WhatsApp
                        {negocio.notifWhatsappActivo && (
                          <Badge className="bg-green-500/20 text-green-400 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-slate-400">Conecta WhatsApp Business API</CardDescription>
                    </div>
                    <Switch
                      checked={negocio.notifWhatsappActivo}
                      onCheckedChange={(checked) => updateNegocio({ notifWhatsappActivo: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">URL de la API</Label>
                      <Input 
                        placeholder="https://api.tu-servicio.com/whatsapp"
                        defaultValue={negocio.notifWhatsappApiUrl || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappApiUrl: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">API Key</Label>
                      <Input 
                        type="password"
                        placeholder="sk_xxxxx"
                        defaultValue={negocio.notifWhatsappApiKey || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappApiKey: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuración Tab */}
          <TabsContent value="configuracion">
            <div className="max-w-2xl space-y-6">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Información del negocio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nombre</Label>
                    <Input 
                      defaultValue={negocio.nombre}
                      onBlur={(e) => updateNegocio({ nombre: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Descripción (para el asistente)</Label>
                    <Textarea 
                      defaultValue={negocio.descripcion || ''}
                      placeholder="Describe tu negocio para que el asistente tenga contexto..."
                      onBlur={(e) => updateNegocio({ descripcion: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Teléfono / WhatsApp</Label>
                    <Input 
                      defaultValue={negocio.telefono || ''}
                      placeholder="+58 412 1234567"
                      onBlur={(e) => updateNegocio({ telefono: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Dirección</Label>
                    <Input 
                      defaultValue={negocio.direccion || ''}
                      onBlur={(e) => updateNegocio({ direccion: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Componente para gestionar la base de conocimiento
function KnowledgeTab({ negocioId }: { negocioId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [conocimiento, setConocimiento] = useState('');
  const [archivos, setArchivos] = useState<Array<{nombre: string; fecha: string; caracteres: number}>>([]);
  const [textoManual, setTextoManual] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConocimiento();
  }, []);

  const loadConocimiento = async () => {
    try {
      const response = await fetch('/api/admin/conocimiento');
      const data = await response.json();
      
      if (response.ok) {
        setConocimiento(data.conocimiento || '');
        setArchivos(data.archivos || []);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el conocimiento', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/conocimiento', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({ title: 'PDF procesado', description: data.message });
        loadConocimiento();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al subir el archivo', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddTexto = async () => {
    if (!textoManual.trim()) return;
    
    setUploading(true);
    try {
      const response = await fetch('/api/admin/conocimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoManual })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({ title: 'Texto agregado' });
        setTextoManual('');
        loadConocimiento();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al agregar texto', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('¿Eliminar toda la base de conocimiento?')) return;
    
    try {
      const response = await fetch('/api/admin/conocimiento', { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Base de conocimiento limpiada' });
        setConocimiento('');
        setArchivos([]);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo limpiar', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Subir PDF */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-400" />
            Subir Documentos
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sube PDFs y el asistente aprenderá de ellos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              {uploading ? (
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-violet-500" />
              ) : (
                <File className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              )}
              <p className="text-slate-300 mb-2">
                {uploading ? 'Procesando...' : 'Haz clic para subir un PDF'}
              </p>
              <p className="text-sm text-slate-500">Máximo 10MB por archivo</p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Agregar texto manual */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Agregar Texto Manualmente</CardTitle>
          <CardDescription className="text-slate-400">
            Pega información directamente para que el asistente la aprenda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            placeholder="Pega aquí FAQs, políticas, procedimientos, etc..."
            className="bg-slate-900 border-slate-600 text-white min-h-[150px]"
          />
          <Button 
            onClick={handleAddTexto} 
            disabled={uploading || !textoManual.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Agregar Texto
          </Button>
        </CardContent>
      </Card>

      {/* Conocimiento actual */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Conocimiento Actual</CardTitle>
              <CardDescription className="text-slate-400">
                {conocimiento.length.toLocaleString()} caracteres en total
              </CardDescription>
            </div>
            {conocimiento && (
              <Button variant="destructive" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Archivos subidos */}
          {archivos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Documentos:</h4>
              <div className="space-y-2">
                {archivos.map((archivo, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-sm text-slate-300">{archivo.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {archivo.caracteres.toLocaleString()} caracteres
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview del contenido */}
          {conocimiento && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Vista previa:</h4>
              <div className="bg-slate-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs text-slate-400 whitespace-pre-wrap">
                  {conocimiento.substring(0, 2000)}
                  {conocimiento.length > 2000 && '\n\n... (contenido truncado)'}
                </pre>
              </div>
            </div>
          )}

          {!conocimiento && (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Aún no hay conocimiento cargado</p>
              <p className="text-sm">Sube PDFs o agrega texto para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
