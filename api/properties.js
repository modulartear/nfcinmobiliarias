import { ensureSchema, query } from './db.js';
import crypto from 'crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
  } catch (error) {
    console.error('DB init error (properties):', error);
    return res.status(500).json({ error: 'Base de datos no disponible' });
  }

  if (req.method === 'GET') {
    try {
      const userId = req.query.user_id;
      let query_text = 'SELECT * FROM properties';
      let params = [];
      
      if (userId) {
        query_text += ' WHERE user_id = $1';
        params = [userId];
      }
      
      query_text += ' ORDER BY created_at DESC';
      const result = await query(query_text, params);
      return res.status(200).json({ properties: result.rows });
    } catch (error) {
      console.error('Error leyendo propiedades:', error);
      return res.status(500).json({ error: 'Error leyendo propiedades' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { titulo, descripcion, precio, zona, tipo, caracteristicas, imagen, user_id } = req.body;
      if (!titulo || !descripcion) {
        return res.status(400).json({ error: 'Faltan campos necesarios' });
      }

      if (!user_id) {
        return res.status(400).json({ error: 'user_id es requerido' });
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await query(
        `INSERT INTO properties (id, user_id, titulo, descripcion, precio, zona, tipo, caracteristicas, imagen, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [id, user_id, titulo, descripcion, precio, zona, tipo, caracteristicas, imagen, createdAt]
      );

      return res.status(200).json({ success: true, property: { id, titulo, descripcion, precio, zona, tipo, caracteristicas, imagen, created_at: createdAt } });
    } catch (error) {
      console.error('Error guardando propiedad:', error);
      return res.status(500).json({ error: 'Error guardando propiedad' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Se requiere id' });
      }

      const validFields = ['titulo', 'descripcion', 'precio', 'zona', 'tipo', 'caracteristicas', 'imagen'];
      const setClauses = [];
      const values = [];
      let idx = 1;

      for (const key of validFields) {
        if (key in updates) {
          setClauses.push(`${key} = $${idx}`);
          values.push(updates[key]);
          idx++;
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      const sql = `UPDATE properties SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx}`;
      await query(sql, values);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error actualizando propiedad:', error);
      return res.status(500).json({ error: 'Error actualizando propiedad' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Se requiere id' });
      }

      await query('DELETE FROM properties WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error eliminando propiedad:', error);
      return res.status(500).json({ error: 'Error eliminando propiedad' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
