# NFC Inmobiliarias

Asesor inmobiliario con integración de tarjetas NFC, WhatsApp y webhook.

## Características

✅ Formulario de captura de leads  
✅ Integración con WhatsApp  
✅ Webhook para n8n  
✅ Catálogo de propiedades  
✅ Optimizado para Vercel  

## Despliegue en Vercel - GUÍA PASO A PASO

### Paso 1: Push al Repositorio

```bash
git add .
git commit -m "Fix: Optimización completa para Vercel"
git push origin main
```

### Paso 2: Conectar Vercel

1. Ve a [vercel.com](https://vercel.com)
2. **Sign in** con tu cuenta GitHub
3. Haz clic en **"Add New" → "Project"**
4. Selecciona tu repositorio `nfcinmobiliarias`
5. Haz clic en **"Import"**

### Paso 3: Configurar Variables de Entorno ⚠️ IMPORTANTE

En la pantalla de configuración, **ANTES de hacer Deploy**, ve a **"Environment Variables"** y agrega:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `WEBHOOK_URL` | URL de tu webhook n8n | `https://n8n.tudominio.com/webhook/lead` |
| `WHATSAPP_NUMBER` | Tu número de WhatsApp | `5493462587692` |

**Nota**: El número debe ser sin símbolos, en formato internacional.

### Paso 4: Deploy

Haz clic en **"Deploy"** y espera a que termine (2-3 minutos aprox).

### Paso 5: Verificar Funcionamiento

Cuando el deploy termine:
1. Ve a la URL que te proporciona Vercel
2. Completa el formulario
3. Deberías ser redirigido a WhatsApp
4. Los datos se enviarán a tu webhook

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