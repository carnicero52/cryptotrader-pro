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
  ExternalLink,
  Copy,
  LogOut,
  TestTube,
  Upload,
  File,
  Loader2,
  Sparkles,
  Cpu,
  Trash2,
  QrCode,
  Share2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  modoBot: string;
  iaProvider: string;
  iaApiKey?: string;
  iaModelo?: string;
  iaTemperature: number;
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
        toast({ title: 'Notificación enviada', description: `Revisa tu ${tipo}` });
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
    if (!chatInput.trim() || chatLoading || !negocio) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug: negocio.slug, 
          message: userMessage,
          history: chatMessages 
        })
      });

      const data = await response.json();
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'No pude procesar tu mensaje.' 
      }]);
    } catch {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al conectar con el asistente. Por favor intenta de nuevo.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado` });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!negocio) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Asistente Pro</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg border-slate-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-xl bg-purple-600 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Acceder a tu panel</CardTitle>
              <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Entrar
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-4">
                ¿No tienes cuenta?{' '}
                <Link href="/#registro" className="text-blue-600 hover:underline font-medium">
                  Registra tu negocio
                </Link>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Main dashboard
  const chatUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/chat/${negocio.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">{negocio.nombre}</h1>
              <p className="text-xs text-slate-500">Panel de administración</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mr-2 hidden sm:inline">
              Ver landing
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Estado</p>
                <p className="font-semibold text-slate-800">Activo</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">IA</p>
                <p className="font-semibold text-slate-800 capitalize">{negocio.iaProvider || 'Z-AI'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Modo</p>
                <p className="font-semibold text-slate-800 capitalize">{negocio.modoBot || 'Híbrido'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Conocimiento</p>
                <p className="font-semibold text-slate-800">Configurar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="compartir" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Share2 className="w-4 h-4" />
              Compartir
            </TabsTrigger>
            <TabsTrigger value="conocimiento" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              Conocimiento
            </TabsTrigger>
            <TabsTrigger value="ia" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Cpu className="w-4 h-4" />
              IA y Modos
            </TabsTrigger>
            <TabsTrigger value="canales" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Send className="w-4 h-4" />
              Canales
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="border-slate-200 bg-white h-[500px] flex flex-col">
                  <CardHeader className="border-b border-slate-100 pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Prueba tu Asistente
                    </CardTitle>
                    <CardDescription>
                      Conversa con tu asistente para probar sus respuestas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Chat Messages */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-slate-400 py-16">
                          <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium text-slate-500">¡Hola! Soy tu asistente</p>
                          <p className="text-sm mt-2">Envía un mensaje para probar cómo respondo</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-md' 
                                : 'bg-slate-100 text-slate-700 rounded-bl-md'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-4 border-t border-slate-100">
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Escribe tu mensaje..."
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Acceso Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(chatUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir chat público
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => copyToClipboard(chatUrl, 'Link del chat')}
                    >
                      <Copy className="w-4 h-4" />
                      Copiar link del chat
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Link del Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <code className="text-xs text-slate-600 break-all">{chatUrl}</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Share Tab */}
          <TabsContent value="compartir">
            <div className="max-w-2xl space-y-6">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    Código QR
                  </CardTitle>
                  <CardDescription>
                    Comparte este código para que tus clientes accedan al chat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-6 flex justify-center">
                    <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(chatUrl)}`}
                        alt="QR Code"
                        className="w-44 h-44"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(chatUrl)}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Descargar QR
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => copyToClipboard(chatUrl, 'Link')}
                    >
                      <Copy className="w-4 h-4" />
                      Copiar Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                    Enlace del Chatbot
                  </CardTitle>
                  <CardDescription>
                    URL pública de tu asistente virtual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={chatUrl}
                      readOnly
                      className="bg-slate-50"
                    />
                    <Button 
                      onClick={() => copyToClipboard(chatUrl, 'Link')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Comparte este enlace por WhatsApp, email o redes sociales
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="conocimiento">
            <KnowledgeTab negocioId={negocio.id} />
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ia">
            <div className="max-w-2xl space-y-6">
              {/* Bot Mode */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    Modo de Operación
                  </CardTitle>
                  <CardDescription>Selecciona cómo debe comportarse el asistente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { value: 'faq', label: 'Solo FAQs', desc: 'Responde solo con información predefinida', icon: '📝' },
                      { value: 'consulta', label: 'Consultas', desc: 'Responde sobre productos/servicios', icon: '📚' },
                      { value: 'conversacional', label: 'Conversacional', desc: 'Chat natural y fluido', icon: '💬' },
                      { value: 'hibrido', label: 'Híbrido', desc: 'Combina todos los modos (Recomendado)', icon: '🔀' },
                    ].map((modo) => (
                      <button
                        key={modo.value}
                        type="button"
                        onClick={() => updateNegocio({ modoBot: modo.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          negocio.modoBot === modo.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{modo.icon} {modo.label}</div>
                        <div className="text-sm text-slate-500 mt-1">{modo.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Provider */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Proveedor de IA
                  </CardTitle>
                  <CardDescription>Selecciona el servicio de inteligencia artificial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { value: 'z-ai', label: 'Z-AI', desc: 'Incluido gratis', icon: '✨' },
                      { value: 'openai', label: 'OpenAI', desc: 'GPT-4 / GPT-3.5', icon: '🤖' },
                      { value: 'deepseek', label: 'DeepSeek', desc: 'R1 / V3', icon: '🧠' },
                    ].map((provider) => (
                      <button
                        key={provider.value}
                        type="button"
                        onClick={() => updateNegocio({ iaProvider: provider.value })}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          negocio.iaProvider === provider.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{provider.icon}</div>
                        <div className="font-semibold text-slate-800">{provider.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{provider.desc}</div>
                      </button>
                    ))}
                  </div>

                  {negocio.iaProvider !== 'z-ai' && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="space-y-2">
                        <Label>API Key de {negocio.iaProvider?.toUpperCase()}</Label>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          defaultValue={negocio.iaApiKey || ''}
                          onBlur={(e) => updateNegocio({ iaApiKey: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo (opcional)</Label>
                        <Input
                          placeholder="Ej: gpt-4, deepseek-chat"
                          defaultValue={negocio.iaModelo || ''}
                          onBlur={(e) => updateNegocio({ iaModelo: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Creativity */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Nivel de Creatividad
                  </CardTitle>
                  <CardDescription>Ajusta qué tan creativas son las respuestas del bot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((negocio.iaTemperature || 0.7) * 100)}
                      onChange={(e) => updateNegocio({ iaTemperature: parseInt(e.target.value) / 100 })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="w-16 text-center font-semibold text-blue-600">
                      {Math.round((negocio.iaTemperature || 0.7) * 100)}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>🎯 Preciso (0%)</span>
                    <span>🎨 Creativo (100%)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="canales">
            <div className="max-w-2xl space-y-6">
              {/* Telegram */}
              <Card className={`border-slate-200 bg-white ${negocio.notifTelegramActivo ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-500" />
                        Telegram
                        {negocio.notifTelegramActivo && (
                          <Badge className="bg-blue-100 text-blue-700 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Conecta un bot de Telegram</CardDescription>
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
                      <Label>Bot Token</Label>
                      <Input 
                        type="password"
                        placeholder="123456789:ABCdefGHIjklMNOpqr"
                        defaultValue={negocio.notifTelegramBotToken || ''}
                        onBlur={(e) => updateNegocio({ notifTelegramBotToken: e.target.value })}
                      />
                      <p className="text-xs text-slate-400">Obtenlo de @BotFather en Telegram</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Chat ID</Label>
                      <Input 
                        placeholder="-100123456789"
                        defaultValue={negocio.notifTelegramChatId || ''}
                        onBlur={(e) => updateNegocio({ notifTelegramChatId: e.target.value })}
                      />
                      <p className="text-xs text-slate-400">ID de tu grupo o canal</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotificacion('telegram')}
                    disabled={testingNotif === 'telegram'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingNotif === 'telegram' ? 'Enviando...' : 'Probar conexión'}
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className={`border-slate-200 bg-white ${negocio.notifWhatsappActivo ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        WhatsApp
                        {negocio.notifWhatsappActivo && (
                          <Badge className="bg-green-100 text-green-700 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Conecta WhatsApp Business API</CardDescription>
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
                      <Label>URL de la API</Label>
                      <Input 
                        placeholder="https://api.tu-servicio.com/whatsapp"
                        defaultValue={negocio.notifWhatsappApiUrl || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappApiUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input 
                        type="password"
                        placeholder="sk_xxxxx"
                        defaultValue={negocio.notifWhatsappApiKey || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappApiKey: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="configuracion">
            <div className="max-w-2xl space-y-6">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Información del negocio</CardTitle>
                  <CardDescription>Estos datos se usan para personalizar las respuestas del asistente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre del negocio</Label>
                    <Input 
                      defaultValue={negocio.nombre}
                      onBlur={(e) => updateNegocio({ nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción (para el asistente)</Label>
                    <Textarea 
                      defaultValue={negocio.descripcion || ''}
                      placeholder="Describe tu negocio para que el asistente tenga contexto..."
                      onBlur={(e) => updateNegocio({ descripcion: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono / WhatsApp</Label>
                    <Input 
                      defaultValue={negocio.telefono || ''}
                      placeholder="+58 412 1234567"
                      onBlur={(e) => updateNegocio({ telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input 
                      defaultValue={negocio.direccion || ''}
                      onBlur={(e) => updateNegocio({ direccion: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-slate-700">Asistente Pro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Knowledge Management Component
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Upload PDF */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Subir Documentos
          </CardTitle>
          <CardDescription>
            Sube PDFs y el asistente aprenderá de ellos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
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
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
              ) : (
                <File className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              )}
              <p className="text-slate-600 mb-2">
                {uploading ? 'Procesando...' : 'Haz clic para subir un PDF'}
              </p>
              <p className="text-sm text-slate-400">Máximo 10MB por archivo</p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Add text manually */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Agregar Texto Manualmente</CardTitle>
          <CardDescription>
            Pega información directamente para que el asistente la aprenda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            placeholder="Pega aquí FAQs, políticas, procedimientos, información de productos, etc..."
            className="min-h-[150px]"
          />
          <Button 
            onClick={handleAddTexto} 
            disabled={uploading || !textoManual.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Agregar Texto
          </Button>
        </CardContent>
      </Card>

      {/* Current knowledge */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conocimiento Actual</CardTitle>
              <CardDescription>
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
          {/* Uploaded files */}
          {archivos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">Documentos:</h4>
              <div className="space-y-2">
                {archivos.map((archivo, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-slate-700">{archivo.nombre}</p>
                        <p className="text-xs text-slate-400">
                          {archivo.caracteres.toLocaleString()} caracteres
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content preview */}
          {conocimiento && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">Vista previa:</h4>
              <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                  {conocimiento.substring(0, 2000)}
                  {conocimiento.length > 2000 && '\n\n... (contenido truncado)'}
                </pre>
              </div>
            </div>
          )}

          {!conocimiento && (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Aún no hay conocimiento cargado</p>
              <p className="text-sm mt-1">Sube PDFs o agrega texto para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
