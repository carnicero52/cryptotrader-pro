'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Store,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  puestoBuscado?: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  modoBot: string;
}

export default function ChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNegocio();
  }, [slug]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadNegocio = async () => {
    try {
      const response = await fetch(`/api/negocio/${slug}`);
      const data = await response.json();
      
      if (response.ok && data.negocio) {
        setNegocio(data.negocio);
        // Mensaje de bienvenida
        setMessages([
          {
            role: 'assistant',
            content: `¡Hola! Soy el asistente virtual de **${data.negocio.nombre}**. ¿En qué puedo ayudarte hoy?`,
            timestamp: new Date()
          }
        ]);
      } else {
        setError(data.error || 'Negocio no encontrado');
      }
    } catch {
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Agregar mensaje del usuario
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (response.ok && data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Error del bot
        const errorMessage: Message = {
          role: 'assistant',
          content: data.error || 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, hubo un error de conexión. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-slate-600">Cargando asistente...</p>
        </div>
      </div>
    );
  }

  if (error || !negocio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <Card className="w-full max-w-md border-none shadow-lg text-center">
          <CardContent className="pt-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600">{error || 'Negocio no encontrado'}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-slate-800 text-lg">{negocio.nombre}</h1>
              {negocio.descripcion && (
                <p className="text-sm text-slate-600">{negocio.descripcion}</p>
              )}
              {!negocio.descripcion && negocio.puestoBuscado && (
                <p className="text-sm text-slate-600">{negocio.puestoBuscado}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-4 max-w-3xl">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-white border shadow-sm rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-slate-600">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t sticky bottom-0">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={sending}
              className="flex-1 rounded-full border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <Button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-full w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-2">
            Asistente virtual powered by IA
          </p>
        </div>
      </footer>
    </div>
  );
}
