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
      const userId = req.query.user_id;
      let query_text = 'SELECT * FROM agent';
      let params = [];
      
      if (userId) {
        query_text += ' WHERE user_id = $1';
        params = [userId];
      }
      
      query_text += ' ORDER BY id DESC LIMIT 1';
      const result = await query(query_text, params);
      const agent = result.rows[0] || null;
      return res.status(200).json({ agent });
    } catch (error) {
      console.error('Error leyendo datos de agente:', error);
      return res.status(500).json({ error: 'Error leyendo datos de agente' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nombre, email, telefono, empresa, presentacion, foto, user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id es requerido' });
      }

      const existing = await query('SELECT id FROM agent WHERE user_id = $1', [user_id]);

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO agent (user_id, nombre, email, telefono, empresa, presentacion, foto) 
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [user_id, nombre, email, telefono, empresa, presentacion, foto]
        );
      } else {
        await query(
          `UPDATE agent SET nombre=$1, email=$2, telefono=$3, empresa=$4, presentacion=$5, foto=$6, updated_at = NOW() 
           WHERE user_id = $7`,
          [nombre, email, telefono, empresa, presentacion, foto, user_id]
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

