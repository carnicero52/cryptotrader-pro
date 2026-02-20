# WORKLOG - PROYECTOS

================================================================================
## PROYECTO 1: ASISTENTE PRO (PAUSADO)
================================================================================

### Descripción:
Chatbot SaaS para negocios con IA integrada. Cada negocio puede tener su propio asistente virtual.

### Estado: PAUSADO - Pendiente revisión de Meta

### Repositorio:
- GitHub: https://github.com/carnicero52/asistente-pro
- Producción: https://asistente-pro-two.vercel.app

---

### WHATSAPP BUSINESS API - CREDENCIALES:

#### Cuenta de Meta:
- **App Name:** Asistente Pro
- **App ID:** 1439028070931380
- **Número de prueba:** +1 555 185 8512
- **Phone Number ID:** 1042171135639273
- **Token:** EXPIRADO

---

================================================================================
## PROYECTO 2: CRYPTOTRADER PRO (ACTIVO)
================================================================================

### Descripción:
Aplicación de trading personal conectada a Binance API con Paper Trading y Trading Real.

### Repositorio:
- **GitHub:** https://github.com/carnicero52/cryptotrader-pro
- **Producción:** https://my-project-five-beta-61.vercel.app

### Características implementadas:
- ✅ Paper Trading con $10,000 USD ficticios
- ✅ Trading Real con Binance API
- ✅ 50+ criptomonedas con precios en tiempo real
- ✅ Gráficos de velas (candlestick)
- ✅ Indicadores técnicos (RSI, MACD, SMA 20/50)
- ✅ Sistema de alertas de precio
- ✅ Watchlist personalizada
- ✅ Historial de transacciones
- ✅ API keys encriptadas
- ✅ CoinGecko como fallback

### APIs creadas:
- `/api/prices` - Precios de 50+ criptos (Binance + CoinGecko fallback)
- `/api/candles` - Velas + indicadores técnicos
- `/api/config` - Guardar API keys (encriptadas)
- `/api/balance` - Balance real de Binance
- `/api/orders` - Crear/cancelar órdenes reales
- `/api/alerts` - Sistema de alertas de precio

### Estado del despliegue:
- ✅ Build pasando correctamente
- ✅ Código subido a GitHub
- ✅ Variables de entorno configuradas
- ✅ Desplegado en Vercel

---

## NOTAS IMPORTANTES

1. **Paper Trading funciona sin base de datos** - Usa localStorage del navegador
2. **Trading Real requiere API keys de Binance** - Se guardan encriptadas en la BD
3. **CoinGecko como fallback** - Si Binance está bloqueado, usa CoinGecko

---

Fecha de actualización: 2026-02-20
