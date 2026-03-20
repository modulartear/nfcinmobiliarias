# Configuración WhatsApp con Foto y Datos de Cliente

## 📋 Resumen de Cambios

El sistema ahora envía información completa al webhook de Make.com:

```json
{
  "id": "uuid-del-lead",
  "nombre": "Juan Pérez",
  "telefono": "5493462587692",
  "interes": "Departamento en Palermo",
  "origen": "NFC propiedad",
  "createdAt": "2026-03-20T10:30:00Z",
  "propiedad": {
    "titulo": "Departamento en Palermo",
    "precio": "$250.000",
    "zona": "Palermo, CABA",
    "tipo": "Departamento",
    "descripcion": "Hermoso departamento de 2 ambientes...",
    "imagen": "https://example.com/foto.jpg"
  }
}
```

## 🔧 Configuración en Make.com

Sigue estos pasos para configurar el flujo de WhatsApp:

### 1. Crear un Webhook HTTP (El que ya tienes)
- URL: `https://hook.us2.make.com/i2d5r8dwsnrweycn6b68m1c18xjkl33e`
- Método: POST
- Este es tu punto de entrada desde la web

### 2. Agregar módulo: "Send a Message" (WhatsApp)
Después del webhook, agrega un módulo WhatsApp para enviar mensajes:

**Configuración:**
- **Número de teléfono de WhatsApp**: Tu número de negocio
- **Para**: `{{trigger.telefono}}`
- **Mensaje de texto**:
```
👋 ¡Hola {{trigger.nombre}}!

Gracias por tu interés en:
📍 {{trigger.propiedad.titulo}}

💰 Precio: {{trigger.propiedad.precio}}
📌 Zona: {{trigger.propiedad.zona}}
🏠 Tipo: {{trigger.propiedad.tipo}}

📝 Descripción:
{{trigger.propiedad.descripcion}}
```

### 3. Enviar Foto (OPCIONAL - Requiere Make.com Pro)
Si tienes plan Pro de Make.com, puedes enviar la foto:

**Módulo: "Send a Media Message"**
- **Para**: `{{trigger.telefono}}`
- **Media URL**: `{{trigger.propiedad.imagen}}`
- **Caption**: 
```
Mira esta foto de la propiedad que te interesa:
{{trigger.propiedad.titulo}}
```

### 4. Guardar/Actualizar Lead
Agrega un módulo de bases de datos para mantener registro:

**Módulo: "Update a Record"**
- Base de datos: Tu DB de leads
- Campos a actualizar:
  - `nombre`: {{trigger.nombre}}
  - `telefono`: {{trigger.telefono}}
  - `whatsapp_enviado`: true
  - `timestamp_whatsapp`: now

## 📱 Flujo Alternativo: Si NO tienes API de WhatsApp

Si Make.com no tiene acceso a WhatsApp API, puedes:

### Opción A: Usar Webhook a tu servidor personalizado
Tu servidor enviaría un mensaje como:

```
👋 ¡Hola {{nombre}}!

Detalles del cliente:
• Nombre: {{nombre}}
• Celular: {{telefono}}

📍 Propiedad de interés: {{propiedad.titulo}}
💰 Precio: {{propiedad.precio}}
🏠 Zona: {{propiedad.zona}}
📸 Ver foto: {{propiedad.imagen}}
```

### Opción B: Crear un formulario de respuesta automática
Configurar un email o SMS automático con los datos.

## 🔌 Integraciones Disponibles en Make.com

Las más populares para WhatsApp:
- **WhatsApp Business API** (Recomendado)
- **Twilio** (Si uses Twilio para WhatsApp)
- **MessageBird**
- **vonage SMS/WhatsApp Gateway**

## ✅ Testing

Antes de desplegar:

1. Completa un formulario en la web:
   - Nombre: "Test Nombre"
   - Celular: "5491234567890"

2. Verifica en Make.com:
   - ¿Llegó el webhook?
   - ¿Se ejecutó correctamente?
   - ¿Qué datos tiene `{{trigger}}`?

3. Prueba el mensaje por WhatsApp:
   - ¿Llegó el mensaje?
   - ¿Se ve correcta la información?
   - ¿Se envió la foto? (si aplica)

## 📞 Datos que el Cliente Ahora Proporciona

Cuando consulta una propiedad, el cliente debe ingresar:
1. **Nombre completo** ✓
2. **Número de celular** ✓

Estos datos se envían junto con:
- Título de la propiedad
- Precio
- Zona
- Tipo
- Descripción
- URL de la foto

## 🚀 Próximos Pasos

1. Accede a https://make.com
2. Edita tu scenario/flujo
3. Agrega los módulos de WhatsApp
4. Prueba con datos de test
5. Deploy cuando esté funcionando

## 💡 Notas Importantes

- La foto se envía como URL, no como archivo adjunto (depende de Make.com)
- El nombre y celular SIEMPRE se envían (datos obligatorios)
- Si la propiedad no tienen foto, el mensaje se envía sin ella
- Los datos se guardan en la BD y en Make.com simultáneamente

---

**Necesitas ayuda?** Revisa los logs en tu dashboard de Make.com
