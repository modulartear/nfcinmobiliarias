# ✨ NUEVO: Sistema de Usuarios y NFCs - Inicio Rápido

## 🎉 ¿Qué Cambió?

**Antes:** Un único agente, un NFC, un perfil

**Ahora:** 
- ✅ Múltiples usuarios independientes
- ✅ Cada usuario con su propio login
- ✅ Cada usuario puede crear varios NFCs
- ✅ Cada NFC con datos personalizados
- ✅ Escalable para redes de broker, equipos, franquicias

---

## 🚀 PRIMEROS PASOS (15 minutos)

### 1. Vercel Deploy
```bash
git add .
git commit -m "Feat: Sistema multiusuario con NFCs"
git push

# Espera 1-2 minutos a que Vercel depliegue
```

### 2. Registrarse como Admin
1. Abre: `https://tu-dominio.com/login.html`
2. Click en "Registrarse aquí"
3. Completa el formulario:
   - Usuario: `tu_username`
   - Email: `tu_email@dominio.com`
   - Nombre: `Tu Nombre Completo`
   - Empresa: `Tu Empresa`
   - Contraseña: `MíniMo 6 caracteres`
4. Click "Crear Cuenta" → ¡Ya tienes acceso!

### 3. Panel Admin
Ya estás en `/admin.html`, verás 3 tabs:

#### 📱 **Tab 1: Mis NFCs**
- Crear nuevo NFC
- Ver todos tus NFCs
- Copiar links personalizados
- Ver ID único de cada NFC

**¿Qué es un NFC?**
- Un código QR/NFC vinculado a TI
- Solo TUS datos + TUS propiedades
- Puedes tener varios NFCs
- Cada uno puede ir en un lugar diferente

**Crear NFC:**
1. Ingresar nombre: "Juan - Palermo"
2. Ingresar WhatsApp: "+5491234567890"
3. Click "Crear NFC"
4. Copiar link: `https://tu-dominio.com?nfc_id=nfc_xxxx`

#### 👤 **Tab 2: Mi Perfil**
- Tu nombre, email, teléfono
- Tu foto profesional
- Tu presentación/bio
- Empresa

**Importante:** Estos datos se ven cuando escanean tu NFC

#### 🏠 **Tab 3: Propiedades**
- Crear nueva propiedad
- Título, descripción, precio, zona
- Tipo (Depto, Casa, PH, etc)
- Foto de la propiedad

**Importante:** Solo TUS propiedades aparecerán cuando escaneen TU NFC

### 4. Generar Link del NFC
En tab "Mis NFCs":
1. Verás tu NFC creado
2. Click en "📋 Copiar Link"
3. Ahora tienes: `https://tu-dominio.com?nfc_id=nfc_550e8400...`

### 5. Compartir con Clientes
Puedes:
- **Imprimir QR** del link
- **Compartir link** por WhatsApp
- **Escanear** con cualquier teléfono
- **Crear tarjeta NFC física** (opcional)

### 6. ¿Cuando Cliente Escanea?
1. Abre el link: `https://tu-dominio.com?nfc_id=nfc_xxxx`
2. Ve TU foto, nombre, info profesional
3. Ve TUS propiedades
4. Puede consultar una propiedad
5. Los datos se envían a TU WhatsApp

---

## 📱 FLUJO COMPLETO

```
┌─────────────────────┐
│ 1. REGISTRO         │
│ /login.html         │
│ (Tú te registras)   │
└──────────┬──────────┘
           │
┌──────────▼────────────┐
│ 2. PANEL ADMIN        │
│ /admin.html           │
│ (Tu espacio personal) │
└──────────┬────────────┘
           │
┌──────────▼────────────┐
│ 3. CREAR NFC          │
│ + Nombre              │
│ + WhatsApp            │
│ = Link único          │
└──────────┬────────────┘
           │
┌──────────▼────────────┐
│ 4. INGRESA DATOS      │
│ + Tu foto             │
│ + Tu info             │
│ + Tus propiedades     │
└──────────┬────────────┘
           │
┌──────────▼─────────────────────┐
│ 5. CLIENTE ESCANEA NFC          │
│ https://dominio.com?nfc_id=xxxx │
│ Ve TUS datos + TUS propiedades   │
└─────────────────────────────────┘
```

---

## 👥 Casos de Uso

### Caso 1: Agente Individual
- 1 usuario (yo)
- 1 NFC (Mi Agencia)
- 10 propiedades
- Comparte el link con clientes

### Caso 2: Equipo de 5 Agentes
- 5 usuarios diferentes (cada agente)
- 5 NFCs (uno por agente)
- Cada uno con sus propiedades
- Cada cliente ve al agente que vende

### Caso 3: Franquicia Nacional
- 1 usuario por sucursal
- Cada sucursal con su NFC
- Propiedades locales de cada zona
- Los clientes ven "Sucursal Zona Norte", etc

---

## 🔐 Seguridad & Control

✅ **Cada usuario** tiene contraseña segura
✅ **Cada usuario** ve solo SUS datos
✅ **Cada NFC** vinculado a UN usuario
✅ **Cada propiedad** vinculada al usuario propietario
✅ **Cada consulta** registrada al usuario correcto

---

## 🎯 URLs Importantes

| URL | Uso |
|-----|-----|
| `/login.html` | Registro/Login |
| `/admin.html` | Tu panel personal |
| `/index.html?nfc_id=xxxx` | Tu página pública |

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener 2 NFCs?**
R: Sí, todos vinculados a tu cuenta. Cada uno con su link único.

**P: ¿Qué pasa si cambio propiedades?**
R: Se actualiza al instante para todos los clientes que accedan.

**P: ¿Se pueden compartir NFCs?**
R: No, cada NFC es del usuario que lo creó. Pero puedes crear varios.

**P: ¿Cómo borro un NFC?**
R: En tab "Mis NFCs", click en "🗑️ Eliminar" (comping en desarrollo).

**P: ¿Si olvido contraseña?**
R: Sistema manual por ahora (próximo update: reset por email).

---

## 📊 Datos Almacenados

Cuando TÚ escaneas tu NFC, aparecen:

```
Mi NFC: "Juan - Palermo"
├─ Mi foto: [foto profesional]
├─ Mi nombre y info
├─ Mi empresa
├─ Mi presentación
└─ Mis propiedades:
   ├─ Depto 2 Amb - $250k
   ├─ Casa PH - $500k
   └─ Oficina - $150k
```

---

## 🔄 Para tu Equipo

Si quieres agregar más usuarios:

1. **Diles que vayan a:** `/login.html`
2. **Que se registren** con sus datos
3. **Accederán a su panel** automáticamente
4. **Cada uno crea sus NFCs y propiedades**

---

## 🚀 Próximos Pasos

1. ✅ Git push (ya hecho)
2. ✅ Esperar Vercel deploy (1-2 min)
3. 👉 **TÚ:** Ir a `/login.html` y registrarte
4. 👉 **TÚ:** Crear tu NFC en `/admin.html`
5. 👉 **TÚ:** Probar con clientes

---

## 📞 Estructura Base de Datos

Se crean automáticamente 5 tablas:

```
dashboard_user      → Usuarios como TÚ
    ↓
├─ nfc_device       → NFCs que creaste
├─ agent            → Tu información
├─ properties       → Tus propiedades
└─ leads            → Consultas que recibiste
```

---

## 🎓 Tecnología

- **Frontend:** HTML5 + JavaScript + CSS
- **Backend:** Node.js + PostgreSQL
- **Deploy:** Vercel
- **Autenticación:** SHA-256
- **API:** REST con CORS

---

**¡Listo para comenzar!**

👉 Ve a: `https://tu-dominio.com/login.html`

---

*Sistema actualizado: 20/03/2026*  
*Versión: 3.0*  
*Estado: ✅ COMPLETADO Y LISTO PARA USAR*
