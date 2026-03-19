// ============================================
// UTILS.JS - Funciones compartidas
// ============================================

// Gestión de Propiedades (localStorage)
const PropertiesManager = {
  STORAGE_KEY: 'nfc_properties',
  AGENT_KEY: 'nfc_agent_data',

  // Obtener todas las propiedades
  getAll() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Agregar propiedad
  add(property) {
    const properties = this.getAll();
    property.id = Date.now().toString();
    property.createdAt = new Date().toISOString();
    properties.push(property);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
    return property;
  },

  // Actualizar propiedad
  update(id, property) {
    const properties = this.getAll();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index] = { ...properties[index], ...property };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
      return properties[index];
    }
    return null;
  },

  // Eliminar propiedad
  delete(id) {
    const properties = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
  },

  // Obtener por ID
  getById(id) {
    return this.getAll().find(p => p.id === id);
  }
};

// Gestión de Datos del Agente
const AgentManager = {
  STORAGE_KEY: 'nfc_agent_data',

  // Obtener datos del agente
  get() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaults();
  },

  // Guardar datos del agente
  save(agentData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agentData));
    return agentData;
  },

  // Datos por defecto
  getDefaults() {
    return {
      nombre: 'Asesor Inmobiliario',
      email: 'agente@example.com',
      telefono: '5493462587692',
      empresa: 'Mi Inmobiliaria',
      foto: '',
      presentacion: 'Bienvenido a mi cartera de propiedades'
    };
  }
};

// Funciones para vCard
const VCardUtils = {
  // Generar vCard en formato texto
  generatevCard(agent) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${agent.nombre}
ORG:${agent.empresa}
TEL;TYPE=CELL:+${agent.telefono}
EMAIL:${agent.email}
END:VCARD`;
  },

  // Descargar vCard
  downloadvCard(agent) {
    const vcard = this.generatevCard(agent);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(vcard));
    element.setAttribute('download', `${agent.nombre}.vcf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // Generar vCard QR (usando API externa)
  generateQRUrl(agent) {
    const vcard = this.generatevCard(agent);
    const encoded = encodeURIComponent(vcard);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  }
};

// Funciones de validación
const Validators = {
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone) {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
  },

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Funciones de imagen
const ImageUtils = {
  // Convertir imagen a base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Comprimir imagen
  async compressImage(base64, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  },

  // Validar tipo de archivo
  isValidImageType(file) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  }
};

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PropertiesManager,
    AgentManager,
    VCardUtils,
    Validators,
    ImageUtils
  };
}
