# ⚡ GUÍA RÁPIDA: Consultas por WhatsApp CON FOTO

## 🎯 ¿Qué cambió?

Antes: Cliente consultaba → Mensaje simple sin foto
Ahora: Cliente consulta → **Mensaje con foto, precio, zona y datos del cliente**

---

## 📱 Flujo Nuevo

```
1. Cliente hace click "Consultar" en una propiedad
   ↓
2. Ingresa: Nombre completo + Celular
   ↓
3. Se envía al webhook CON:
   ✅ Foto de la propiedad
   ✅ Precio y zona
   ✅ Nombre y celular del cliente
   ↓
4. Make.com procesa y envía por WhatsApp
   ↓
5. ¡Cliente recibe TODO en WhatsApp!
```

---

## 🔧 ¿Qué Debo Hacer?

### ✅ YA HECHO (por mí):
- [x] Código de `script.js` actualizado ✓
- [x] Backend `api/lead.js` mejorado ✓
- [x] Captura de datos + celular ✓
- [x] Envía foto al webhook ✓

### 📋 TIENES QUE HACER (tú):

1. **Hacer un commit y push**
   ```bash
   git add .
   git commit -m "Feat: Consultas WhatsApp con foto y datos cliente"
   git push
   ```

2. **Ir a Make.com**
   - Abre tu scenario/flujo
   - Después del webhook, agrega un módulo "Send WhatsApp Message"

3. **Configurar el Módulo WhatsApp**
   ```
   Para: {{trigger.body.telefono}}
   Mensaje: (ver abajo)
   ```

4. **Mensaje Recomendado**
   ```
   👋 ¡Hola {{trigger.body.nombre}}!
   
   Recibimos tu consulta.
   
   📍 Propiedad: {{trigger.body.propiedad.titulo}}
   💰 Precio: {{trigger.body.propiedad.precio}}
   📌 Zona: {{trigger.body.propiedad.zona}}
   
   Tu celular: {{trigger.body.telefono}}
   
   ¡Nuestro equipo te contactará pronto!
   ```

5. **Opcional: Enviar Foto**
   - Agrega otro módulo: "Send WhatsApp Media"
   - URL: `{{trigger.body.propiedad.imagen}}`

6. **Guardar y Probar**
   - Click en "Save" en Make.com
   - En tu web, consulta una propiedad
   - ¡Verifica que llegue todo correcto en WhatsApp!

---

## 📚 Documentación Completa

| Archivo | Contenido |
|---------|-----------|
| **RESUMEN_CAMBIOS.md** | Resumen ejecutivo |
| **WHATSAPP_SETUP.md** | Guía general WhatsApp |
| **MAKE_COM_SETUP.md** | Guía paso a paso Make.com |
| **TECH_DOCS.md** | Documentación técnica |

---

## 🧪 Cómo Probar

1. Abre tu sitio
2. Haz click: "Consultar" en una propiedad
3. Ingresa:
   - Nombre: "Test Juan"
   - Celular: "5491234567890" (tu número)
4. ¿Qué confirmar?
   - [ ] Se envió a Make.com (revisa logs)
   - [ ] Recibiste mensaje en WhatsApp
   - [ ] Tiene los datos: nombre, precio, zona
   - [ ] Se vio la foto (si agregaste ese módulo)

---

## ❓ Preguntas Comunes

**P: ¿Qué pasa si la propiedad no tiene foto?**
R: El sistema envía `null`, y Make.com ignora ese campo. El mensaje se envía igual.

**P: ¿Por qué pide el celular?**
R: Porque necesitamos saber a dónde enviar el mensaje y guardar los datos del cliente.

**P: ¿Funciona sin Make.com?**
R: No, Make.com procesa el webhook y envía por WhatsApp. Sin él, solo se guarda en BD.

**P: ¿Se cambia la base de datos?**
R: No, los datos de propiedad se envían a Make.com, no se guardan localmente.

**P: ¿Qué variables puedo usar en Make.com?**
R: Ver archivo TECH_DOCS.md o la lista en MAKE_COM_SETUP.md

---

## 🚀 Deployment

```bash
# En tu terminal:
git add .
git commit -m "Feat: WhatsApp con foto y datos"
git push

# En Vercel:
- Espera a que deploy termine
- Tu sitio se actualiza automáticamente
- Los clientes ya ven el "Ingresa tu celular"
```

---

## 💡 Próximos Pasos

1. ✅ Hizo commit y push
2. ⭕ Configura Make.com (agregar módulo WhatsApp)
3. ⭕ Prueba con datos de test
4. ⭕ ¡Está listo!

---

## 📞 Datos que Ahora Tienes

Cuando un cliente consulta una propiedad, tu Make.com recibe:

```json
{
  "nombre": "Juan Pérez",           ← Nombre cliente
  "telefono": "+5493462587692",     ← Celular cliente
  "propiedad": {
    "titulo": "Depto 2 Amb",        ← Nombre propiedad
    "precio": "$250.000",           ← Precio
    "zona": "Palermo",              ← Ubicación
    "tipo": "Departamento",         ← Tipo
    "descripcion": "...",           ← Descripción
    "imagen": "https://cdn/.../..."  ← FOTO 📸
  }
}
```

**¡Todo lo necesario para un mensaje profesional!**

---

**Listo para usar:** 20/03/2026
**Versión:** 2.1
