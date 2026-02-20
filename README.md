# 📈 CryptoTrader Pro

Aplicación de trading personal conectada a Binance API con Paper Trading y Trading Real.

## ✨ Características

### Trading
- 🧪 **Paper Trading** - $10,000 USD ficticios para practicar sin riesgo
- 💰 **Trading Real** - Conexión con API de Binance para operar con dinero real
- 📊 **50+ Criptomonedas** - Precios en tiempo real de Binance
- 📈 **Gráficos de velas** - Candlestick charts interactivos
- 📉 **Indicadores técnicos** - RSI, MACD, SMA 20/50
- 🔔 **Alertas de precio** - Notificaciones cuando el precio llega a un nivel

### Panel de Control
- 💵 Balance y valor del portfolio en tiempo real
- 📋 Historial completo de transacciones
- ⭐ Watchlist personalizada
- 📊 P/L (Profit/Loss) en vivo

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: SQLite (dev) / Turso (producción) con Prisma ORM
- **API**: Binance REST API
- **Gráficos**: lightweight-charts, SVG

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── prices/          # Precios de criptos desde Binance
│   │   ├── candles/         # Velas e indicadores técnicos
│   │   ├── config/          # API keys de Binance (encriptadas)
│   │   ├── balance/         # Balance real de Binance
│   │   ├── orders/          # Crear/cancelar órdenes
│   │   └── alerts/          # Sistema de alertas
│   └── page.tsx             # Dashboard principal
├── lib/
│   ├── db.ts                # Prisma client con Turso
│   └── utils.ts             # Utilidades
└── components/ui/           # Componentes shadcn/ui
```

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos local (desarrollo)
DATABASE_URL=file:./dev.db

# Turso (producción)
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-token

# Encriptación de API keys
ENCRYPTION_KEY=tu-clave-secreta-32-chars
```

### API de Binance

1. Crea una cuenta en [Binance](https://binance.com)
2. Ve a API Management y crea nuevas API keys
3. Habilita permisos de "Spot Trading" y "Reading"
4. Guarda las keys en la sección Config de la app

**Para pruebas, usa Testnet:**
- URL: https://testnet.binance.vision/
- No requiere verificación KYC

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
bun install

# Configurar base de datos
bun run db:push

# Iniciar servidor
bun run dev
```

## 📱 Uso

### Paper Trading (Práctica)
1. Abre la aplicación
2. El modo Paper Trading está activo por defecto con $10,000 ficticios
3. Selecciona una criptomoneda
4. Ingresa la cantidad y ejecuta BUY o SELL
5. Practica sin riesgo real

### Trading Real
1. Ve a la pestaña "Config"
2. Ingresa tus API keys de Binance
3. Activa el modo "Real" en el header
4. Opera con tu saldo real

### Alertas de Precio
1. Ve a la pestaña "Alertas"
2. Selecciona una cripto y precio objetivo
3. Recibe notificaciones cuando se alcance

## 🔒 Seguridad

- API keys encriptadas con AES-256-CBC
- Las keys nunca se exponen al frontend
- Solo se guardan en tu propia base de datos
- Soporte para Binance Testnet (pruebas seguras)

## ⚠️ Descargo de Responsabilidad

Esta aplicación es para uso personal. El trading de criptomonedas conlleva riesgos significativos. Nunca inviertas más de lo que puedas permitirte perder. Usa Paper Trading para practicar antes de operar con dinero real.

---

Desarrollado con Next.js 16 y shadcn/ui
