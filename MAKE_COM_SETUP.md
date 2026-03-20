# 📱 Guía: Enviar Propiedad + Foto + Datos del Cliente por WhatsApp

## ✅ Cambios Realizados en el Código

### 1. **Captura de Datos Mejorada**
Cuando un cliente consulta una propiedad, ahora el sistema pide:
- ✅ Nombre completo
- ✅ Número de celular

### 2. **Información Enviada al Webhook**

Cuando se consulta una propiedad, los datos enviados a tu webhook de Make.com incluyen:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Juan Pérez",
  "telefono": "+5493462587692",
  "interes": "Departamento en Palermo",
  "origen": "NFC propiedad",
  "createdAt": "2026-03-20T14:30:00.000Z",
  "source": "vercel",
  "propiedad": {
    "titulo": "Hermoso Departamento 2 Ambientes",
    "precio": "$250.000",
    "zona": "Palermo, CABA",
    "tipo": "Departamento",
    "descripcion": "Departamento luminoso con balcón y vista a la calle...",
    "imagen": "https://cdn.example.com/properties/prop-123.jpg"
  }
}
```

### 3. **Versión sin Propiedad** (Formulario General)

Cuando se usa el formulario general (Comprar/Alquilar/Vender):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "nombre": "María García",
  "telefono": "+5491123456789",
  "interes": "comprar",
  "origen": "NFC formulario",
  "createdAt": "2026-03-20T14:35:00.000Z",
  "source": "vercel",
  "propiedad": null
}
```

---

## 🔧 Configuración en Make.com

### Paso 1: Recibir el Webhook
Ya tienes configurado un módulo "Webhooks" que recibe los datos. Continúa desde ahí.

### Paso 2: Enviar Mensaje por WhatsApp

**Opción A: Integración WhatsApp Business (Recomendado)**

Agregua un módulo "Send WhatsApp Message":

```
Configuración:
├─ Número del negocio: Tu número registrado
├─ Para: {{trigger.body.telefono}}
├─ Tipo de mensaje: Text
└─ Contenido:

👋 ¡Hola {{trigger.body.nombre}}!

Recibimos tu consulta correctamente.

📍 Propiedad de interés:
   {{trigger.body.propiedad.titulo}}

💰 Precio: {{trigger.body.propiedad.precio}}
📌 Zona: {{trigger.body.propiedad.zona}}
🏠 Tipo: {{trigger.body.propiedad.tipo}}

📸 Aquí va la foto de la propiedad

📝 Descripción:
{{trigger.body.propiedad.descripcion}}

---
Datos de contacto confirmados:
• Nombre: {{trigger.body.nombre}}
• Celular: {{trigger.body.telefono}}

¡Nuestro equipo se pondrá en contacto pronto!
```

### Paso 3: Enviar Foto (Make.com Pro)

Agrega un módulo "Send WhatsApp Media":

```
Configuración:
├─ Número del negocio: Tu número registrado
├─ Para: {{trigger.body.telefono}}
├─ Media URL: {{trigger.body.propiedad.imagen}}
├─ Media Type: image/jpeg
└─ Caption: 
    Foto de: {{trigger.body.propiedad.titulo}}
    🏠 {{trigger.body.propiedad.precio}}
```

### Paso 4: Usar Condicional para Propiedades

Si necesitas distinguir si hay propiedad o no:

```
Módulo: "Router" o "Conditional"

Condición:
├─ Si {{trigger.body.propiedad}} EXISTS
│  └─ Enviar mensaje con detalles de propiedad
│
└─ Si {{trigger.body.propiedad}} NO EXISTS
   └─ Enviar mensaje genérico de confirmación
```

### Paso 5: Guardar en Base de Datos

Agrega un módulo para actualizar tus registros:

```
Configuración:
├─ Tabla: leads
├─ Campos:
│  ├─ nombre: {{trigger.body.nombre}}
│  ├─ telefono: {{trigger.body.telefono}}
│  ├─ interes: {{trigger.body.interes}}
│  ├─ propiedad_titulo: {{trigger.body.propiedad.titulo}}
│  ├─ propiedad_precio: {{trigger.body.propiedad.precio}}
│  ├─ propiedad_imagen: {{trigger.body.propiedad.imagen}}
│  ├─ origen: {{trigger.body.origen}}
│  └─ fecha: {{trigger.body.createdAt}}
```

---

## 📋 Flujo Completo en Make.com

```
┌──────────────────────────────────┐
│  Webhook recibe datos             │
│  (Nombre, Celular, Propiedad)    │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │  Condicional │
        │Hay propiedad?│
        └──┬───────────┘
           │
      ┌────┴────────────────────────────────┐
      │          NO              │          SÍ
      │                          │
      ▼                          ▼
┌──────────────────┐    ┌─────────────────────┐
│Enviar mensaje    │    │Enviar datos         │
│genérico          │    │+ foto + descripción │
│Confirmar interés │    └──────────┬──────────┘
└────────┬─────────┘               │
         │                    ┌────▼─────┐
         │                    │Enviar Foto│
         │                    │por módulo │
         │                    │adicional  │
         │                    └────┬──────┘
         │                         │
         └──────────┬──────────────┘
                    │
              ┌─────▼──────┐
              │Guardar en  │
              │Base de Dat.│
              └─────┬──────┘
                    │
              ┌─────▼──────────┐
              │Responder al    │
              │cliente (OK)    │
              └────────────────┘
```

---

## 🧪 Test/Pruebas

### Prueba 1: Consulta de una Propiedad

1. En la web, haz clic en "Consultar" en una propiedad
2. Ingresa:
   - Nombre: "Juan Test"
   - Celular: "5491123456789"
3. Verifica en Make.com:
   - ¿Llegó el webhook?
   - ¿Tiene `propiedad`?
   - ¿Tiene `telefono` y `nombre`?

### Prueba 2: Formulario General

1. Completa el formulario principal
2. Selecciona "Comprar"
3. Verifica en Make.com:
   - ¿Llegó el webhook?
   - ¿`propiedad` es null?
   - ¿Tiene el celular?

### Prueba 3: WhatsApp

1. Espera a que Make.com envíe el mensaje
2. Verifica en tu WhatsApp:
   - ¿Recibiste el mensaje?
   - ¿Tiene los datos del cliente?
   - ¿Se envió la foto? (si aplica)

---

## 🔐 Variables Disponibles en Make.com

Usalas en tus módulos:

```
trigger.body.nombre              → Nombre del cliente
trigger.body.telefono            → Celular (completo)
trigger.body.interes             → Lo que busca (propiedad o tipo)
trigger.body.origen              → "NFC propiedad" o "NFC formulario"
trigger.body.id                  → ID único del lead
trigger.body.createdAt           → Fecha/hora del lead

trigger.body.propiedad.titulo    → Nombre de la propiedad
trigger.body.propiedad.precio    → Precio (string)
trigger.body.propiedad.zona      → Ubicación
trigger.body.propiedad.tipo      → Tipo (Depto, Casa, etc)
trigger.body.propiedad.descripcion → Descripción completa
trigger.body.propiedad.imagen    → URL de la foto
```

---

## ✨ Enhancements Opcionales

### A: Agregar emoji dinámicos
```javascript
let emoji = trigger.body.propiedad.tipo === "Departamento" ? "🏢" : "🏡";
```

### B: Personalizar por zona
```javascript
let mensaje = `¡Propiedad en ${trigger.body.propiedad.zona}! No te la pierdas 😍`;
```

### C: Agregar botón de confirmación
```
Mensaje: ¿Confirmamos tu interés?
Botones: [Sí] [Ver más] [Contactar]
```

---

## 📞 Soporte

Si algo no funciona:

1. Revisa los **Logs** de Make.com
2. Verifica que el **número de WhatsApp** esté correcto
3. Asegúrate de que el **webhook** esté activo
4. Confirma que tengas **permisos** en WhatsApp Business

---

**Última actualización:** 20 de marzo, 2026
