'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  MessageSquare, 
  Clock, 
  Calendar, 
  ShoppingCart, 
  ArrowRight,
  Play,
  Building2,
  Scale,
  Store
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Asistente Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-slate-600">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="#registro">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Un asistente virtual que{' '}
              <span className="text-blue-600">nunca descansa</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Responde automáticamente a tus clientes, agenda citas y toma pedidos las 24 horas. 
              Perfecto para consultorios, abogados, tiendas locales y cualquier negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#registro">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Crear mi asistente gratis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Ver cómo funciona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            ¿Qué puede hacer tu asistente?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Responde automáticamente</h3>
              <p className="text-slate-600">Contesta preguntas frecuentes y atiende consultas de clientes sin intervención humana.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Agenda citas</h3>
              <p className="text-slate-600">Tus clientes pueden agendar citas directamente desde el chat, disponible 24/7.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Toma pedidos</h3>
              <p className="text-slate-600">Recibe pedidos y consultas de productos incluso cuando tu negocio está cerrado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2 text-slate-800">Crea tu cuenta</h3>
              <p className="text-sm text-slate-600">Regístrate gratis y configura tu negocio en minutos.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2 text-slate-800">Entrena tu asistente</h3>
              <p className="text-sm text-slate-600">Sube información sobre tus productos, servicios y FAQs.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2 text-slate-800">Conecta canales</h3>
              <p className="text-sm text-slate-600">Activa Telegram, WhatsApp o inserta el chat en tu web.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-semibold mb-2 text-slate-800">¡Listo!</h3>
              <p className="text-sm text-slate-600">Tu asistente trabaja 24/7 atendiendo clientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Ideal para</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-none shadow-sm bg-white text-center">
              <CardContent className="pt-6">
                <Building2 className="w-10 h-10 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Consultorios</h3>
                <p className="text-slate-600 text-sm">Agenda citas médicas y responde consultas sobre servicios y horarios.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white text-center">
              <CardContent className="pt-6">
                <Scale className="w-10 h-10 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Abogados</h3>
                <p className="text-slate-600 text-sm">Atiende consultas legales básicas y agenda consultas con potenciales clientes.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white text-center">
              <CardContent className="pt-6">
                <Store className="w-10 h-10 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Tiendas locales</h3>
                <p className="text-slate-600 text-sm">Recibe pedidos, consulta de precios y disponibilidad de productos.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="registro" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-xl bg-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Crea tu asistente virtual</CardTitle>
                <CardDescription>Gratis, sin tarjeta de crédito</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del negocio *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Consultorio Dr. Pérez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (para login) *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repetir contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
                    <Input
                      id="telefono"
                      placeholder="+58 412 1234567"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creando...' : 'Crear mi asistente gratis'}
                  </Button>
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-slate-600">
                      ¿Ya tienes una cuenta?{' '}
                      <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
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
      <footer className="border-t py-8 mt-auto bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Asistente Pro</span>
          </div>
          <p className="text-sm text-slate-500">Tu asistente virtual que nunca descansa.</p>
        </div>
      </footer>
    </div>
  );
}

