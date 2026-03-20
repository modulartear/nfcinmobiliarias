# 📋 Resumen: Sistema Mejorado de Consultas por WhatsApp

## 🎯 Objetivo Logrado

El sistema ahora envía consultas de propiedades con:
✅ **Nombre completo del cliente**
✅ **Número de celular del cliente**
✅ **Foto de la propiedad**
✅ **Detalles completos** (precio, zona, tipo, descripción)

---

## 🔄 Flujo Actual

```
CLIENTE EN LA WEB
       ↓
   [Click: Consultar]
       ↓
   ┌─────────────────────┐
   │ Solicita datos:     │
   │ • Nombre           │
   │ • Celular          │
   └─────────────────────┘
       ↓
   [Datos capturados]
       ↓
   ┌──────────────────────────┐
   │ Se envía al WEBHOOK:     │
   │ • Nombre + Celular       │
   │ • Foto de propiedad      │
   │ • Precio, Zona, Tipo     │
   │ • Descripción completa   │
   └──────────────────────────┘
       ↓
    MAKE.COM
       ↓
   ┌──────────────────────────┐
   │ Procesa datos:           │
   │ Prepara mensaje:         │
   │ • Adjunta foto           │
   │ • Incluye datos cliente  │
   │ • Detalle propiedad      │
   └──────────────────────────┘
       ↓
   WHATSAPP BUSINESS API
       ↓
   ¡CLIENTE RECIBE MENSAJE CON TODO!
```

---

## 📝 Cambios Técnicos

### 1. **script.js** - Captura de datos mejorada

**ANTES:**
```javascript
async function consultarPropiedad(propiedad) {
  const nombre = prompt("Tu nombre:");
  // Solo pedía nombre, sin celular
  // No enviaba datos de la propiedad
}
```

**AHORA:**
```javascript
async function consultarPropiedad(propiedad) {
  const nombre = prompt("Tu nombre completo:");
  const celular = prompt("Tu número de celular:");
  
  // Obtiene foto y detalles de la propiedad
  const prop = propiedades.find(p => p.titulo === propiedad);
  
  // Envía información completa
  const data = {
    nombre,
    telefono: celular,
    interes: propiedad,
    origen: "NFC propiedad",
    propiedad_datos: {
      titulo: prop.titulo,
      precio: prop.precio,
      zona: prop.zona,
      imagen: prop.imagen,
      descripcion: prop.descripcion,
      tipo: prop.tipo
    }
  };
}
```

### 2. **api/lead.js** - Webhook mejorado

El webhook ahora recibe y transmite a Make.com:

```json
{
  "id": "...",
  "nombre": "Juan Pérez",
  "telefono": "+5493462587692",
  "interes": "Depto en Palermo",
  "origen": "NFC propiedad",
  "createdAt": "2026-03-20T...",
  "propiedad": {
    "titulo": "Depto 2 Amb",
    "precio": "$250.000",
    "zona": "Palermo",
    "tipo": "Departamento",
    "descripcion": "Hermoso depto...",
    "imagen": "https://cdn.../foto.jpg"  ← FOTO
  }
}
```

---

## 🔌 Cómo Configurar en Make.com

### Paso 1: Ya tienes el Webhook

Tu webhook ya está configurado para recibir.

### Paso 2: Agrega módulo WhatsApp

En tu scenario de Make.com, después del webhook:

```
[Webhook] → [Send WhatsApp Message]
```

### Paso 3: Estructura el Mensaje

En el módulo WhatsApp, configura:

**Destinatario:** `{{trigger.body.telefono}}`

**Mensaje:**
```
👋 ¡Hola {{trigger.body.nombre}}!

Recibimos tu consulta.

📍 Propiedad: {{trigger.body.propiedad.titulo}}
💰 Precio: {{trigger.body.propiedad.precio}}
📌 Zona: {{trigger.body.propiedad.zona}}
🏠 Tipo: {{trigger.body.propiedad.tipo}}

📝 Descripción:
{{trigger.body.propiedad.descripcion}}

---
Tu celular: {{trigger.body.telefono}}
¡Nuestro equipo se contactará pronto!
```

### Paso 4: Agregar Foto (Opcional Pro)

Otro módulo: `Send WhatsApp Media`

- URL: `{{trigger.body.propiedad.imagen}}`
- Caption: "Foto de: {{trigger.body.propiedad.titulo}}"

---

## 📞 Testing

Para probar antes de desplegar:

1. Ve a tu sitio web
2. Haz click en "Consultar" una propiedad
3. Ingresa:
   - Nombre: "Test Juan"
   - Celular: "+5491234567890"
4. Verifica:
   - ¿Llegó el webhook a Make.com?
   - ¿Tiene todos los datos?
   - ¿Se envió el mensaje?
   - ¿Se vio la foto?

---

## 📁 Archivos Generados/Modificados

| Archivo | Estado | Cambio |
|---------|--------|--------|
| `script.js` | ✏️ Modificado | Captura de datos mejorada |
| `api/lead.js` | ✏️ Modificado | Webhook con propiedad_datos |
| `WHATSAPP_SETUP.md` | ✨ Nuevo | Guía general |
| `MAKE_COM_SETUP.md` | ✨ Nuevo | Guía detallada Make.com |

---

## ✨ Beneficios

- 🎯 **Más información**: Cliente envía completamente identificado
- 📸 **Foto adjunta**: Agente ve la propiedad consultada
- 📱 **Mejor comunicación**: WhatsApp con contexto completo
- 💼 **Profesional**: Mensaje templado y organizado
- 🔄 **Automático**: Todo por webhook, sin intervención manual

---

## 🚀 Próximos Pasos

1. **Deploy** los cambios a Vercel (git push)
2. Accede a **Make.com**
3. **Edita tu scenario**
4. Agrega **módulo WhatsApp**
5. **Prueba** con datos de test
6. ¡**Listo!** 🎉

---

## 📌 Notas Importantes

- La foto se envía como **URL**, no como archivo
- El celular es **OBLIGATORIO** (se pide al cliente)
- Los datos se guardan en BD y se envían a Make.com
- Make.com procesa el webhook, no la web directamente
- Si no tienes API de WhatsApp en Make.com, puedes usar Twilio o MessageBird

---

**Sistema actualizado:** 20/03/2026
**Versión:** 2.1 (WhatsApp + Foto + Datos Cliente)
