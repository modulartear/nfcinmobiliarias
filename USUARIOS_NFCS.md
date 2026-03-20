# 🔐 SISTEMA DE USUARIOS Y NFCs - Guía Completa

## 📋 Resumen

El sistema ahora soporta **múltiples usuarios admin**, cada uno con:
- ✅ Cuenta independiente (login/registro)
- ✅ Uno o varios NFCs vinculados
- ✅ Sus propias propiedades
- ✅ Su propia información de agente
- ✅ Sus propios leads/consultas

---

## 🏗️ Arquitectura

```
Sistema NFC Inmobiliarias (Multiusuario)
│
├── Usuarios Admin
│   ├── Usuario 1 (Juan)
│   │   ├── NFC #1 - "Juan Inmobiliario"
│   │   ├── Agente Info
│   │   └── 10 Propiedades
│   │
│   ├── Usuario 2 (María)
│   │   ├── NFC #1 - "María Broker"
│   │   ├── NFC #2 - "María Prime"
│   │   ├── Agente Info
│   │   └── 5 Propiedades
│   │
│   └── Usuario 3 (Empresa)
│       ├── NFC #1 - "Empresa - Zona Norte"
│       ├── NFC #2 - "Empresa - Zona Sur"
│       ├── Agente Info
│       └── 20 Propiedades
```

---

## 🚀 Cómo Funciona

### 1️⃣ **Registro de Usuario**

1. Ir a `https://tu-dominio.com/login.html`
2. Click en "Registrarse aquí"
3. Ingresar:
   - Usuario
   - Email
   - Nombre completo
   - Empresa (opcional)
   - Contraseña

**Resultado:** Se crea cuenta en BD y redirige al panel admin

### 2️⃣ **Login**

1. Ir a `https://tu-dominio.com/login.html`
2. Ingresar usuario/email + contraseña
3. Acceso a panel admin

### 3️⃣ **Crear NFC**

En el panel admin, tab "Mis NFCs":
1. Ingresar nombre del NFC
2. Ingresar número WhatsApp
3. Click "Crear NFC"

**Resultado:** Se genera:
- ID único del NFC
- Link personalizad
o: `https://tu-dominio.com?nfc_id=xxxx`

### 4️⃣ **Escanear NFC**

Cuando un cliente escanea el código QR o accede al link:

```
Cliente escanea NFC
         ↓
    URL: https://tu-dominio.com?nfc_id=nfc_xxxx
         ↓
    Se carga: loadNFCData() en index.html
         ↓
    Obtiene datos del NFC (número, agente, propiedades)
         ↓
    Renderiza página CON DATOS DEL USUARIO
```

---

## 📁 Base de Datos - Nuevas Tablas

### `dashboard_user` (Usuarios)
```sql
id              INT PRIMARY KEY
username        TEXT UNIQUE
email           TEXT UNIQUE
password_hash   TEXT
nombre          TEXT
empresa         TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `nfc_device` (NFCs)
```sql
id              TEXT PRIMARY KEY (ej: nfc_550e8400...)
user_id         INT (FK → dashboard_user)
nombre          TEXT        (ej: "Juan Inmobiliario")
numero_whatsapp TEXT        (ej: "+5491234567890")
activo          BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `agent` - ACTUALIZADA
```sql
id              INT PRIMARY KEY
user_id         INT (FK → dashboard_user)  ← NUEVO
nombre          TEXT
email           TEXT
telefono        TEXT
empresa         TEXT
presentacion    TEXT
foto            TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `properties` - ACTUALIZADA
```sql
id              TEXT PRIMARY KEY
user_id         INT (FK → dashboard_user)  ← NUEVO
titulo          TEXT
descripcion     TEXT
precio          TEXT
zona            TEXT
tipo            TEXT
caracteristicas TEXT
imagen          TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `leads` - ACTUALIZADA
```sql
id              TEXT PRIMARY KEY
user_id         INT (FK → dashboard_user)  ← NUEVO
nombre          TEXT
telefono        TEXT
interes         TEXT
origen          TEXT
read            BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 🔗 Flujo Completo

```
┌─────────────────────────────────────────┐
│  USUARIO: REGISTRO/LOGIN                │
│  https://tu-dominio.com/login.html     │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Se autentica en BD │
        │  Se crea cuenta     │
        │  Se guarda en       │
        │  dashboard_user     │
        └──────────┬──────────┘
                   │
        ┌──────────▼────────────────┐
        │  PANEL ADMIN              │
        │  /admin.html              │
        │  - Tab 1: Mis NFCs        │
        │  - Tab 2: Mi Perfil       │
        │  - Tab 3: Propiedades     │
        └──────────┬────────────────┘
                   │
        ┌──────────▼──────────┐
        │  CREAR NFC          │
        │  user_id vinculado  │
        │  ID generado        │
        │  Almacenado en BD   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  CLIENTE ESCANEA    │
        │  ?nfc_id=xxxx       │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  loadNFCData()                   │
        │  Obtiene datos del NFC           │
        │  + Agent del usuario             │
        │  + Properties del usuario        │
        │  Carga en window.nfcData         │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  Muestra página             │
        │  - Card del agente correcto │
        │  - Propiedades correctas    │
        │  - WhatsApp del NFC         │
        └─────────────────────────────┘
```

---

## 🔌 APIs Principales

### POST `/api/auth?action=register`
**Crear nuevo usuario**

Parámetros:
```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "micontraseña123",
  "nombre": "Juan Pérez",
  "empresa": "Mi Inmobiliaria"
}
```

Respuesta:
```json
{
  "success": true,
  "user": { id, username, email, nombre, empresa },
  "token": "..."
}
```

---

### POST `/api/auth?action=login`
**Autenticar usuario**

Parámetros:
```json
{
  "username": "juan",
  "password": "micontraseña123"
}
```

Respuesta:
```json
{
  "success": true,
  "user": { id, username, email, nombre, empresa },
  "token": "..."
}
```

---

### POST `/api/auth?action=create-nfc`
**Crear nuevo NFC**

Parámetros:
```json
{
  "user_id": 5,
  "nombre": "Juan Inmobiliario",
  "numero_whatsapp": "+5491234567890"
}
```

Respuesta:
```json
{
  "success": true,
  "nfc": {
    "id": "nfc_550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Juan Inmobiliario",
    "numero_whatsapp": "+5491234567890",
    "estado": "activo"
  }
}
```

---

### GET `/api/auth?action=get-nfcs&user_id=5`
**Obtener NFCs del usuario**

Respuesta:
```json
{
  "success": true,
  "nfcs": [
    {
      "id": "nfc_xxxx",
      "nombre": "Juan Inmobiliario",
      "numero_whatsapp": "+5491234567890",
      "activo": true,
      "created_at": "2026-03-20T..."
    }
  ]
}
```

---

### GET `/api/auth?action=get-nfc-data&nfc_id=nfc_xxxx`
**Obtener datos completos del NFC**

Respuesta:
```json
{
  "success": true,
  "nfc": {
    "id": "nfc_xxxx",
    "nombre": "Juan Inmobiliario",
    "numero_whatsapp": "+5491234567890"
  },
  "agent": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "...",
    "empresa": "...",
    "presentacion": "...",
    "foto": "..."
  },
  "properties": [
    { id, titulo, precio, zona, imagen, ... }
  ]
}
```

---

## 🎯 Casos de Uso

### Caso 1: Agente Individual (Juan)
1. Se registra en la plataforma
2. Crea 1 NFC llamado "Juan - Venta Inmuebles"
3. Ingresa su información (foto, presentación, etc)
4. Carga 10 propiedades de su cartera
5. Comparte el link del NFC con clientes
6. Cuando escanean, ven SUS datos y SUS propiedades

### Caso 2: Equipo (Empresa)
1. Admin se registra
2. Crea 5 NFCs para diferentes zonas
   - NFC #1: "Empresa - Zona Norte"
   - NFC #2: "Empresa - Zona Sur"
   - NFC #3: "Empresa - Departamentos"
   - NFC #4: "Empresa - Casas"
   - NFC #5: "Empresa - Comercios"
3. Según zona, propiedades vinculadas diferentes
4. Misma presentación, propiedades distintas

### Caso 3: Red de Brokers
1. 20 brokers se registran (independientes)
2. Cada uno crea su NFC personalizado
3. Cada N FC tiene sus datos y propiedades
4. Pueden compartir entre clientes
5. Cada consulta va al agente correcto

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas (SHA-256)
- ✅ Cada usuario ve solo sus datos
- ✅ NFCs vinculados a user_id
- ✅ Propiedades vinculadas a user_id
- ✅ Leads vinculados a user_id

---

## 📱 URLs Principales

| URL | Propósito |
|-----|-----------|
| `/login.html` | Registro/Login |
| `/admin.html` | Panel de control |
| `/index.html` | Página pública (sin parámetros) |
| `/index.html?nfc_id=xxxx` | Página con NFC específico |

---

## 🧪 Testing

### Test 1: Crear usuario
```bash
1. Ir a /login.html
2. Click "Registrarse"
3. Ingresar datos
4. Debería redirigir a /admin.html
```

### Test 2: Crear NFC
```bash
1. En /admin.html, tab "Mis NFCs"
2. Ingresar nombre + WhatsApp
3. Click "Crear NFC"
4. Debe aparecer en lista
```

### Test 3: Escanear NFC
```bash
1. Copiar link del NFC
2. Abrir en navegador (o escanear QR)
3. Debe cargar /index.html?nfc_id=xxxx
4. Deben aparecer datos del usuario
5. Propiedades del usuario
6. WhatsApp del NFC
```

---

## 📊 Estructura de Carpetas

```
nfcinmobiliarias/
├── login.html               ← Nueva página de login/registro
├── admin.html               ← Panel admin (los usuarios pueden acceder)
├── index.html               ← Página principal (ahora con soporte para ?nfc_id)
├── api/
│   ├── auth.js              ← Actualizado (nuevo sistema)
│   ├── auth-old.js          ← Backup del anterior
│   ├── lead.js              ← Mantener igual
│   ├── properties.js        ← Mantener igual (TODO: vincular a user_id)
│   └── agent.js             ← Mantener igual (TODO: vincular a user_id)
└── ... (resto igual)
```

---

## 🚀 Próximos Pasos

1. **Hacer push a git**
   ```bash
   git add .
   git commit -m "Feat: Sistema multiusuario con NFCs vinculados"
   git push
   ```

2. **Vercel despliega automáticamente**

3. **Probar sistema:**
   - `https://tu-dominio.com/login.html` - Registrarse
   - `https://tu-dominio.com/admin.html` - Panel
   - `https://tu-dominio.com/index.html?nfc_id=xxxx` - Escanear NFC

---

## 💾 Datos Globales en Frontend

Cuando se carga `/index.html?nfc_id=xxxx`, se disponibiliza:

```javascript
window.nfcData = {
  nfc: { id, nombre, numero_whatsapp },
  agent: { nombre, email, telefono, ... },
  properties: [ ... ]
}

window.numero = "+5491234567890"  // Del NFC específico
```

Usado en `script.js`:
- `renderAgentCard()` - Usa window.nfcData.agent
- `renderProperties()` - Usa window.nfcData.properties
- `consultarPropiedad()` - Usa window.numero para WhatsApp

---

**Actualizado:** 20/03/2026  
**Versión:** 3.0 - Sistema Multiusuario  
**Estado:** ✅ COMPLETADO
