import { ensureSchema, query } from './db.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const localUsersDir = path.resolve(process.cwd(), 'data');
const localUsersFile = path.join(localUsersDir, 'dashboard_user.json');

let dbEnabled = true;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('base64');
}

function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex');
}

function ensureLocalDataPath() {
  if (!fs.existsSync(localUsersDir)) {
    fs.mkdirSync(localUsersDir, { recursive: true });
  }
  if (!fs.existsSync(localUsersFile)) {
    fs.writeFileSync(localUsersFile, JSON.stringify([]), 'utf8');
  }
}

function readLocalUsers() {
  try {
    ensureLocalDataPath();
    const text = fs.readFileSync(localUsersFile, 'utf8');
    return JSON.parse(text || '[]');
  } catch (error) {
    console.error('Error leyendo usuarios locales:', error);
    return [];
  }
}

function writeLocalUsers(users) {
  try {
    ensureLocalDataPath();
    fs.writeFileSync(localUsersFile, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error escribiendo usuarios locales:', error);
  }
}

async function findUserByUsernameOrEmail(username, email) {
  if (dbEnabled) {
    try {
      const result = await query('SELECT id, username, email, nombre, empresa, password_hash FROM dashboard_user WHERE username = $1 OR email = $2', [username, email]);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (error) {
      console.warn('DB error en findUserByUsernameOrEmail - fallback local:', error.message);
      dbEnabled = false;
    }
  }

  const users = readLocalUsers();
  return users.find(u => u.username === username || u.email === email);
}

async function createLocalUser({ username, email, passwordHash, nombre, empresa }) {
  const users = readLocalUsers();
  const newUser = {
    id: Date.now(),
    username,
    email,
    password_hash: passwordHash,
    nombre,
    empresa,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  writeLocalUsers(users);
  return newUser;
}

async function findUserByUsername(username) {
  if (dbEnabled) {
    try {
      const result = await query('SELECT id, username, email, nombre, empresa, password_hash FROM dashboard_user WHERE username = $1 OR email = $1', [username]);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (error) {
      console.warn('DB error en findUserByUsername - fallback local:', error.message);
      dbEnabled = false;
    }
  }

  const users = readLocalUsers();
  return users.find(u => u.username === username || u.email === username);
}

async function insertUserToDB({ username, email, passwordHash, nombre, empresa }) {
  if (dbEnabled) {
    try {
      const result = await query(
        `INSERT INTO dashboard_user (username, email, password_hash, nombre, empresa) VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, nombre, empresa, created_at`,
        [username, email, passwordHash, nombre, empresa]
      );
      return result.rows[0];
    } catch (error) {
      console.warn('DB error en insertUserToDB - fallback local:', error.message);
      dbEnabled = false;
    }
  }
  return createLocalUser({ username, email, passwordHash, nombre, empresa });
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
  } catch (error) {
    console.warn('DB init warning (auth):', error);
    dbEnabled = false; // fallback to local file storage
    // no return here, continue with local-only operations
  }

  const action = (req.query && req.query.action) || (req.body && req.body.action);
  const body = req.body || {};

  // ========================================
  // REGISTRO: POST /api/auth?action=register
  // ========================================
  if (req.method === 'POST' && action === 'register') {
    try {
      const { username, email, password, nombre, empresa } = body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Email, usuario y contraseña requeridos' });
      }

      // Verificar si el usuario existe
      const existing = await findUserByUsernameOrEmail(username, email);
      if (existing) {
        return res.status(409).json({ error: 'Usuario o email ya existe' });
      }

      // Crear usuario
      const passwordHash = hashPassword(password);
      const user = await insertUserToDB({
        username,
        email,
        passwordHash,
        nombre: nombre || username,
        empresa: empresa || ''
      });

      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          empresa: user.empresa
        },
        token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({ error: 'Error en registro' });
    }
  }

  // ========================================
  // LOGIN: POST /api/auth?action=login
  // ========================================
  if (req.method === 'POST' && action === 'login') {
    try {
      const { username, password } = body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      // Buscar usuario
      const user = await findUserByUsername(username);

      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const passwordHash = hashPassword(password);

      if (user.password_hash !== passwordHash) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          empresa: user.empresa
        },
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error en login' });
    }
  }

  // ========================================
  // CREAR NFC: POST /api/auth?action=create-nfc
  // ========================================
  if (req.method === 'POST' && action === 'create-nfc') {
    try {
      const { user_id, nombre, numero_whatsapp, nfc_id } = body;

      if (!user_id || !nombre || !numero_whatsapp) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      // Generar ID único para NFC si no existe
      const nfcId = nfc_id || `nfc_${crypto.randomUUID()}`;

      // Verificar que el NFC no exista
      const existing = await query('SELECT id FROM nfc_device WHERE id = $1', [nfcId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Este NFC ya existe' });
      }

      // Crear NFC
      const result = await query(
        `INSERT INTO nfc_device (id, user_id, nombre, numero_whatsapp, activo) 
         VALUES ($1, $2, $3, $4, true) 
         RETURNING id, user_id, nombre, numero_whatsapp, activo, created_at`,
        [nfcId, user_id, nombre, numero_whatsapp]
      );

      const nfc = result.rows[0];

      return res.status(201).json({
        success: true,
        message: 'NFC creado correctamente',
        nfc: {
          id: nfc.id,
          nombre: nfc.nombre,
          numero_whatsapp: nfc.numero_whatsapp,
          estado: nfc.activo ? 'activo' : 'inactivo'
        }
      });
    } catch (error) {
      console.error('Error creando NFC:', error);
      return res.status(500).json({ error: 'Error creando NFC' });
    }
  }

  // ========================================
  // OBTENER NFCs DEL USUARIO: GET /api/auth?action=get-nfcs&user_id=X
  // ========================================
  if (req.method === 'GET' && req.query.action === 'get-nfcs') {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id requerido' });
      }

      const result = await query('SELECT id, nombre, numero_whatsapp, activo, created_at FROM nfc_device WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

      return res.status(200).json({
        success: true,
        nfcs: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo NFCs:', error);
      return res.status(500).json({ error: 'Error obteniendo NFCs' });
    }
  }

  // ========================================
  // OBTENER DATOS DEL NFC: GET /api/auth?action=get-nfc-data&nfc_id=X
  // ========================================
  if (req.method === 'GET' && req.query.action === 'get-nfc-data') {
    try {
      const { nfc_id } = req.query;

      if (!nfc_id) {
        return res.status(400).json({ error: 'nfc_id requerido' });
      }

      // Obtener info del NFC y su usuario
      const nfcResult = await query(
        'SELECT id, user_id, nombre, numero_whatsapp FROM nfc_device WHERE id = $1',
        [nfc_id]
      );

      if (nfcResult.rows.length === 0) {
        return res.status(404).json({ error: 'NFC no encontrado' });
      }

      const nfc = nfcResult.rows[0];

      // Obtener datos del agente de ese usuario
      const agentResult = await query(
        'SELECT id, nombre, email, telefono, empresa, presentacion, foto FROM agent WHERE user_id = $1 LIMIT 1',
        [nfc.user_id]
      );

      // Obtener propiedades del usuario
      const propertiesResult = await query(
        'SELECT id, titulo, descripcion, precio, zona, tipo, imagen FROM properties WHERE user_id = $1 ORDER BY created_at DESC',
        [nfc.user_id]
      );

      const agent = agentResult.rows[0] || null;
      const properties = propertiesResult.rows || [];

      return res.status(200).json({
        success: true,
        nfc: {
          id: nfc.id,
          nombre: nfc.nombre,
          numero_whatsapp: nfc.numero_whatsapp
        },
        agent: agent,
        properties: properties
      });
    } catch (error) {
      console.error('Error obteniendo datos del NFC:', error);
      return res.status(500).json({ error: 'Error obteniendo datos del NFC' });
    }
  }

  // ========================================
  // VALIDAR TOKEN: GET /api/auth?action=validate
  // ========================================
  if (req.method === 'GET' && req.query.action === 'validate') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      // Token es solo referencial en este caso simple
      return res.status(200).json({ success: true, valid: true });
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  res.status(405).json({ error: 'Método no permitido' });
}
