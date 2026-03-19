// ============================================
// CONFIGURACIÓN
// ============================================

const WEBHOOK_URL = "https://hook.us2.make.com/i2d5r8dwsnrweycn6b68m1c18xjkl33e";
let numero = "5493462587692";

// ============================================
// RENDERIZAR AGENTE
// ============================================

async function renderAgentCard() {
  const agent = await AgentManager.get();
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
  const properties = await PropertiesManager.getAll();
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
        <button onclick="consultarPropiedad('${prop.titulo}')">
          Consultar
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// CONSULTAR PROPIEDAD
// ============================================

async function consultarPropiedad(propiedad) {
  const nombre = prompt("Tu nombre:");
  if (!nombre) return;

  const data = {
    nombre,
    telefono: "no ingresado",
    interes: propiedad,
    origen: "NFC propiedad"
  };

  await enviarLead(data);

  const mensaje = `Hola, me interesa esta propiedad: ${propiedad}`;
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
    const mensaje = `Hola, soy ${nombre}. Busco ${interes}`;
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

document.addEventListener("DOMContentLoaded", async () => {
  await renderAgentCard();
  await renderProperties();
  console.log("Sistema inmobiliario NFC activo");
});