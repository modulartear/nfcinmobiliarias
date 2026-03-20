import { ensureSchema, query } from './db.js';
import crypto from 'crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('base64');
}

export default async function handler(req, res) {
  setCors(res);

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
  } catch (error) {
    console.error('DB init error:', error);
    // Si no hay DB, permitir que el cliente siga usando otras funciones, pero avisar
    if (req.method !== 'GET') {
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nombre, telefono, interes, origen, propiedad_datos } = req.body;

      if (!nombre || !telefono || !interes) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      // Guardar en la base de datos (si está disponible)
      try {
        await query(
          `INSERT INTO leads (id, nombre, telefono, interes, origen, read, created_at) VALUES ($1,$2,$3,$4,$5,false,$6)`,
          [id, nombre, telefono, interes, origen || 'web', createdAt]
        );
      } catch (dbError) {
        console.warn('No se pudo guardar el lead en la DB:', dbError.message);
      }

      // Enviar al webhook de n8n si está configurado
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        try {
          // Preparar datos enriquecidos para el webhook
          const webhookData = {
            id,
            nombre,
            telefono,
            interes,
            origen: origen || 'web',
            createdAt,
            source: 'vercel'
          };

          // Agregar datos de la propiedad si existen
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

  if (req.method === 'GET') {
    // Retornar lista de leads y/o info de status
    try {
      const result = await query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200');
      const leads = result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        telefono: row.telefono,
        interes: row.interes,
        origen: row.origen,
        read: row.read,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
      }));
      return res.status(200).json({ leads });
    } catch (error) {
      console.error('Error leyendo leads:', error);
      return res.status(200).json({ leads: [] });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, read } = req.body;
      if (!id) return res.status(400).json({ error: 'Se requiere id del lead' });

      await query('UPDATE leads SET read = $1, updated_at = NOW() WHERE id = $2', [!!read, id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error actualizando lead:', error);
      return res.status(500).json({ error: 'Error actualizando lead' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (id) {
        await query('DELETE FROM leads WHERE id = $1', [id]);
        return res.status(200).json({ success: true });
      }

      // Borrar todos
      await query('DELETE FROM leads');
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error eliminando leads:', error);
      return res.status(500).json({ error: 'Error eliminando leads' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
