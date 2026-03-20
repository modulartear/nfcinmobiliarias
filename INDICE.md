# 📋 ÍNDICE: Cambios Realizados - WhatsApp con Foto y Datos

## ¿Qué se logró?

El sistema ahora envía consultas de propiedades CON:
- ✅ **Foto de la propiedad**
- ✅ **Datos del cliente** (nombre + celular)
- ✅ **Información completa** (precio, zona, tipo, descripción)
- ✅ **Todo automatizado** en Make.com

---

## 📁 Archivos Modificados

### 1. **script.js** (Línea ~65-110)
**Cambio:** Función `consultarPropiedad()` mejorada

**Antes:**
```javascript
const nombre = prompt("Tu nombre:");
// No pedía celular
// No enviaba datos de propiedad
```

**Ahora:**
```javascript
const nombre = prompt("Tu nombre completo:");
const celular = prompt("Tu número de celular:");
// Obtiene foto, precio, zona
// Envía todo al webhook
```

✅ **Estado:** Completado

---

### 2. **api/lead.js** (Línea ~20-75)
**Cambio:** Webhook enriquecido con datos de propiedad

**Antes:**
```javascript
const { nombre, telefono, interes, origen } = req.body;
// Solo enviaba: nombre, teléfono, interés
```

**Ahora:**
```javascript
const { nombre, telefono, interes, origen, propiedad_datos } = req.body;
// Envía también: propiedad completa con foto
```

✅ **Estado:** Completado

---

## 📚 Archivos de Documentación Creados

### 1. **QUICK_START.md** ⚡
**Propósito:** Guía rápida para empezar

**Contenido:**
- Explicación del cambio
- Qué tienes que hacer
- Pasos simples
- Preguntas comunes

```
👉 LÉELO PRIMERO si quieres empezar rápido
```

---

### 2. **RESUMEN_CAMBIOS.md** 📋
**Propósito:** Resumen ejecutivo

**Contenido:**
- Objetivo logrado
- Flujo visual
- Cambios técnicos
- Beneficios

```
👉 LÉELO para entender qué cambió y por qué
```

---

### 3. **WHATSAPP_SETUP.md** 📱
**Propósito:** Guía general de WhatsApp

**Contenido:**
- Resumen de cambios
- Configuración en Make.com (general)
- Envío de foto (opcional)
- Testing

```
👉 LÉELO para saber cómo configurar WhatsApp en Make.com
```

---

### 4. **MAKE_COM_SETUP.md** 🔧
**Propósito:** Guía detallada paso a paso

**Contenido:**
- Estructura de datos completa
- 5 pasos de configuración
- Flujo visual en diagramas
- Variables disponibles
- Enhancements opcionales

```
👉 LÉELO para configurar Make.com paso a paso
```

---

### 5. **TECH_DOCS.md** 👨‍💻
**Propósito:** Documentación técnica completa

**Contenido:**
- Estructura de datos JSON
- Mapeo de archivos modificados
- Flujo de red completo
- Casos de prueba
- Variables de Make.com
- Manejo de errores
- Retrocompatibilidad
- Base de datos
- Logging

```
👉 LÉELO si eres desarrollador o necesitas entender los detalles técnicos
```

---

## 💾 Base de Datos

**✅ NO requiere cambios**

Schema de `leads` tabla sigue igual:
```sql
id  | nombre  | telefono | interes | origen | read | created_at
```

Los datos de propiedad se envían a Make.com, no se guardan localmente.

---

## 🔄 Flujo Completo

```
┌─ WEB ─────────────────────┐
│                            │
│  Cliente hace click en    │
│  "Consultar" de propiedad │
│         ↓                  │
│  Ingresa:                 │
│  • Nombre completo       │
│  • Número de celular     │
│         ↓                  │
└────────→ BACKEND ─────────┘
           │
           │ POST /api/lead
           │ {
           │   nombre: "...",
           │   telefono: "...",
           │   propiedad_datos: {
           │     imagen: "...",    ← FOTO
           │     precio: "...",
           │     ...
           │   }
           │ }
           ↓
      ┌─ MAKE.COM ─────┐
      │                 │
      │ Recibe webhook  │
      │ Procesa datos   │
      │ Envía foto      │
      │ Envía mensaje   │
      │                 │
      └──────→ WHATSAPP ┘
              │
              ↓
         CLIENTE RECIBE:
         ✅ Foto propiedad
         ✅ Precio + Zona
         ✅ Descripción
         ✅ Datos de contacto
```

---

## 📊 Datos Enviados Ahora

### Cuando consulta una propiedad:

```json
{
  "nombre": "Juan Pérez",
  "telefono": "+5493462587692",
  "interes": "Departamento en Palermo",
  "origen": "NFC propiedad",
  "propiedad": {
    "titulo": "Hermoso Depto 2 Ambientes",
    "precio": "$250.000",
    "zona": "Palermo, CABA",
    "tipo": "Departamento",
    "descripcion": "...",
    "imagen": "https://cdn.../foto.jpg"
  }
}
```

### Cuando usa formulario general:

```json
{
  "nombre": "María García",
  "telefono": "+5491234567890",
  "interes": "comprar",
  "origen": "NFC formulario",
  "propiedad": null
}
```

---

## ✅ Checklist para Usar

- [ ] **1. Hacer commit y push**
  ```bash
  git add .
  git commit -m "Feat: WhatsApp con foto y datos"
  git push
  ```

- [ ] **2. Esperar deploy en Vercel**
  - Tu sitio se actualiza automáticamente

- [ ] **3. Ir a Make.com**
  - Editar tu scenario/flujo

- [ ] **4. Agregar módulo WhatsApp**
  - Después del webhook
  - Configurar número y mensaje

- [ ] **5. Probar**
  - Ir a tu sitio
  - Consultar una propiedad
  - Verificar mensaje en WhatsApp

- [ ] **6. ¡Listo!**
  - El sistema está funcionando

---

## 📖 Cómo Leer la Documentación

**Si tienes poco tiempo:**
1. Lee **QUICK_START.md** (5 min)
2. Haz el deployment

**Si quieres entender todo:**
1. Lee **RESUMEN_CAMBIOS.md** (10 min)
2. Lee **MAKE_COM_SETUP.md** (20 min)
3. Configura en Make.com (10 min)
4. Prueba (5 min)

**Si eres developer:**
1. Revisa **TECH_DOCS.md**
2. Entiende el flujo de datos
3. Modifica según necesites

---

## 🎯 Resumen de Cambios

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| **Datos del cliente** | Solo nombre | Nombre + Celular |
| **Foto propiedad** | ❌ No se enviaba | ✅ Se envía en webhook |
| **Información enviada** | Mínima | Completa (precio, zona, tipo, descripción) |
| **Make.com recibe** | Básico | Enriquecido |
| **Mensaje WhatsApp** | Genérico | Personalizado con foto |
| **Base de datos** | Sin cambios | Sin cambios |

---

## 🚀 Próximos Pasos Inmediatos

```
1️⃣ Git commit & push
   └─> Tu código se envía a Vercel

2️⃣ Esperar 1-2 minutos
   └─> Vercel compila y deploya

3️⃣ Abrir Make.com
   └─> Agregar módulo WhatsApp

4️⃣ Probar en tu sitio
   └─> Consultar una propiedad

5️⃣ Verificar en WhatsApp
   └─> ¡Debe llegar todo!
```

---

## 💡 Notas Importantes

- ⚠️ La foto se envía como **URL**, no como archivo directo
- ⚠️ El **celular es obligatorio** (se pide en el formulario)
- ⚠️ Si la propiedad no tiene foto, se envía `null` (Make.com lo maneja)
- ⚠️ Todo retrocompatible - clientes antiguos siguen funcionando
- ✅ **Sin cambios en la BD** - no hay migración necesaria

---

## 📞 Variables para Make.com

Usa estas en tus módulos WhatsApp:

```
{{trigger.body.nombre}}                  → Nombre del cliente
{{trigger.body.telefono}}                → Celular
{{trigger.body.propiedad.titulo}}        → Propiedad
{{trigger.body.propiedad.precio}}        → Precio
{{trigger.body.propiedad.zona}}          → Zona
{{trigger.body.propiedad.tipo}}          → Tipo
{{trigger.body.propiedad.descripcion}}   → Descripción
{{trigger.body.propiedad.imagen}}        → URL Foto
```

---

**Documentación completa:** 20/03/2026  
**Versión:** 2.1  
**Estado:** ✅ COMPLETADO
