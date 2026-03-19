# Troubleshooting - Guía Rápida

## 🔴 Error 404 "NO ENCONTRADO" - SOLUCIÓN DEFINITIVA

### ¿Por qué ocurre?
Vercel a veces no detecta correctamente que es un sitio estático puro.

### ✅ SOLUCIÓN (Probada y Funcionando)

El proyecto ahora tiene un **build command explícito** en `vercel.json`:

```bash
mkdir -p public && cp index.html style.css config.json config.js script.js public/ && rm -rf public/api && cp -r api public/
```

Esto crea una carpeta `/public` con todos los archivos que Vercel necesita servir.

### 📋 QUÉ HACER

**Paso 1: Actualizar código**
```bash
git add .
git commit -m "Solución definitiva error 404"
git push origin main
```

**Paso 2: Esperar deploy en Vercel**
- El deploy debería empezar automáticamente
- **No cambies nada en Settings**
- Espera a que termine (2-3 minutos)

**Paso 3: Verificar Logs**
1. Ve a **Deployments**
2. Abre el último deploy
3. Ve a la pestaña **"Build Logs"**
4. Busca líneas como:
   ```
   > mkdir -p public && cp index.html...
   ✓ Build completed
   ```

**Paso 4: Verificar que funciona**
- Cuando el build esté verde ✓
- Abre la URL
- Deberías ver el formulario
- ¡ÉXITO! 🎉

### 🆘 Si SIGUE sin funcionar

**Opción A: Prueba el build localmente**
```bash
bash build.sh
# Deberías ver "✅ Build completado!"
# Y una carpeta "public/" con todos los archivos
```

**Opción B: Comitea la carpeta public**
```bash
# El build script crea public/
bash build.sh

# Comiteala
git add public/
git commit -m "Add public folder pre-built"
git push origin main

# En vercel.json, cambia:
# "buildCommand": "" (déjalo vacío)
# "outputDirectory": "public" (o ".")
```

**Opción C: Limpia el proyecto en Vercel**
1. Ve a **Settings** del proyecto
2. Scroll down → **Danger Zone**
3. **Delete Project**
4. Crea uno nuevo desde el repo

**Opción D: Contacta a soporte**
- Los logs de Vercel deberían decir qué falla
- Ve a **Deployments** → último deploy → **Logs**
- Si ves algo en rojo ❌, cópialo y ten listo para soporte

---

## Error: Variables de Entorno No Funciona

### Síntoma
Los datos no llegan a n8n o la configuración no se carga.

### Solución
1. Ve a **Settings → Environment Variables**
2. Verifica que estén presentes:
   - `WEBHOOK_URL`: Completa (con https://)
   - `WHATSAPP_NUMBER`: Sin símbolos (ej: 5493462587692)
3. Hacer un **Redeploy**

---

## Error: "CORS Policy" en Consola del Navegador

### Síntoma
```
Cross-Origin Request Blocked
```

### Solución
- Abre DevTools (F12)
- Ve a Network → `/api/lead`
- Verifica que los headers incluyan:
  ```
  access-control-allow-origin: *
  access-control-allow-methods: GET, POST, OPTIONS
  ```

Si no los ves, redeploy el proyecto.

---

## Error: Datos NO llegan a n8n

### Checklist
- [ ] ¿`WEBHOOK_URL` está configurada en Vercel?
- [ ] ¿La URL es accesible (https://...)?
- [ ] ¿En n8n, el webhook está ACTIVO (ícono verde)?
- [ ] ¿El workflow en n8n está guardado y activado?

### Prueba Manual
```bash
# Desde terminal, prueba el webhook
curl -X POST https://TU-N8N/webhook/lead \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","telefono":"1234567890","interes":"test"}'
```

Si no funciona, la URL es incorrecta.

---

## Error: Número de WhatsApp no funciona

### Formato Correcto
- **SIN puntos, guiones, espacios**
- **CON código país**
- Ejemplo: `5493462587692` ✅
- Incorrecto: `549-3462-587692` ❌

### Actualizar
1. Vercel → **Settings → Environment Variables**
2. `WHATSAPP_NUMBER` = número correcto
3. Redeploy

---

## Checklist de Verificación Final

- [ ] ¿Los archivos están en git? (`git status`)
- [ ] ¿El push subió correctamente? (`git log`)
- [ ] ¿Vercel inició el deploy?
- [ ] ¿El build tiene status verde ✓?
- [ ] ¿Los logs muestran el comando de build ejecutándose?
- [ ] ¿Esperaste 2-3 minutos después de deploy?
- [ ] ¿Recargaste la página (Ctrl+F5 o Cmd+Shift+R)?
- [ ] ¿Probaste en modo incógnito para limpiar caché?

---

## Soporte Técnico

Si nada funciona:

1. **Incluye:**
   - Screenshot del error 404
   - URL del proyecto Vercel
   - Output de `git log --oneline` (últimos 3 commits)
   - Logs de deploy (Deployments → Logs)

2. **Copia los Logs:**
   - Ve a **Deployments**
   - Abre el deploy fallido
   - Ve a **"Logs"**
   - Selecciona TODO y copia (Ctrl+A, Ctrl+C)
   - Pega en GitHub Issue

3. **Archivo Debug:**
   ```bash
   # Ejecuta esto y guarda salida
   git status
   git log --oneline -5
   ls -la api/
   bash build.sh
   ```


