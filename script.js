// ============================================
// SCRIPT.JS - Lógica Principal
// ============================================

// Configuración del API
const API_BASE = window.location.origin;
let numero = "5493462587692"; // Valor por defecto

// ============================================
// CARGAR CONFIGURACIÓN DEL SERVIDOR
// ============================================

fetch(`${API_BASE}/api/lead`)
  .then(res => {
    if (!res.ok) throw new Error('Failed to load config');
    return res.json();
  })
  .then(config => {
    if (config.whatsappNumber) {
      numero = config.whatsappNumber;
    }
  })
  .catch(err => console.warn('Could not load config from server:', err));

// ============================================
// RENDERIZAR VCARD DEL AGENTE
// ============================================

function renderAgentCard() {
  const agent = AgentManager.get();
  const agentContent = document.getElementById('agentContent');

  agentContent.innerHTML = `
    ${agent.foto ? `<img src="${agent.foto}" alt="${agent.nombre}" class="agent-photo">` : ''}
    
    <div class="agent-name">${agent.nombre}</div>
    <div class="agent-company">${agent.empresa}</div>
    <div class="agent-presentation">"${agent.presentacion}"</div>
    <div class="agent-contact">
      📧 ${agent.email} | 📱 ${agent.telefono}
    </div>

    <div class="vcard-buttons">
      <button class="btn-vcard" onclick="downloadAgentVCard()">📥 Guardar Contacto</button>
      <a href="https://wa.me/${numero}" class="btn-whatsapp-agent" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">💬 WhatsApp</a>
    </div>
  `;
}

function downloadAgentVCard() {
  const agent = AgentManager.get();
  VCardUtils.downloadvCard(agent);
  alert('✅ Contacto descargado. Puedes importarlo en tu agenda.');
}

// ============================================
// RENDERIZAR PROPIEDADES
// ============================================

function renderProperties() {
  const properties = PropertiesManager.getAll();
  const lista = document.getElementById('lista');

  if (properties.length === 0) {
    lista.innerHTML = '<div class="no-properties">No hay propiedades disponibles en este momento</div>';
    return;
  }

  lista.innerHTML = properties.map(prop => `
    <div class="property-card">
      <img src="${prop.imagen}" alt="${prop.titulo}" class="property-image">
      <div class="property-info">
        <div class="property-title">${prop.titulo}</div>
        <div class="property-price">${prop.precio}</div>
        <div class="property-details">
          <strong>${prop.tipo}</strong> • ${prop.zona}<br>
          ${prop.caracteristicas.substring(0, 50)}...
        </div>
        <button class="btn-consultar" onclick="consultarPropiedad('${prop.titulo}')">Consultar</button>
      </div>
    </div>
  `).join('');
}

function consultarPropiedad(nombrePropiedad) {
  const nombre = prompt('¿Cuál es tu nombre?');
  if (!nombre) return;

  const mensaje = `Hola, me interesa esta propiedad: ${nombrePropiedad}`;
  
  // Enviar al API serverless
  fetch(`${API_BASE}/api/lead`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ 
      nombre, 
      telefono: 'contacto directo',
      interes: nombrePropiedad
    })
  }).catch(err => console.error('Error enviando consulta:', err));

  // Redirigir a WhatsApp
  window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// ============================================
// FORMULARIO PRINCIPAL
// ============================================

document.getElementById("leadForm").addEventListener("submit", function(e){
  e.preventDefault();

  const nombre = e.target.nombre.value.trim();
  const telefono = e.target.telefono.value.trim();
  const interes = e.target.interes.value;

  // Validar datos
  if (!nombre || !telefono || !interes) {
    alert('Por favor completa todos los campos');
    return;
  }

  // Enviar al API serverless de Vercel
  fetch(`${API_BASE}/api/lead`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nombre, telefono, interes })
  })
  .then(res => {
    if (!res.ok) console.error('API error:', res.status);
    return res.json();
  })
  .catch(err => console.error('Error enviando lead:', err));

  // Redirigir a WhatsApp después de un pequeño delay
  setTimeout(() => {
    const mensaje = `Hola, soy ${nombre}. Estoy interesado en ${interes}`;
    window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }, 500);
});

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
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  renderAgentCard();
  renderProperties();
  
  console.log('✅ Página principal cargada correctamente');
  console.log('📊 Propiedades cargadas:', PropertiesManager.getAll().length);
});

const lista = document.getElementById("lista");

propiedades.forEach(p => {
  const div = document.createElement("div");
  div.className = "propiedad";
  div.innerHTML = `
    <h3>${p.titulo}</h3>
    <p>${p.precio} - ${p.zona}</p>
    <a href="${linkWhatsApp(p.titulo)}">Consultar</a>
  `;
  lista.appendChild(div);
});