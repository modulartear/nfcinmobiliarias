#!/bin/bash
# Script de build manual para Vercel

echo "🔨 Construyendo proyecto para Vercel..."

# Crear carpeta public
mkdir -p public

# Copiar archivos estáticos
cp index.html public/
cp style.css public/
cp config.json public/
cp config.js public/
cp script.js public/

# Copiar API serverless
rm -rf public/api 2>/dev/null
cp -r api public/ 2>/dev/null

echo "✅ Build completado!"
echo "📁 Archivos en ./public/"
ls -la public/
