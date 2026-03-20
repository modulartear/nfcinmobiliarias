// ============================================
// CONFIGURACIÓN
// ============================================

const WEBHOOK_URL = "https://hook.us2.make.com/i2d5r8dwsnrweycn6b68m1c18xjkl33e";
let numero = "5493462587692";

// ============================================
// RENDERIZAR AGENTE
// ============================================

async function renderAgentCard() {
  let agent = null;

  // Si hay datos de NFC cargados, usar esos datos
  if (window.nfcData && window.nfcData.agent) {
    agent = window.nfcData.agent;
  } else {
    // Si no, intentar cargar del API
    try {
      const response = await fetch('/api/agent');
      const data = await response.json();
      agent = data.agent;
    } catch (err) {
      console.warn('No se pudo cargar el agente:', err);
      return;
    }
  }

  const agentContent = document.getElementById('agentContent');

  agentContent.innerHTML = `
    ${agent.foto ? `<img src="${agent.foto}" class="agent-photo">` : ''}
    
    <div class="agent-name">${agent.nombre}</div>
    <div class="agent-company">${agent.empresa}</div>
    <div class="agent-presentation">"${agent.presentacion}"</div>
    
    <div class="agent-contact">
      📧 ${agent.email} | 📱 ${agent.telefono}
    </div>

    <div class="vcard-buttons">
      <button onclick="downloadAgentVCard()">📥 Guardar Contacto</button>
      <a href="https://wa.me/${numero}">💬 WhatsApp</a>
    </div>
  `;
}

async function downloadAgentVCard() {
  const agent = await AgentManager.get();
  VCardUtils.downloadvCard(agent);
  alert('Contacto descargado');
}

// ============================================
// RENDER PROPIEDADES
// ============================================

async function renderProperties() {
  let properties = [];

  // Si hay datos de NFC cargados, usar esos datos
  if (window.nfcData && window.nfcData.properties) {
    properties = window.nfcData.properties;
  } else {
    // Si no, intentar cargar del API
    properties = await PropertiesManager.getAll();
  }

  const lista = document.getElementById('lista');

  if (!properties.length) {
    lista.innerHTML = 'No hay propiedades disponibles';
    return;
  }

  lista.innerHTML = properties.map(prop => `
    <div class="property-card">
      <img src="${prop.imagen}" class="property-image">
      <div>
        <h3>${prop.titulo}</h3>
        <p>${prop.precio} - ${prop.zona}</p>
        <button onclick="consultarPropiedad('${prop.titulo}', '${prop.imagen}', '${prop.precio}', '${prop.zona}')">
          Consultar
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// CONSULTAR PROPIEDAD
// ============================================

async function consultarPropiedad(propiedad, imagen, precio, zona) {
  // Obtener datos del cliente
  const nombre = prompt("Tu nombre completo:");
  if (!nombre) return;

  const celular = prompt("Tu número de celular:");
  if (!celular) return;

  // Preparar datos con información completa
  const data = {
    nombre,
    telefono: celular,
    interes: propiedad,
    origen: "NFC propiedad",
    // Datos adicionales de la propiedad
    propiedad_datos: {
      titulo: propiedad,
      precio: precio,
      zona: zona,
      imagen: imagen,
      descripcion: propiedad,
      tipo: "Propiedad"
    }
  };

  await enviarLead(data);

  // Mensaje mejorado con foto y datos
  const mensaje = `Hola, soy ${nombre}. Mi celular es ${celular}.\n\nMe interesa esta propiedad:\n${propiedad}${precio ? `\n💰 ${precio}\n📍 ${zona}` : ''}`;
  window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// ============================================
// FORMULARIO PRINCIPAL
// ============================================

document.getElementById("leadForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const nombre = e.target.nombre.value.trim();
  const telefono = e.target.telefono.value.trim();
  const interes = e.target.interes.value;

  if (!nombre || !telefono) {
    alert("Completa los datos");
    return;
  }

  const data = {
    nombre,
    telefono,
    interes,
    origen: "NFC formulario"
  };

  await enviarLead(data);

  setTimeout(() => {
    const mensaje = `Hola, soy ${nombre}.\n📱 Mi celular: ${telefono}\n\nBusco: ${interes}`;
    window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }, 300);
});

// ============================================
// FUNCIÓN CENTRAL (ENVÍO A MAKE)
// ============================================

async function enviarLead(data) {
  // Guardar el lead para notificaciones en el dashboard
  try {
    await LeadsManager.add({
      nombre: data.nombre,
      telefono: data.telefono,
      interes: data.interes,
      origen: data.origen || 'web',
      createdAt: new Date().toISOString(),
      read: false
    });
  } catch (err) {
    console.warn('No se pudo almacenar el lead localmente:', err);
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    console.log("Lead enviado a Make");
  } catch (err) {
    console.error("Error enviando lead al webhook:", err);
  }
}

// ============================================
// BOTONES DIRECTOS
// ============================================

function linkWhatsApp(tipo) {
  return `https://wa.me/${numero}?text=${encodeURIComponent("Hola, quiero " + tipo)}`;
}

document.getElementById("btnComprar").href = linkWhatsApp("comprar propiedad");
document.getElementById("btnAlquilar").href = linkWhatsApp("alquilar");
document.getElementById("btnVender").href = linkWhatsApp("vender mi propiedad");

// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema inmobiliario NFC activo");
});