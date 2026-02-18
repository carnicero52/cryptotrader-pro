'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  Users, 
  QrCode, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Store,
  UserCheck,
  BellRing,
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
    puestoBuscado: '',
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
          puestoBuscado: formData.puestoBuscado || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu organización ha sido registrada. Redirigiendo al panel...',
      });

      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al registrar la organización',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">ContrataFácil</span>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Panel</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Recepción de CVs simplificada
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Recibe currículums de forma{' '}
              <span className="text-emerald-600">fácil y organizada</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-4">
              <strong>Tu organización tiene un link único.</strong> Los aspirantes entran, llenan sus datos y tú los ves en tu panel.
            </p>
            <p className="text-base text-slate-500 mb-8 max-w-2xl mx-auto">
              Sin papeles, sin emails desordenados. Un solo lugar para recibir y gestionar todos los candidatos a trabajar en tu organización.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#registro">
                <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                  Registrar mi organización
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline">
                  ¿Cómo funciona?
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
            Todo lo que necesitas para contratar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Link + QR Único</h3>
                <p className="text-slate-600 text-sm">Tu organización tiene un link y código QR exclusivo para compartir.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Formulario Simple</h3>
                <p className="text-slate-600 text-sm">Los aspirantes llenan sus datos y suben su CV en segundos.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Panel Organizado</h3>
                <p className="text-slate-600 text-sm">Ve todos los candidatos, filtra por estado y descarga CVs.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <BellRing className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Notificaciones</h3>
                <p className="text-slate-600 text-sm">Recibe alertas cuando alguien nuevo aplique a tu vacante.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/30">1</div>
              <h3 className="font-semibold mb-2 text-slate-800">Registra tu organización</h3>
              <p className="text-sm text-slate-600">Crea tu cuenta en segundos con los datos básicos de tu organización.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/30">2</div>
              <h3 className="font-semibold mb-2 text-slate-800">Comparte tu link</h3>
              <p className="text-sm text-slate-600">Imprime tu QR o comparte el link en tus redes y mostrador.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/30">3</div>
              <h3 className="font-semibold mb-2 text-slate-800">Recibe candidatos</h3>
              <p className="text-sm text-slate-600">Los aspirantes entran y llenan el formulario con sus datos.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/30">4</div>
              <h3 className="font-semibold mb-2 text-slate-800">¡Contrata!</h3>
              <p className="text-sm text-slate-600">Revisa perfiles, descarga CVs y contacta a los mejores candidatos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow visualization */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-slate-800">Flujo del Sistema</CardTitle>
                <CardDescription>Simple y directo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">1. Tú (Organización)</h3>
                    <p className="text-sm text-slate-600">Registras tu organización y activas "Busco personal". El sistema te da un link y QR.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">2. Aspirantes</h3>
                    <p className="text-sm text-slate-600">Entran a tu link, ven qué buscas, llenan el formulario y suben su CV.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">3. Tú revisas</h3>
                    <p className="text-sm text-slate-600">En tu panel ves todos los candidatos, sus datos, CVs y los organizas por estado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">4. ¡Contratas!</h3>
                    <p className="text-sm text-slate-600">Contactas a los mejores candidatos y los marcas como "contratados" en el sistema.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="registro" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-slate-800">Registra tu organización</CardTitle>
                <CardDescription>Comienza a recibir candidatos en menos de 2 minutos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la organización *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Café del Centro"
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
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puestoBuscado">¿Qué puesto buscas?</Label>
                    <Input
                      id="puestoBuscado"
                      placeholder="Ej: Cajero, Mesero, Vendedor..."
                      value={formData.puestoBuscado}
                      onChange={(e) => setFormData({ ...formData, puestoBuscado: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registrando...' : 'Registrar mi organización'}
                  </Button>
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
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">ContrataFácil</span>
          </div>
          <p className="text-sm text-slate-500">Sistema de recepción de CVs para pequeñas organizaciones.</p>
        </div>
      </footer>
    </div>
  );
}
