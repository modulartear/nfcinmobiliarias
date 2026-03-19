// ============================================
// DASHBOARD.JS - Lógica del Dashboard
// ============================================

// Cambiar entre tabs
function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Desactivar todos los botones
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar tab seleccionado
  document.getElementById(tabName).classList.add('active');

  // Activar botón
  event.target.classList.add('active');

  // Recargar vista previa del agente si es necesario
  if (tabName === 'agent') {
    renderAgentPreview();
  }
}

// ============================================
// PROPIEDADES
// ============================================

function previewPropertyImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!ImageUtils.isValidImageType(file)) {
    alert('Por favor selecciona una imagen válida (JPG, PNG, WebP)');
    event.target.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no debe superar 5MB');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('propImagePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function handleAddProperty(event) {
  event.preventDefault();
  const alertDiv = document.getElementById('alertProperty');
  alertDiv.innerHTML = '';

  try {
    const imageFile = document.getElementById('propImage').files[0];
    if (!imageFile) {
      showAlert('alertProperty', 'Por favor selecciona una imagen', 'error');
      return;
    }

    // Convertir y comprimir imagen
    let base64 = await ImageUtils.fileToBase64(imageFile);
    base64 = await ImageUtils.compressImage(base64);

    const property = {
      titulo: document.getElementById('propTitle').value,
      descripcion: document.getElementById('propDescription').value,
      precio: document.getElementById('propPrice').value,
      zona: document.getElementById('propLocation').value,
      tipo: document.getElementById('propType').value,
      caracteristicas: document.getElementById('propFeatures').value,
      imagen: base64
    };

    // Validar
    if (!property.titulo || !property.precio || !property.zona) {
      showAlert('alertProperty', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Guardar
    PropertiesManager.add(property);
    showAlert('alertProperty', '✅ Propiedad guardada correctamente', 'success');

    // Limpiar formulario
    document.getElementById('propertyForm').reset();
    document.getElementById('propImagePreview').style.display = 'none';

    // Actualizar lista
    renderProperties();

  } catch (error) {
    console.error('Error:', error);
    showAlert('alertProperty', '❌ Error al guardar la propiedad', 'error');
  }
}

function renderProperties() {
  const properties = PropertiesManager.getAll();
  const container = document.getElementById('propertiesList');

  if (properties.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay propiedades guardadas aún</p>';
    return;
  }

  container.innerHTML = properties.map(prop => `
    <div class="property-card">
      <img src="${prop.imagen}" alt="${prop.titulo}" class="property-image">
      <div class="property-content">
        <div class="property-title">${prop.titulo}</div>
        <div class="property-price">${prop.precio}</div>
        <div class="property-details">
          <strong>Tipo:</strong> ${prop.tipo}<br>
          <strong>Zona:</strong> ${prop.zona}<br>
          <strong>Características:</strong> ${prop.caracteristicas.substring(0, 40)}...
        </div>
        <div class="property-actions">
          <button class="btn btn-secondary" onclick="editProperty('${prop.id}')">✏️ Editar</button>
          <button class="btn btn-danger" onclick="deleteProperty('${prop.id}')">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editProperty(id) {
  alert('Función de edición pendiente de implementar');
  // TODO: Implementar edición
}

function deleteProperty(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
    PropertiesManager.delete(id);
    showAlert('alertProperty', '✅ Propiedad eliminada', 'success');
    renderProperties();
  }
}

// ============================================
// DATOS DEL AGENTE
// ============================================

function previewAgentImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!ImageUtils.isValidImageType(file)) {
    alert('Por favor selecciona una imagen válida (JPG, PNG, WebP)');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('agentPhotoPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function handleSaveAgent(event) {
  event.preventDefault();
  const alertDiv = document.getElementById('alertAgent');
  alertDiv.innerHTML = '';

  try {
    const photoFile = document.getElementById('agentPhoto').files[0];
    let photo = '';

    if (photoFile) {
      photo = await ImageUtils.fileToBase64(photoFile);
      photo = await ImageUtils.compressImage(photo);
    }

    const agentData = {
      nombre: document.getElementById('agentName').value,
      email: document.getElementById('agentEmail').value,
      telefono: document.getElementById('agentPhone').value.replace(/\D/g, ''),
      empresa: document.getElementById('agentCompany').value,
      presentacion: document.getElementById('agentPresentation').value,
      foto: photo
    };

    // Validar
    if (!agentData.nombre || !agentData.email || !agentData.telefono) {
      showAlert('alertAgent', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    if (!Validators.isValidEmail(agentData.email)) {
      showAlert('alertAgent', 'Email inválido', 'error');
      return;
    }

    if (!Validators.isValidPhone(agentData.telefono)) {
      showAlert('alertAgent', 'Teléfono inválido (mínimo 10 dígitos)', 'error');
      return;
    }

    // Guardar
    AgentManager.save(agentData);
    showAlert('alertAgent', '✅ Datos guardados correctamente', 'success');
    renderAgentPreview();

  } catch (error) {
    console.error('Error:', error);
    showAlert('alertAgent', '❌ Error al guardar datos', 'error');
  }
}

function renderAgentPreview() {
  const agent = AgentManager.get();
  const qrUrl = VCardUtils.generateQRUrl(agent);
  
  const container = document.getElementById('agentPreview');
  container.innerHTML = `
    ${agent.foto ? `<img src="${agent.foto}" alt="${agent.nombre}" class="agent-photo">` : '<div style="width:150px; height:150px; margin:0 auto 15px; background:#f0f0f0; border-radius:50%; border:3px solid black;"></div>'}
    
    <div class="agent-info">
      <h2>${agent.nombre}</h2>
      <p><strong>${agent.empresa}</strong></p>
      <p>${agent.presentacion}</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        📧 ${agent.email}<br>
        📱 ${agent.telefono}
      </p>
    </div>

    <div class="qr-code">
      <p><strong>Código QR (vCard)</strong></p>
      <img src="${qrUrl}" alt="QR vCard">
      <button class="btn btn-secondary" onclick="downloadAgentVCard()" style="margin-top: 10px;">
        📥 Descargar vCard
      </button>
    </div>
  `;
}

function downloadAgentVCard() {
  const agent = AgentManager.get();
  VCardUtils.downloadvCard(agent);
}

// ============================================
// UTILIDADES
// ============================================

function showAlert(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  
  // Auto-desaparecer después de 5 segundos
  if (type === 'success') {
    setTimeout(() => {
      element.innerHTML = '';
    }, 5000);
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos del agente si existen
  const agent = AgentManager.get();
  if (agent) {
    document.getElementById('agentName').value = agent.nombre;
    document.getElementById('agentEmail').value = agent.email;
    document.getElementById('agentPhone').value = agent.telefono;
    document.getElementById('agentCompany').value = agent.empresa;
    document.getElementById('agentPresentation').value = agent.presentacion;
  }

  // Renderizar propiedades
  renderProperties();
  renderAgentPreview();

  console.log('Dashboard inicializado correctamente');
});
