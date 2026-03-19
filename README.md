# NFC Inmobiliarias

Asesor inmobiliario completo con gestión de propiedades, vCard de presentación, integración con WhatsApp y webhook.

## 🎉 Características Principales

✅ **Dashboard Admin** - Gestion completa de propiedades  
✅ **Carga de Propiedades** - Con foto, descripción y detalles  
✅ **vCard del Agente** - Presentación profesional con contacto  
✅ **Botón para Agregar Contacto** - Descargar vCard al dispositivo  
✅ **Formulario de Captura** - Leads automáticos  
✅ **Integración WhatsApp** - Contacto directo  
✅ **Webhook n8n** - Procesamiento de datos  
✅ **Optimizado para Vercel** - Deploy gratis y rápido

## 📊 Cómo Funciona

### Para el Agente Inmobiliario

1. **Acceder al Dashboard**
   - Ve a `/dashboard.html`
   - Autentica con contraseña (si quieres agregar)

2. **Configurar Datos Personales**
   - Nombre, email, teléfono
   - Foto de perfil
   - Presentation personal
   - Todo se guarda en tu dispositivo (localStorage)

3. **Cargar Propiedades**
   - Título, descripción, precio
   - Zona, tipo, características
   - Foto de la propiedad
   - Se almacenan y muestran automáticamente

4. **vCard QR**
   - Se genera automáticamente
   - Los clientes pueden descargar tu contacto
   - Se agrega directamente a su agenda

### Para el Cliente

1. Escanea tarjeta NFC o accede al sitio
2. Ve tu presentación (vCard con foto)
3. Opción de agregar tu contacto a su agenda
4. Coloca un botón para descargar el vCard
5. Ve las propiedades disponibles
6. Completa formulario y es redirigido a WhatsApp

## 🚀 Despliegue en Vercel

### Paso 1: Preparar Código

```bash
git add .
git commit -m "Agregar dashboard y gestión de propiedades"
git push origin main
```

### Paso 2: Conectar Vercel

1. Ve a [vercel.com](https://vercel.com)
2. **Sign in** con GitHub
3. **Add New → Project**
4. Selecciona repositorio `nfcinmobiliarias`
5. Haz clic en **Import**

### Paso 3: Variables de Entorno

En Vercel Dashboard, ve a **Settings → Environment Variables** y agrega:

```
WEBHOOK_URL=https://n8n.tu-dominio.com/webhook/lead
WHATSAPP_NUMBER=5493462587692
```

### Paso 4: Deploy

- Haz clic en **Deploy**
- Espera 2-3 minutos
- ¡Listo!

## 👨‍💼 Guía de Uso - Dashboard Admin

### Acceder al Dashboard

```
https://tu-sitio-vercel.com/dashboard.html
```

### Tab 1: Propiedades

**Agregar Nueva Propiedad:**
1. Completa todos los campos:
   - Título (ej: "Casa 3 ambientes")
   - Descripción detallada
   - Precio (ej: "$150.000")
   - Ubicación/Zona
   - Tipo de propiedad
   - Características (separadas por comas)
   - Foto (JPG, PNG o WebP, máx 5MB)

2. Haz clic en **"💾 Guardar Propiedad"**

3. La propiedad aparecer automáticamente en:
   - El dashboard (tarjeta)
   - La página principal del sitio
   - En la cartera visible para clientes

**Editar o Eliminar:**
- Haz clic en ✏️ para editar (próximamente)
- Haz clic en 🗑️ para eliminar

### Tab 2: Datos del Agente

**Configurar tu Perfil:**
1. Datos personales:
   - Nombre completo
   - Email (será en el vCard)
   - Teléfono/WhatsApp
   - Nombre de empresa

2. Presentación:
   - Texto que querés que vean los clientes
   - Ej: "Experto en propiedades del norte con 5 años de experiencia"

3. Foto de perfil:
   - Se mostrará en círculo en la página principal
   - Recomendado: 500x500px

4. Haz clic en **"💾 Guardar Datos"**

La vista previa mostrar:
- Tu vCard completa
- Código QR para que descarguen tu contacto
- Botón para descargar vCard (.vcf)

## 📱 vCard y Contactos

### ¿Qué es vCard?

Un formato estándar para compartir contactos que funciona en todos los teléfonos.

### Cómo Funciona en tu Sitio

1. **Página Principal**: Los clientes ven tu presentación
2. **Botón "📥 Guardar Contacto"**: Descarga tu vCard
3. **QR Code**: Pueden escanear para agregar contacto
4. **WhatsApp Directo**: Botón verde para contactarte

### Para Clientes

```
1. Abre tu sitio en el móvil
2. Ve tu presentación (foto + nombre + empresa)
3. Haz clic en "📥 Guardar Contacto"
4. Se descarga tu vCard
5. El móvil pregunta si importar contacto
6. ¡Listo! Tienes tu número guardado
```

## 📁 Estructura del Proyecto

```
├── index.html           # Página principal (con vCard)
├── dashboard.html       # Panel de administración
├── script.js            # Lógica de página principal
├── dashboard.js         # Lógica del dashboard
├── utils.js             # Funciones compartidas
├── style.css            # Estilos (responsive)
├── config.json          # Configuración
├── api/
│   └── lead.js         # Serverless (procesa leads)
├── vercel.json         # Configuración Vercel
├── package.json        # Dependencias
└── build.sh            # Script de build
```

## 💾 Almacenamiento

**LocalStorage:**
- Propiedades se guardan en navegador del usuario
- Se persisten entre sesiones
- No requiere servidor
- Cada usuario puede tener sus propiedades

**Sincronización:**
- Para sincronizar entre dispositivos, exporta/importa
- O sube propiedades a BD (próximo feature)

## ✅ SOLUCIÓN DEFINITIVA PARA ERROR 404

Si continuás recibiendo error **404 NOT_FOUND** en Vercel, aquí está la solución:

### 🔧 Cambios Realizados

```
vercel.json - Ahora tiene un build command explícito que copia archivos a public/
```

El comando de build es:
```bash
mkdir -p public && cp index.html style.css config.json config.js script.js public/ && rm -rf public/api && cp -r api public/
```

**¿Qué hace?**
1. Crea carpeta `/public`
2. Copia todos los archivos estáticos
3. Copia la carpeta `/api` con las funciones serverless

### 📋 INSTRUCCIONES PASO A PASO

**1. Guardar cambios localmente:**
```bash
cd /workspaces/nfcinmobiliarias
git add .
git commit -m "Fix definitivo: Build command explícito para Vercel"
git push origin main
```

**2. En Vercel Dashboard:**
- Abre tu proyecto
- Espera a que vea el nuevo push
- El deploy debería empezar automáticamente
- En esta ocasión, **NO cambies nada en Settings**
- Déja que Vercel auto-detecte y construya

**3. Monitorear el deploy:**
- Ve a **Deployments**
- Haz clic en el nuevo deploy
- Ve a **Logs** (arriba a la derecha)
- Deberías ver el comando de build ejecutándose
- Busca líneas como: `mkdir -p public` y `cp index.html...`

**4. Verificar que funcionó:**
- Cuando el deploy termine (status verde ✓)
- Abre la URL
- Deberías ver el formulario
- ¡Si funciona = ÉXITO! 🎉

### 🔍 ¿Qué ver en los Logs de Vercel?

**Log esperado (CORRECTO):**
```
> mkdir -p public && cp index.html style.css config.json config.js script.js public/ && rm -rf public/api && cp -r api public/
✓ Build completed
```

**Si ves error (PROBLEMA):**
```
Command failed: mkdir -p public && cp index.html...
No such file or directory
```
→ Significa que algún archivo falta. Verifica que todo esté en git.

### ❌ Si SIGUE SIN FUNCIONAR

**Opción A: Regenerar Deploy Limpio**
1. En Vercel Dashboard → **Settings**
2. Desplázate hasta abajo
3. **"Danger Zone"** → **Delete Project**
4. Recréalo importando el repo desde cero

**Opción B: Verificar Git**
```bash
# Verifica que todos los archivos estén en git
git status

# Si hay archivos "??" (no rastreados):
git add .
git commit -m "Add all files"
git push origin main
```

**Opción C: Crear public/ Localmente**
```bash
# Ejecuta el build script
bash build.sh

# Comitea la carpeta public
git add public/
git commit -m "Add public folder"
git push origin main
```

Luego cambia `vercel.json`:
```json
{
  "buildCommand": "",
  "outputDirectory": "public"
}
```

## Desarrollo Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`

## Estructura del Proyecto

```
.
├── index.html              # HTML principal
├── style.css               # Estilos
├── script.js               # Lógica del cliente
├── config.json             # Configuración (valores por defecto)
├── package.json            # Dependencias
├── vercel.json             # Configuración Vercel
├── .env.example            # Plantilla de variables de entorno
├── .vercelignore           # Archivos a ignorar en deploy
├── api/
│   └── lead.js            # Serverless function para procesar leads
└── README.md              # Este archivo
```

## Cómo funciona

### Flujo de datos:
1. **Usuario completa formulario** en `index.html`
2. **JavaScript valida** los datos en `script.js`
3. **POST request** a `/api/lead` (función serverless)
4. **API procesa** y envía a webhook n8n
5. **Usuario es redirigido** a WhatsApp
6. **n8n recibe** el lead y lo procesa (guarda en DB, envía email, etc.)

## Variables de Entorno

### Requeridas
Configure estas en Vercel Dashboard → Settings → Environment Variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `WEBHOOK_URL` | URL del webhook de n8n | `https://n8n.example.com/webhook/lead` |
| `WHATSAPP_NUMBER` | Número WhatsApp del asesor | `5493462587692` |

### Valores por Defecto
Si no configuras las variables, se usan estos:
- `WEBHOOK_URL`: `https://TU-N8N/webhook/lead`
- `WHATSAPP_NUMBER`: `5493462587692`

## Archivos Importantes

### `api/lead.js`
Función serverless que:
- ✅ Valida datos del formulario
- ✅ Envía data a webhook n8n
- ✅ Maneja CORS
- ✅ Retorna configuración pública

### `script.js`
Script del cliente que:
- ✅ Carga configuración del servidor
- ✅ Valida el formulario
- ✅ Envía datos al API
- ✅ Redirige a WhatsApp

## Troubleshooting

### ❌ Error 404 - NO ENCONTRADO
**Causa**: Vercel puede estar detectando el framework incorrectamente

**Solución**:
1. En Vercel dashboard → **Settings** → **Build & Development**
2. Cambiar **Framework Preset** a **"Other"**
3. Ir a **Deployments** y **Redeploy**

### ❌ Error: API/lead not found
**Causa**: La carpeta `/api` no está siendo reconocida

**Solución**:
1. Verifica que exista `/api/lead.js`
2. Haz un nuevo commit y push
3. Redeploy en Vercel

### ❌ CORS Error
**Causa**: Problemas de origen cruzado

**Solución**: El API ya tiene CORS habilitado, pero verifica:
- Que `api/lead.js` tenga los headers de CORS
- Que el navegador no esté bloqueando

### ❌ Datos no llegan a n8n
**Causa**: URL de webhook incorrecta o no configurada

**Solución**:
1. Verifica `WEBHOOK_URL` en Vercel Settings
2. Prueba la URL en el navegador (debería retornar algo)
3. Verifica que n8n webhook esté activo