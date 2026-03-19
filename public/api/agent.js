import { ensureSchema, query } from './db.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    console.error('DB init error (agent):', error);
    return res.status(500).json({ error: 'Base de datos no disponible' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM agent ORDER BY id DESC LIMIT 1');
      const agent = result.rows[0] || null;
      return res.status(200).json({ agent });
    } catch (error) {
      console.error('Error leyendo datos de agente:', error);
      return res.status(500).json({ error: 'Error leyendo datos de agente' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nombre, email, telefono, empresa, presentacion, foto } = req.body;
      const existing = await query('SELECT id FROM agent ORDER BY id DESC LIMIT 1');

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO agent (nombre, email, telefono, empresa, presentacion, foto) VALUES ($1,$2,$3,$4,$5,$6)`,
          [nombre, email, telefono, empresa, presentacion, foto]
        );
      } else {
        await query(
          `UPDATE agent SET nombre=$1, email=$2, telefono=$3, empresa=$4, presentacion=$5, foto=$6, updated_at = NOW() WHERE id = $7`,
          [nombre, email, telefono, empresa, presentacion, foto, existing.rows[0].id]
        );
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error guardando datos de agente:', error);
      return res.status(500).json({ error: 'Error guardando datos de agente' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
