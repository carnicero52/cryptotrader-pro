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

### Últimos cambios subidos:
- Commit: `16c81be` - "fix: Reemplazar Python por JavaScript para PDFs y agregar fallback de BD"
- Build: ✅ Pasando correctamente

---

### WHATSAPP BUSINESS API - CREDENCIALES OBTENIDAS:

#### Cuenta de Meta:
- **Facebook nuevo creado:** ✅
- **Cuenta de Desarrollador:** ✅ Creada
- **App Name:** Asistente Pro
- **App ID:** 1439028070931380

#### WhatsApp Business:
- **Número de prueba:** +1 555 185 8512
- **Phone Number ID:** 1042171135639273
- **Mi número verificado:** +584249388632
- **Token:** EXPIRADO - Generar nuevo en:
  - https://developers.facebook.com/apps/1439028070931380/whatsapp-business-api/basic-info/

#### URLs importantes:
- Apps: https://developers.facebook.com/apps/
- Mi App: https://developers.facebook.com/apps/1439028070931380/
- WhatsApp Setup: https://developers.facebook.com/apps/1439028070931380/whatsapp-business-api/basic-info/
- Business Settings: https://business.facebook.com/settings

---

### PENDIENTE PARA CONTINUAR:

1. **Generar nuevo token de acceso** (el anterior expiró)
2. **Probar enviar mensaje de prueba**
3. **Configurar webhook** para recibir mensajes
4. **Integrar WhatsApp con el panel de Asistente Pro**

---

### CREDENCIALES DE PRUEBA (para login):
- Email: demo@bufete.com
- Password: demo123

---

### ARCHIVOS IMPORTANTES MODIFICADOS:
- `src/app/api/admin/conocimiento/route.ts` - PDF con JavaScript (pdf-parse)
- `src/app/api/admin/auth/route.ts` - Fallback de BD local
- `src/app/api/clientes/route.ts` - Fallback de BD
- `src/app/api/admin/registrar-cliente/route.ts` - Fallback de BD

---

### NEGOCIO DEL USUARIO:
- **Nombre:** Bufete Dr. Yovany Martínez
- **Giro:** Derecho Laboral
- **País:** México (usuario en Venezuela)
- **WhatsApp Business personal:** +584249388632

---

================================================================================
## PROYECTO 2: CRYPTOTRADER PRO (ACTIVO)
================================================================================

### Descripción:
Aplicación de trading personal conectada a Binance API con Paper Trading y Trading Real.

### Características implementadas:
- 🧪 **Paper Trading** - $10,000 USD ficticios para practicar
- 💰 **Trading Real** - Conexión con API de Binance
- 📊 **50+ Criptomonedas** - Precios en tiempo real
- 📈 **Gráficos de velas** - Candlestick charts con indicadores
- 📉 **Indicadores técnicos** - RSI, MACD, SMA 20/50
- 🔔 **Alertas de precio** - Notificaciones cuando el precio llega a un nivel
- 📋 **Historial** - Registro de todas las transacciones
- ⭐ **Watchlist** - Lista de favoritos
- ⚙️ **Configuración API** - Guardar API keys de Binance

### APIs creadas:
- `/api/prices` - Precios de 50+ criptos desde Binance
- `/api/candles` - Velas + indicadores técnicos
- `/api/config` - Guardar API keys (encriptadas)
- `/api/balance` - Balance real de Binance
- `/api/orders` - Crear/cancelar órdenes reales
- `/api/alerts` - Sistema de alertas de precio

### Base de datos:
- SQLite con Prisma
- Tablas: ApiConfig, UserSettings, Position, Transaction, PriceAlert, PendingOrder, Watchlist

### Estado: FUNCIONANDO ✅

### Fecha inicio: 19-Feb-2026

---
