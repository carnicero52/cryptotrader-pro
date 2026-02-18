'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Briefcase, 
  Users, 
  QrCode, 
  Link2, 
  Download, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Copy,
  Settings,
  FileText,
  MessageSquare,
  Share2,
  LogOut,
  User,
  Calendar,
  GraduationCap,
  Briefcase as BriefcaseIcon,
  Bell,
  Send,
  Table,
  TestTube,
  Trash,
  Trash2,
  Cpu,
  Bot,
  Sparkles,
  Slider
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidato {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  puestoSolicitado?: string;
  experiencia?: string;
  educacion?: string;
  habilidades?: string;
  experienciaDetallada?: string;
  disponibilidad?: string;
  cvUrl?: string;
  fotoUrl?: string;
  estado: string;
  notas?: string;
  createdAt: string;
}

interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  puestoBuscado?: string;
  requisitos?: string;
  whatsapp?: string;
  buscandoPersonal: boolean;
  // Configuración IA
  modoBot: string;
  iaProvider: string;
  iaApiKey?: string;
  iaModelo?: string;
  iaTemperature: number;
  faqContenido?: string;
  // Notificaciones
  notifTelegramActivo: boolean;
  notifTelegramBotToken?: string;
  notifTelegramChatId?: string;
  notifEmailActivo: boolean;
  notifEmailSmtp?: string;
  notifEmailPuerto?: number;
  notifEmailUsuario?: string;
  notifEmailPassword?: string;
  notifEmailRemitente?: string;
  notifWhatsappActivo: boolean;
  notifWhatsappApiUrl?: string;
  notifWhatsappApiKey?: string;
  notifWhatsappNumero?: string;
  // Google Sheets
  googleSheetsActivo: boolean;
  googleSheetsId?: string;
  googleSheetsApiKey?: string;
}

export default function AdminPage() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [testingNotif, setTestingNotif] = useState<string | null>(null);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const loadCandidatos = useCallback(async () => {
    try {
      const response = await fetch('/api/candidatos');
      const data = await response.json();
      setCandidatos(data.candidatos || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.negocio) {
        setNegocio(data.negocio);
        loadCandidatos();
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [loadCandidatos]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (!negocio) return;
    
    const interval = setInterval(() => {
      loadCandidatos();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [negocio, loadCandidatos]);

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
        loadCandidatos();
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
    setCandidatos([]);
    toast({ title: 'Sesión cerrada' });
  };

  const copyLink = () => {
    if (!negocio) return;
    const url = `${window.location.origin}/aplicar/${negocio.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado', description: 'El link se copió al portapapeles' });
  };

  const updateCandidatoEstado = async (id: string, nuevoEstado: string) => {
    try {
      await fetch(`/api/candidatos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      setCandidatos(prev => prev.map(c => 
        c.id === id ? { ...c, estado: nuevoEstado } : c
      ));
      
      if (selectedCandidato?.id === id) {
        setSelectedCandidato({ ...selectedCandidato, estado: nuevoEstado });
      }

      toast({ title: 'Estado actualizado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    }
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

  const exportarCandidatos = () => {
    window.location.href = '/api/candidatos/exportar';
  };

  const eliminarCandidato = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este candidato?')) return;
    
    try {
      const response = await fetch(`/api/candidatos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCandidatos(prev => prev.filter(c => c.id !== id));
        if (selectedCandidato?.id === id) {
          setSelectedCandidato(null);
        }
        toast({ title: 'Candidato eliminado' });
      } else {
        toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const limpiarLista = async () => {
    if (candidatos.length === 0) {
      toast({ title: 'No hay candidatos para eliminar' });
      return;
    }
    
    if (!confirm(`¿Eliminar TODOS los ${candidatos.length} candidatos?\n\nEsta acción no se puede deshacer. Te recomendamos exportar antes.`)) return;
    
    try {
      const response = await fetch('/api/candidatos', {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        setCandidatos([]);
        setSelectedCandidato(null);
        toast({ title: 'Lista limpiada', description: `${result.eliminados || candidatos.length} candidatos eliminados` });
      } else {
        toast({ title: 'Error', description: 'No se pudo limpiar la lista', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al limpiar lista', variant: 'destructive' });
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

  const getEstadoColor = (estado: string) => {
    const colores: Record<string, string> = {
      nuevo: 'bg-blue-100 text-blue-700',
      revisado: 'bg-amber-100 text-amber-700',
      contactado: 'bg-purple-100 text-purple-700',
      contratado: 'bg-green-100 text-green-700',
      rechazado: 'bg-red-100 text-red-700'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      nuevo: 'Nuevo',
      revisado: 'Revisado',
      contactado: 'Contactado',
      contratado: 'Contratado',
      rechazado: 'Rechazado'
    };
    return labels[estado] || estado;
  };

  const candidatosFiltrados = candidatos.filter(c => {
    const matchEstado = filterEstado === 'todos' || c.estado === filterEstado;
    const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const stats = {
    total: candidatos.length,
    nuevos: candidatos.filter(c => c.estado === 'nuevo').length,
    revisados: candidatos.filter(c => c.estado === 'revisado').length,
    contratados: candidatos.filter(c => c.estado === 'contratado').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle>Acceder a tu panel</CardTitle>
            <CardDescription>Ingresa tus credenciales</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="••••••" required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Entrar
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿No tienes cuenta?{' '}
              <a href="/" className="text-emerald-600 hover:underline">Registra tu organización</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">{negocio.nombre}</h1>
              <p className="text-xs text-slate-500">{negocio.puestoBuscado || 'Buscando personal'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportarCandidatos} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={limpiarLista} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpiar lista</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total candidatos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.nuevos}</p>
                  <p className="text-xs text-muted-foreground">Nuevos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.revisados}</p>
                  <p className="text-xs text-muted-foreground">Revisados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.contratados}</p>
                  <p className="text-xs text-muted-foreground">Contratados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="candidatos" className="space-y-6">
          <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="candidatos" className="gap-2">
              <Users className="w-4 h-4" />
              Candidatos
            </TabsTrigger>
            <TabsTrigger value="compartir" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartir
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="integraciones" className="gap-2">
              <Table className="w-4 h-4" />
              Integraciones
            </TabsTrigger>
            <TabsTrigger value="ia" className="gap-2">
              <Bot className="w-4 h-4" />
              IA y Modos
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Candidatos Tab */}
          <TabsContent value="candidatos">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="py-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nombre o email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['todos', 'nuevo', 'revisado', 'contactado', 'contratado', 'rechazado'].map(estado => (
                          <Button
                            key={estado}
                            variant={filterEstado === estado ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterEstado(estado)}
                            className={filterEstado === estado ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                          >
                            {estado === 'todos' ? 'Todos' : getEstadoLabel(estado)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {candidatosFiltrados.length === 0 ? (
                    <Card className="border-none shadow-sm">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No hay candidatos aún</p>
                        <p className="text-sm">Comparte tu link para recibir aplicaciones</p>
                      </CardContent>
                    </Card>
                  ) : (
                    candidatosFiltrados.map(candidato => (
                      <Card 
                        key={candidato.id} 
                        className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${
                          selectedCandidato?.id === candidato.id ? 'ring-2 ring-emerald-500' : ''
                        }`}
                        onClick={() => setSelectedCandidato(candidato)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              {candidato.fotoUrl ? (
                                <img src={candidato.fotoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-800">{candidato.nombre}</h3>
                                <Badge className={getEstadoColor(candidato.estado)}>
                                  {getEstadoLabel(candidato.estado)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{candidato.email}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                {candidato.puestoSolicitado && (
                                  <span className="flex items-center gap-1">
                                    <BriefcaseIcon className="w-3 h-3" />
                                    {candidato.puestoSolicitado}
                                  </span>
                                )}
                                {candidato.experiencia && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {candidato.experiencia} exp.
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(candidato.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {candidato.cvUrl && (
                              <div className="shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-red-600" />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                {selectedCandidato ? (
                  <Card className="border-none shadow-sm sticky top-24">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          {selectedCandidato.fotoUrl ? (
                            <img src={selectedCandidato.fotoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{selectedCandidato.nombre}</CardTitle>
                          <CardDescription>{selectedCandidato.puestoSolicitado || 'Sin puesto especificado'}</CardDescription>
                          <Badge className={`mt-2 ${getEstadoColor(selectedCandidato.estado)}`}>
                            {getEstadoLabel(selectedCandidato.estado)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-700">Contacto</h4>
                        <div className="space-y-1">
                          <a href={`mailto:${selectedCandidato.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600">
                            <Mail className="w-4 h-4" />
                            {selectedCandidato.email}
                          </a>
                          <a href={`tel:${selectedCandidato.telefono}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600">
                            <Phone className="w-4 h-4" />
                            {selectedCandidato.telefono}
                          </a>
                          {selectedCandidato.direccion && (
                            <p className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4" />
                              {selectedCandidato.direccion}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-700">Información</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedCandidato.experiencia && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4" />
                              {selectedCandidato.experiencia}
                            </div>
                          )}
                          {selectedCandidato.educacion && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <GraduationCap className="w-4 h-4" />
                              {selectedCandidato.educacion}
                            </div>
                          )}
                          {selectedCandidato.disponibilidad && (
                            <div className="flex items-center gap-2 text-slate-600 col-span-2">
                              <Calendar className="w-4 h-4" />
                              {selectedCandidato.disponibilidad}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedCandidato.habilidades && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-slate-700">Habilidades</h4>
                          <p className="text-sm text-slate-600">{selectedCandidato.habilidades}</p>
                        </div>
                      )}

                      {selectedCandidato.cvUrl && (
                        <Button 
                          className="w-full gap-2" 
                          variant="outline"
                          onClick={() => window.open(selectedCandidato.cvUrl!, '_blank')}
                        >
                          <FileText className="w-4 h-4" />
                          Ver CV
                        </Button>
                      )}

                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium text-sm text-slate-700">Cambiar estado</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateCandidatoEstado(selectedCandidato.id, 'revisado')} disabled={selectedCandidato.estado === 'revisado'}>
                            <Eye className="w-4 h-4 mr-1" /> Revisado
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateCandidatoEstado(selectedCandidato.id, 'contactado')} disabled={selectedCandidato.estado === 'contactado'}>
                            <MessageSquare className="w-4 h-4 mr-1" /> Contactado
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateCandidatoEstado(selectedCandidato.id, 'contratado')} disabled={selectedCandidato.estado === 'contratado'}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Contratado
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateCandidatoEstado(selectedCandidato.id, 'rechazado')} disabled={selectedCandidato.estado === 'rechazado'}>
                            <XCircle className="w-4 h-4 mr-1" /> Rechazado
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => eliminarCandidato(selectedCandidato.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Eliminar candidato
                        </Button>
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium text-sm text-slate-700">Notas</h4>
                        <Textarea 
                          placeholder="Agrega notas..."
                          defaultValue={selectedCandidato.notas || ''}
                          onBlur={(e) => {
                            fetch(`/api/candidatos/${selectedCandidato.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ notas: e.target.value })
                            });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-none shadow-sm">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Selecciona un candidato</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Compartir Tab */}
          <TabsContent value="compartir">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-emerald-600" />
                    Tu Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={`${window.location.origin}/aplicar/${negocio.slug}`}
                      readOnly
                      className="bg-slate-50"
                    />
                    <Button onClick={copyLink} className="shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <a href={`/aplicar/${negocio.slug}`} target="_blank" className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Ver página de aplicación
                  </a>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    Código QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/aplicar/${negocio.slug}`)}`}
                      alt="QR"
                      className="w-44 h-44"
                    />
                  </div>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    const link = document.createElement('a');
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/aplicar/${negocio.slug}`)}`;
                    link.download = `qr-${negocio.slug}.png`;
                    link.click();
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar QR
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notificaciones Tab */}
          <TabsContent value="notificaciones">
            <div className="max-w-2xl space-y-6">
              {/* Instrucciones */}
              <Card className="border-none shadow-sm bg-emerald-50 border border-emerald-200">
                <CardContent className="py-4">
                  <p className="text-sm text-emerald-800">
                    <strong>💡 Cómo funciona:</strong> Activa las notificaciones que desees recibir. 
                    Cada vez que un candidato envíe su aplicación, recibirás una alerta por los canales activos.
                  </p>
                </CardContent>
              </Card>

              {/* Telegram */}
              <Card className={`border-none shadow-sm ${negocio.notifTelegramActivo ? 'ring-2 ring-blue-500' : ''}`}>
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
                      <CardDescription>Recibe notificaciones en tu grupo de Telegram</CardDescription>
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
                      <p className="text-xs text-muted-foreground">Obtenlo de @BotFather en Telegram</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Chat ID</Label>
                      <Input 
                        placeholder="-100123456789"
                        defaultValue={negocio.notifTelegramChatId || ''}
                        onBlur={(e) => updateNegocio({ notifTelegramChatId: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">ID de tu grupo o canal</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotificacion('telegram')}
                    disabled={testingNotif === 'telegram'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingNotif === 'telegram' ? 'Enviando...' : 'Probar notificación'}
                  </Button>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className={`border-none shadow-sm ${negocio.notifEmailActivo ? 'ring-2 ring-red-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-red-500" />
                        Email (Gmail)
                        {negocio.notifEmailActivo && (
                          <Badge className="bg-red-100 text-red-700 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Recibe notificaciones por email</CardDescription>
                    </div>
                    <Switch
                      checked={negocio.notifEmailActivo}
                      onCheckedChange={(checked) => updateNegocio({ notifEmailActivo: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Servidor SMTP</Label>
                      <Input 
                        placeholder="smtp.gmail.com"
                        defaultValue={negocio.notifEmailSmtp || ''}
                        onBlur={(e) => updateNegocio({ notifEmailSmtp: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Puerto</Label>
                      <Input 
                        type="number"
                        placeholder="587"
                        defaultValue={negocio.notifEmailPuerto || 587}
                        onBlur={(e) => updateNegocio({ notifEmailPuerto: parseInt(e.target.value) || 587 })}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email / Usuario</Label>
                      <Input 
                        placeholder="tu@gmail.com"
                        defaultValue={negocio.notifEmailUsuario || ''}
                        onBlur={(e) => updateNegocio({ notifEmailUsuario: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraseña (App Password)</Label>
                      <Input 
                        type="password"
                        placeholder="abcd efgh ijkl mnop"
                        defaultValue={negocio.notifEmailPassword || ''}
                        onBlur={(e) => updateNegocio({ notifEmailPassword: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Usa una App Password de Gmail</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotificacion('email')}
                    disabled={testingNotif === 'email'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingNotif === 'email' ? 'Enviando...' : 'Probar notificación'}
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className={`border-none shadow-sm ${negocio.notifWhatsappActivo ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        WhatsApp (API Externa)
                        {negocio.notifWhatsappActivo && (
                          <Badge className="bg-green-100 text-green-700 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Usa cualquier API de WhatsApp (Twilio, MessageBird, etc.)</CardDescription>
                    </div>
                    <Switch
                      checked={negocio.notifWhatsappActivo}
                      onCheckedChange={(checked) => updateNegocio({ notifWhatsappActivo: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL de la API</Label>
                    <Input 
                      placeholder="https://api.tu-servicio.com/whatsapp/send"
                      defaultValue={negocio.notifWhatsappApiUrl || ''}
                      onBlur={(e) => updateNegocio({ notifWhatsappApiUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Ejemplo: https://api.twilio.com/2010-04-01/Accounts/.../Messages.json</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>API Key / Token</Label>
                      <Input 
                        type="password"
                        placeholder="sk_xxxxx"
                        defaultValue={negocio.notifWhatsappApiKey || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappApiKey: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tu número</Label>
                      <Input 
                        placeholder="+52 55 1234 5678"
                        defaultValue={negocio.notifWhatsappNumero || ''}
                        onBlur={(e) => updateNegocio({ notifWhatsappNumero: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotificacion('whatsapp')}
                    disabled={testingNotif === 'whatsapp'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingNotif === 'whatsapp' ? 'Enviando...' : 'Probar notificación'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integraciones Tab */}
          <TabsContent value="integraciones">
            <div className="max-w-2xl space-y-6">
              {/* Instrucciones */}
              <Card className="border-none shadow-sm bg-emerald-50 border border-emerald-200">
                <CardContent className="py-4">
                  <p className="text-sm text-emerald-800">
                    <strong>💡 Tip:</strong> Exporta tus candidatos a CSV para abrirlos en Excel o Google Sheets.
                    La sincronización automática con Google Sheets requiere configuración avanzada.
                  </p>
                </CardContent>
              </Card>

              {/* Google Sheets */}
              <Card className={`border-none shadow-sm ${negocio.googleSheetsActivo ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Table className="w-5 h-5 text-green-600" />
                        Google Sheets
                        {negocio.googleSheetsActivo && (
                          <Badge className="bg-green-100 text-green-700 ml-2">Activo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Sincroniza candidatos con Google Sheets</CardDescription>
                    </div>
                    <Switch
                      checked={negocio.googleSheetsActivo}
                      onCheckedChange={(checked) => updateNegocio({ googleSheetsActivo: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Spreadsheet ID</Label>
                      <Input 
                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                        defaultValue={negocio.googleSheetsId || ''}
                        onBlur={(e) => updateNegocio({ googleSheetsId: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Se encuentra en la URL de tu hoja</p>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input 
                        type="password"
                        placeholder="AIzaSy..."
                        defaultValue={negocio.googleSheetsApiKey || ''}
                        onBlur={(e) => updateNegocio({ googleSheetsApiKey: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Obtenlo en Google Cloud Console</p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Nota:</strong> Para escribir en Google Sheets necesitas configurar un Service Account.
                      Por ahora, usa el botón de Exportar para descargar los candidatos en CSV.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Exportar */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-600" />
                    Exportar Candidatos
                  </CardTitle>
                  <CardDescription>Descarga todos los candidatos en formato CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={exportarCandidatos} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-4 h-4" />
                    Descargar CSV
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Compatible con Excel, Google Sheets y otros programas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IA y Modos Tab */}
          <TabsContent value="ia">
            <div className="max-w-2xl space-y-6">
              {/* Instrucciones */}
              <Card className="border-none shadow-sm bg-purple-50 border border-purple-200">
                <CardContent className="py-4">
                  <p className="text-sm text-purple-800">
                    <strong>🤖 Configura tu asistente virtual:</strong> El modo de operación determina cómo responde el bot. 
                    El proveedor de IA define qué servicio usar para generar respuestas.
                  </p>
                </CardContent>
              </Card>

              {/* Modo del Bot */}
              <Card className="border-none shadow-sm">
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
                      { value: 'faq', label: '📝 Solo FAQs', desc: 'Responde solo con información predefinida' },
                      { value: 'citas', label: '📅 Solo Citas', desc: 'Agenda citas y muestra disponibilidad' },
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
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{modo.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{modo.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Proveedor de IA */}
              <Card className="border-none shadow-sm">
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
                      { value: 'z-ai', label: 'Z-AI', desc: 'Incluido gratis', color: 'emerald' },
                      { value: 'openai', label: 'OpenAI', desc: 'GPT-4 / GPT-3.5', color: 'green' },
                      { value: 'anthropic', label: 'Anthropic', desc: 'Claude', color: 'orange' },
                      { value: 'gemini', label: 'Google', desc: 'Gemini Pro', color: 'blue' },
                      { value: 'deepseek', label: 'DeepSeek', desc: 'R1 / V3', color: 'purple' },
                    ].map((provider) => (
                      <button
                        key={provider.value}
                        type="button"
                        onClick={() => updateNegocio({ iaProvider: provider.value })}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          negocio.iaProvider === provider.value
                            ? `border-${provider.color}-500 bg-${provider.color}-50 ring-2 ring-${provider.color}-200`
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{provider.label}</div>
                        <div className="text-xs text-slate-600 mt-1">{provider.desc}</div>
                      </button>
                    ))}
                  </div>

                  {negocio.iaProvider !== 'z-ai' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>API Key de {negocio.iaProvider.toUpperCase()}</Label>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          defaultValue={negocio.iaApiKey || ''}
                          onBlur={(e) => updateNegocio({ iaApiKey: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Obtén tu API Key en el portal de {negocio.iaProvider}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo (opcional)</Label>
                        <Input
                          placeholder="Ej: gpt-4, claude-3-opus, gemini-pro, deepseek-chat"
                          defaultValue={negocio.iaModelo || ''}
                          onBlur={(e) => updateNegocio({ iaModelo: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Deja vacío para usar el modelo por defecto
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Creatividad */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
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
                      value={Math.round(negocio.iaTemperature * 100)}
                      onChange={(e) => updateNegocio({ iaTemperature: parseInt(e.target.value) / 100 })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="w-16 text-center font-semibold text-purple-600">
                      {Math.round(negocio.iaTemperature * 100)}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>🎯 Preciso (0%)</span>
                    <span>🎨 Creativo (100%)</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    <strong>Recomendado:</strong> 70% para un balance entre precisión y naturalidad.
                  </p>
                </CardContent>
              </Card>

              {/* Link al Chat */}
              <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    Tu Chat Público
                  </CardTitle>
                  <CardDescription>Comparte este link para que los usuarios interactúen con tu asistente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/chat/${negocio.slug}`}
                      readOnly
                      className="bg-white"
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/chat/${negocio.slug}`);
                        toast({ title: 'Link copiado' });
                      }}
                      className="shrink-0 bg-purple-600 hover:bg-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <a 
                    href={`/chat/${negocio.slug}`} 
                    target="_blank" 
                    className="flex items-center gap-2 text-sm text-purple-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Probar el chat
                  </a>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuración Tab */}
          <TabsContent value="configuracion">
            <div className="max-w-2xl space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Información de la organización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input 
                      defaultValue={negocio.nombre}
                      onBlur={(e) => updateNegocio({ nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono / WhatsApp</Label>
                    <Input 
                      defaultValue={negocio.telefono || ''}
                      placeholder="+52 55 1234 5678"
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

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Configuración de vacante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Buscando personal</p>
                      <p className="text-sm text-muted-foreground">Activa para recibir candidatos</p>
                    </div>
                    <Switch
                      checked={negocio.buscandoPersonal}
                      onCheckedChange={(checked) => updateNegocio({ buscandoPersonal: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Puesto buscado</Label>
                    <Input 
                      defaultValue={negocio.puestoBuscado || ''}
                      placeholder="Ej: Cajero, Mesero, Vendedor..."
                      onBlur={(e) => updateNegocio({ puestoBuscado: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Requisitos (opcional)</Label>
                    <Textarea 
                      defaultValue={negocio.requisitos || ''}
                      placeholder="Ej: Experiencia previa, disponibilidad de horario..."
                      onBlur={(e) => updateNegocio({ requisitos: e.target.value })}
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
