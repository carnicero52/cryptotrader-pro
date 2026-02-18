'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Zap, 
  ArrowRight,
  Telegram,
  Phone,
  Settings,
  CheckCircle,
  Sparkles,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  });
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/negocio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada. Redirigiendo al panel...',
      });

      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al registrar la cuenta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Asistente Pro</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2 border-violet-500 text-violet-400 hover:bg-violet-500/10">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>
            <Link href="#registro">
              <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Crear Cuenta</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Potenciado con IA
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Tu asistente virtual{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">con inteligencia artificial</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-4">
              <strong>Un chatbot que aprende de tus documentos.</strong> Sube PDFs, configura tu asistente y respóndele a tus clientes 24/7.
            </p>
            <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
              Funciona en tu web, Telegram y WhatsApp. Con base de conocimiento personalizada que aprende de tus leyes, reglamentos y procedimientos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#registro">
                <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20">
                  Crear mi asistente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  ¿Cómo funciona?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Todo lo que necesitas para automatizar atención
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Base de Conocimiento</h3>
                <p className="text-slate-400 text-sm">Sube PDFs y documentos. El asistente aprende y responde basándose en tu información.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <Telegram className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Telegram</h3>
                <p className="text-slate-400 text-sm">Conecta un bot de Telegram y responde automáticamente a tus usuarios.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">WhatsApp</h3>
                <p className="text-slate-400 text-sm">Integra con WhatsApp Business para atender clientes en su app favorita.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Chat Web</h3>
                <p className="text-slate-400 text-sm">Widget de chat para tu sitio web con respuestas automáticas.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-violet-500/30">1</div>
              <h3 className="font-semibold mb-2 text-white">Crea tu cuenta</h3>
              <p className="text-sm text-slate-400">Registra tu negocio en segundos con email y contraseña.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-violet-500/30">2</div>
              <h3 className="font-semibold mb-2 text-white">Sube tus documentos</h3>
              <p className="text-sm text-slate-400">PDFs, leyes, reglamentos, manuales... El bot aprenderá de ellos.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-violet-500/30">3</div>
              <h3 className="font-semibold mb-2 text-white">Conecta canales</h3>
              <p className="text-sm text-slate-400">Activa Telegram, WhatsApp o el chat web según necesites.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-violet-500/30">4</div>
              <h3 className="font-semibold mb-2 text-white">¡Listo!</h3>
              <p className="text-sm text-slate-400">Tu asistente responde 24/7 basándose en tu conocimiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Usos comunes</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-violet-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Despachos de Abogados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">Sube leyes y reglamentos. El asistente responde consultas legales basándose en la normativa.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-violet-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Soporte Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">Sube manuales y FAQs. Los clientes obtienen respuestas automáticas a problemas comunes.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-violet-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Atención 24/7
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">Responde preguntas fuera de horario laboral. Nunca pierdas un cliente por no contestar.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="registro" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="border-none shadow-lg bg-slate-800 border border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Crea tu Asistente Pro</CardTitle>
                <CardDescription className="text-slate-400">Comienza en menos de 2 minutos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-slate-300">Nombre del negocio *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Bufete Rodríguez & Asociados"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email (para login) *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repetir contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-slate-300">Teléfono / WhatsApp</Label>
                    <Input
                      id="telefono"
                      placeholder="+58 412 1234567"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear mi asistente'}
                  </Button>
                  <div className="text-center pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400">
                      ¿Ya tienes una cuenta?{' '}
                      <Link href="/admin" className="text-violet-400 hover:text-violet-300 font-medium">
                        Accede aquí
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 mt-auto bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Asistente Pro</span>
          </div>
          <p className="text-sm text-slate-500">Tu asistente virtual con IA. Aprende de tus documentos y responde 24/7.</p>
        </div>
      </footer>
    </div>
  );
}
