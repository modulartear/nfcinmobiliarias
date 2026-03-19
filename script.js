// Configuración del API
const API_BASE = window.location.origin;
let numero = "5493462587692"; // Valor por defecto

// Cargar configuración del servidor
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

// FORMULARIO
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

// BOTONES DIRECTOS
function linkWhatsApp(tipo){
  return `https://wa.me/${numero}?text=${encodeURIComponent("Hola, quiero " + tipo)}`;
}

document.getElementById("btnComprar").href = linkWhatsApp("comprar propiedad");
document.getElementById("btnAlquilar").href = linkWhatsApp("alquilar");
document.getElementById("btnVender").href = linkWhatsApp("vender mi propiedad");

// CATÁLOGO (demo)
const propiedades = [
  {titulo: "Casa 3 ambientes", precio: "$120.000", zona: "Centro"},
  {titulo: "Depto 2 ambientes", precio: "$80.000", zona: "Norte"}
];

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