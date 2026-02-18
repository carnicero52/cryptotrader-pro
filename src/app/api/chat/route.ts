import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Inicializar ZAI
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Construir el prompt del sistema basado en el negocio y modo
function buildSystemPrompt(negocio: {
  nombre: string;
  descripcion?: string | null;
  puestoBuscado?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  requisitos?: string | null;
  modoBot: string;
}) {
  const basePrompt = `Eres el asistente virtual de "${negocio.nombre}".
${negocio.descripcion ? `Descripción del negocio: ${negocio.descripcion}` : ''}
${negocio.puestoBuscado ? `Están buscando: ${negocio.puestoBuscado}` : ''}
${negocio.direccion ? `Dirección: ${negocio.direccion}` : ''}
${negocio.telefono ? `Teléfono: ${negocio.telefono}` : ''}
${negocio.whatsapp ? `WhatsApp: ${negocio.whatsapp}` : ''}
${negocio.requisitos ? `Requisitos de contratación: ${negocio.requisitos}` : ''}

INSTRUCCIONES IMPORTANTES:
- Eres amable, profesional y servicial
- Respondes en español
- Si no sabes algo, dilo honestamente y ofrece alternativas
- Si preguntan por trabajo o vacantes, guíalos amablemente
- Mantén las respuestas concisas pero útiles
- Usa un tono cercano pero profesional`;

  // Personalizar según el modo
  const modePrompts: Record<string, string> = {
    faq: `\n\nMODO FAQ: Responde principalmente con información predefinida sobre el negocio. Si la pregunta no está relacionada con FAQs conocidas, indica amablemente que puedes ayudar con información sobre el negocio.`,
    citas: `\n\nMODO CITAS: Estás enfocado en agendar citas. Si el usuario quiere agendar, pide nombre, fecha preferida y contacto. Indica que tomará su solicitud y alguien le confirmará.`,
    consulta: `\n\nMODO CONSULTA: Estás enfocado en responder consultas sobre productos o servicios del negocio. Sé informativo y detallado sobre lo que ofrece el negocio.`,
    conversacional: `\n\nMODO CONVERSACIONAL: Mantén una conversación natural y fluida. Puedes hablar de temas generales mientras mantienes el contexto del negocio.`,
    hibrido: `\n\nMODO HÍBRIDO: Puedes manejar cualquier tipo de interacción: responder FAQs, agendar citas, resolver consultas, o simplemente conversar. Adapta tu respuesta según lo que necesite el usuario.`
  };

  return basePrompt + (modePrompts[negocio.modoBot] || modePrompts.hibrido);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, message, history = [] } = body;

    if (!slug || !message) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener información del negocio
    const negocio = await db.negocio.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        puestoBuscado: true,
        direccion: true,
        telefono: true,
        whatsapp: true,
        requisitos: true,
        modoBot: true,
        iaProvider: true,
        iaApiKey: true,
        iaModelo: true,
        iaTemperature: true
      }
    });

    if (!negocio) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      );
    }

    // Construir el prompt del sistema
    const systemPrompt = buildSystemPrompt(negocio);

    // Construir mensajes para el LLM
    // NOTA: z-ai-web-dev-sdk usa 'assistant' para el system prompt
    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: systemPrompt }
    ];

    // Agregar historial (últimos 10 mensajes para no exceder contexto)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      }
    }

    // Agregar mensaje actual
    messages.push({ role: 'user', content: message });

    // Obtener instancia de ZAI
    const zai = await getZAI();

    // Crear completion
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No se pudo generar una respuesta' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error en chat API:', error);
    
    // Respuesta de fallback amigable
    return NextResponse.json({
      response: 'Lo siento, estoy teniendo problemas técnicos en este momento. Por favor intenta de nuevo más tarde o contacta directamente al negocio.'
    });
  }
}
