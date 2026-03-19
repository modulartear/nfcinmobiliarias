export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { nombre, telefono, interes } = req.body;

      // Validar datos
      if (!nombre || !telefono || !interes) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      // Enviar al webhook de n8n si está configurado
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              nombre, 
              telefono, 
              interes, 
              timestamp: new Date().toISOString(),
              source: 'vercel'
            })
          });
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // No fallar si el webhook no funciona, solo loguear
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Lead recibido correctamente' 
      });
    } catch (error) {
      console.error('Error procesando lead:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'GET') {
    // Retornar solo la información no sensible
    return res.status(200).json({
      whatsappNumber: process.env.WHATSAPP_NUMBER || '5493462587692',
      status: 'ready'
    });
  }

  res.status(405).json({ error: 'Método no permitido' });
}
