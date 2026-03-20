import { ensureSchema, query } from './db.js';
import crypto from 'crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('base64');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
  } catch (error) {
    console.error('DB init error (auth):', error);
    return res.status(500).json({ error: 'Base de datos no disponible' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query('SELECT id FROM dashboard_user LIMIT 1');
      return res.status(200).json({ exists: result.rows.length > 0 });
    } catch (error) {
      console.error('Error comprobando usuario:', error);
      return res.status(500).json({ error: 'Error comprobando usuario' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password requerido' });
      }

      const hashed = hashPassword(password);
      const result = await query('SELECT id, password_hash FROM dashboard_user LIMIT 1');

      if (result.rows.length === 0) {
        await query('INSERT INTO dashboard_user (username, password_hash) VALUES ($1,$2)', ['admin', hashed]);
        return res.status(200).json({ success: true, created: true });
      }

      const stored = result.rows[0].password_hash;
      if (stored !== hashed) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      return res.status(200).json({ success: true, authenticated: true });
    } catch (error) {
      console.error('Error en autenticación:', error);
      return res.status(500).json({ error: 'Error en autenticación' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
