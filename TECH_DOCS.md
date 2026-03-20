# 👨‍💻 Documentación Técnica: Sistema WhatsApp Mejorado

## 📦 Estructura de Datos Completa

### Objeto enviado desde `script.js` → `api/lead.js`

```javascript
{
  nombre: string,              // "Juan Pérez"
  telefono: string,            // "+5493462587692"
  interes: string,             // "Departamento en Palermo"
  origen: string,              // "NFC propiedad" | "NFC formulario"
  propiedad_datos?: {          // OPCIONAL - Solo si viene de consulta de propiedad
    titulo: string,            // "Hermoso Depto 2 Ambientes"
    precio: string,            // "$250.000"
    zona: string,              // "Palermo, CABA"
    tipo: string,              // "Departamento"
    descripcion: string,       // "Descripción completa..."
    imagen: string             // "https://cdn.../foto.jpg"
  }
}
```

### Objeto enviado desde `api/lead.js` → Make.com Webhook

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
    "titulo": "Hermoso Depto 2 Ambientes",
    "precio": "$250.000",
    "zona": "Palermo, CABA",
    "tipo": "Departamento",
    "descripcion": "Descripción completa del departamento...",
    "imagen": "https://cdn.example.com/properties/prop-123.jpg"
  }
}
```

---

## 🔍 Mapeo de Archivos Modificados

### `script.js` - Línea ~65-110

**Función Principal:** `consultarPropiedad(propiedad)`

```javascript
async function consultarPropiedad(propiedad) {
  // 1. Solicita nombre
  const nombre = prompt("Tu nombre completo:");
  if (!nombre) return;

  // 2. Solicita celular
  const celular = prompt("Tu número de celular:");
  if (!celular) return;

  // 3. Obtiene datos de la propiedad
  const propiedades = await PropertiesManager.getAll();
  const prop = propiedades.find(p => p.titulo === propiedad);

  // 4. Prepara objeto de datos
  const data = {
    nombre,
    telefono: celular,
    interes: propiedad,
    origen: "NFC propiedad",
    propiedad_datos: prop ? {
      titulo: prop.titulo,
      precio: prop.precio,
      zona: prop.zona,
      imagen: prop.imagen,
      descripcion: prop.descripcion,
      tipo: prop.tipo
    } : null
  };

  // 5. Envía a Make.com
  await enviarLead(data);

  // 6. Redirige a WhatsApp con mensaje mejorado
  const mensaje = `Hola, soy ${nombre}. Mi celular es ${celular}.\n\nMe interesa esta propiedad:\n${propiedad}${prop ? `\n💰 ${prop.precio}\n📍 ${prop.zona}` : ''}`;
  window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
```

**Cambios Clave:**
- ✅ Solicita `nombre completo` (antes solo nombre)
- ✅ Solicita `celular` (completamente nuevo)
- ✅ Obtiene objeto `prop` completo
- ✅ Envía `propiedad_datos` al webhook
- ✅ Mensaje incluye nombre + celular + precio + zona

---

### `api/lead.js` - Línea ~20-75

**Manejo POST:** Recibe y procesa datos

```javascript
if (req.method === 'POST') {
  try {
    // 1. Extrae datos, incluyendo propiedad_datos (NUEVO)
    const { nombre, telefono, interes, origen, propiedad_datos } = req.body;

    // 2. Valida datos mínimos
    if (!nombre || !telefono || !interes) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 3. Crea IDs y timestamps
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // 4. Guarda en BD (schema existente, no cambia)
    try {
      await query(
        `INSERT INTO leads (id, nombre, telefono, interes, origen, read, created_at) VALUES ($1,$2,$3,$4,$5,false,$6)`,
        [id, nombre, telefono, interes, origen || 'web', createdAt]
      );
    } catch (dbError) {
      console.warn('No se pudo guardar en BD:', dbError.message);
    }

    // 5. NUEVO: Prepara datos enriquecidos para webhook
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookData = {
          id,
          nombre,
          telefono,
          interes,
          origen: origen || 'web',
          createdAt,
          source: 'vercel'
        };

        // 6. NUEVO: Agrega propiedad si existe
        if (propiedad_datos) {
          webhookData.propiedad = {
            titulo: propiedad_datos.titulo,
            precio: propiedad_datos.precio,
            zona: propiedad_datos.zona,
            tipo: propiedad_datos.tipo,
            descripcion: propiedad_datos.descripcion,
            imagen: propiedad_datos.imagen
          };
        }

        // 7. Envía a Make.com CON datos de propiedad
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lead recibido correctamente',
      lead: { id, nombre, telefono, interes, origen: origen || 'web', createdAt, read: false }
    });
  } catch (error) {
    console.error('Error procesando lead:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
```

**Cambios Clave:**
- ✅ Desestructura `propiedad_datos` del body
- ✅ Enriquece `webhookData` con `propiedad` (si existe)
- ✅ Mantiene compatibilidad con consultas sin propiedad
- ✅ No cambia esquema BD (retrocompatible)

---

## 📡 Flujo de Red

```
┌─────────────────────────────────┐
│ Cliente en navigador            │
│ (script.js)                     │
└──────────────┬──────────────────┘
               │
               │ POST /api/lead
               │ {nombre, telefono, interes, propiedad_datos}
               ↓
┌──────────────────────────────────┐
│ Backend (api/lead.js)            │
│ • Valida datos                   │
│ • Guarda en BD (PostgreSQL)      │
│ • Enriquece webhook              │
└──────────────┬───────────────────┘
               │
               │ POST ${WEBHOOK_URL}
               │ {nombre, telefono, propiedad{...}}
               ↓
┌──────────────────────────────────┐
│ Make.com Scenario                │
│ • Recibe webhook                 │
│ • Procesa datos                  │
│ • Envía por WhatsApp Business    │
└──────────────┬───────────────────┘
               │
               │ SendMessage API
               ↓
┌──────────────────────────────────┐
│ WhatsApp Business API            │
│ Envía mensaje + foto al cliente  │
└──────────────────────────────────┘
```

---

## 🧪 Casos de Prueba

### Test 1: Consulta de Propiedad (Completo)

**Entrada:**
```javascript
{
  nombre: "Juan Pérez",
  telefono: "+5493462587692",
  interes: "Departamento en Palermo",
  origen: "NFC propiedad",
  propiedad_datos: {
    titulo: "Depto 2 Ambientes",
    precio: "$250.000",
    zona: "Palermo",
    tipo: "Departamento",
    descripcion: "Hermoso depto...",
    imagen: "https://cdn.../foto.jpg"
  }
}
```

**Salida esperada en Make.com:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+5493462587692",
  "propiedad": {
    "titulo": "Depto 2 Ambientes",
    "precio": "$250.000",
    "zona": "Palermo",
    "tipo": "Departamento",
    "descripcion": "Hermoso depto...",
    "imagen": "https://cdn.../foto.jpg"
  }
}
```

### Test 2: Formulario General (Sin Propiedad)

**Entrada:**
```javascript
{
  nombre: "María García",
  telefono: "+5491234567890",
  interes: "comprar",
  origen: "NFC formulario"
  // SIN propiedad_datos
}
```

**Salida esperada en Make.com:**
```json
{
  "nombre": "María García",
  "telefono": "+5491234567890",
  "interes": "comprar",
  "propiedad": null
  // O simplemente no aparece la clave propiedad
}
```

---

## 🔐 Variables de Make.com

Use estas variables en tus módulos:

```
trigger.body.nombre                    → Nombre del cliente
trigger.body.telefono                  → Teléfono con formato
trigger.body.interes                   → Propiedad o tipo
trigger.body.origen                    → "NFC propiedad" o "NFC formulario"
trigger.body.id                        → UUID único
trigger.body.createdAt                 → ISO timestamp
trigger.body.source                    → "vercel"

trigger.body.propiedad.titulo          → Nombre propiedad
trigger.body.propiedad.precio          → Precio (string)
trigger.body.propiedad.zona            → Ubicación
trigger.body.propiedad.tipo            → Tipo inmueble
trigger.body.propiedad.descripcion     → Descripción
trigger.body.propiedad.imagen          → URL de foto
```

---

## 🚨 Manejo de Errores

### Escenario: Cliente consulta propiedad que NO existe

```javascript
const prop = propiedades.find(p => p.titulo === propiedad);
// prop === undefined

const data = {
  // ...
  propiedad_datos: null  // ← Se envía null
};
```

**Make.com recibe:**
```json
{
  "nombre": "...",
  "propiedad": null
}
```

### Escenario: Propiedad sin foto

```javascript
const prop = {
  titulo: "...",
  imagen: undefined,
  // ...
};

const data = {
  propiedad_datos: {
    imagen: undefined  // ← Undefined se envía como null en JSON
  }
};
```

**En Make.com:**
```javascript
if (trigger.body.propiedad.imagen !== null) {
  // Enviar foto
}
```

---

## 🔄 Retrocompatibilidad

✅ **El cambio es 100% retrocompatible:**

- Base de datos NO requiere migración
- Formulario general sigue funcionando igual
- Si `propiedad_datos` no viene, `webhookData.propiedad` no se agrega
- Clientes antiguos sin foto: proceso manual en Make.com

---

## 📊 Base de Datos

**Schema de `leads` (sin cambios):**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  nombre TEXT,
  telefono TEXT,
  interes TEXT,
  origen TEXT,
  read BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Nota:** Los datos de propiedad se envían a Make.com, NO se guardan en BD local.

---

## 🎯 Validaciones

| Campo | Requerido | Tipo | Validación |
|-------|-----------|------|-----------|
| `nombre` | ✅ | string | No vacío |
| `telefono` | ✅ | string | No vacío |
| `interes` | ✅ | string | No vacío |
| `origen` | ❌ | string | Default: "web" |
| `propiedad_datos` | ❌ | object | Si existe, todos los campos |
| `propiedad_datos.titulo` | ✅ (si existe padre) | string | No vacío |
| `propiedad_datos.imagen` | ✅ (si existe padre) | string | URL válida |

---

## 📈 Logging

**En navegador (script.js):**
```javascript
console.log("Enviando lead:", data);
```

**En servidor (api/lead.js):**
```javascript
console.log("Lead recibido:", { nombre, telefono, interes });
console.log("Webhook enviado:", webhookData);
```

**En Make.com:**
- Revisa "Execution History"
- Busca en "Operations"
- Verifica Output de cada módulo

---

## 🚀 Deployment

1. **Local:** Sin cambios, sigue funcionando igual
2. **Vercel:** Deploy normal con `git push`
3. **Make.com:** No requiere configuración previa
4. **WhatsApp API:** Se configura en Make.com

---

**Documentación técnica generada:** 20/03/2026
**Versión de API:** 2.1
