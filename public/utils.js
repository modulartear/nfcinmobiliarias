// ============================================
// UTILS.JS - Funciones compartidas
// ============================================

// Cliente API (intenta usar la API del backend, si falla se cae a localStorage)
const ApiClient = {
  async request(path, options = {}) {
    const finalOpts = {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const res = await fetch(path, finalOpts);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const error = data?.error || res.statusText;
      throw new Error(error);
    }

    return data;
  },

  get(path) {
    return this.request(path, { method: 'GET' });
  },

  post(path, body) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  },

  put(path, body) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
};

// Gestión de Propiedades
const PropertiesManager = {
  STORAGE_KEY: 'nfc_properties',

  async getAll() {
    try {
      const data = await ApiClient.get('/api/properties');
      return data.properties || [];
    } catch (err) {
      console.warn('API propiedades no disponible, usando localStorage:', err.message);
      const fallback = localStorage.getItem(this.STORAGE_KEY);
      return fallback ? JSON.parse(fallback) : [];
    }
  },

  async add(property) {
    try {
      const data = await ApiClient.post('/api/properties', property);
      return data.property;
    } catch (err) {
      console.warn('API propiedades no disponible, guardando localmente:', err.message);
      const properties = await this.getAll();
      const item = { ...property, id: Date.now().toString(), createdAt: new Date().toISOString() };
      properties.unshift(item);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
      return item;
    }
  },

  async update(id, property) {
    try {
      await ApiClient.put('/api/properties', { id, ...property });
      return { id, ...property };
    } catch (err) {
      console.warn('API propiedades no disponible, actualizando localmente:', err.message);
      const properties = await this.getAll();
      const index = properties.findIndex(p => p.id === id);
      if (index !== -1) {
        properties[index] = { ...properties[index], ...property };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
        return properties[index];
      }
      return null;
    }
  },

  async delete(id) {
    try {
      await ApiClient.delete(`/api/properties?id=${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn('API propiedades no disponible, eliminando localmente:', err.message);
      const properties = (await this.getAll()).filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
    }
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(p => p.id === id);
  }
};

// Gestión de Datos del Agente
const AgentManager = {
  STORAGE_KEY: 'nfc_agent_data',

  async get() {
    try {
      const data = await ApiClient.get('/api/agent');
      if (data && data.agent) return data.agent;
      throw new Error('No hay datos de agente');
    } catch (err) {
      console.warn('API agente no disponible, usando localStorage:', err.message);
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaults();
    }
  },

  async save(agentData) {
    try {
      await ApiClient.post('/api/agent', agentData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agentData));
      return agentData;
    } catch (err) {
      console.warn('API agente no disponible, guardando localmente:', err.message);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agentData));
      return agentData;
    }
  },

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

// Gestión de Leads (notificaciones)
const LeadsManager = {
  STORAGE_KEY: 'nfc_leads',

  async getAll() {
    try {
      const data = await ApiClient.get('/api/lead');
      return data.leads || [];
    } catch (err) {
      console.warn('API leads no disponible, usando localStorage:', err.message);
      const fallback = localStorage.getItem(this.STORAGE_KEY);
      return fallback ? JSON.parse(fallback) : [];
    }
  },

  async add(lead) {
    try {
      const data = await ApiClient.post('/api/lead', lead);
      return data.lead || lead;
    } catch (err) {
      console.warn('API leads no disponible, guardando localmente:', err.message);
      const leads = await this.getAll();
      const item = { id: Date.now().toString(), createdAt: new Date().toISOString(), read: false, ...lead };
      leads.unshift(item);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
      return item;
    }
  },

  async markRead(id) {
    try {
      await ApiClient.put('/api/lead', { id, read: true });
    } catch (err) {
      console.warn('API leads no disponible, guardando estado localmente:', err.message);
      const leads = await this.getAll();
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        leads[index].read = true;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
      }
    }
  },

  async update(id, changes) {
    try {
      await ApiClient.put('/api/lead', { id, ...changes });
      return { id, ...changes };
    } catch (err) {
      console.warn('API leads no disponible, actualizando localmente:', err.message);
      const leads = await this.getAll();
      const index = leads.findIndex(l => l.id === id);
      if (index === -1) return null;
      leads[index] = { ...leads[index], ...changes };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
      return leads[index];
    }
  },

  async delete(id) {
    try {
      await ApiClient.delete(`/api/lead?id=${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn('API leads no disponible, eliminando localmente:', err.message);
      const leads = (await this.getAll()).filter(l => l.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    }
  },

  async markAllRead() {
    try {
      const leads = await this.getAll();
      await Promise.all(leads.map(l => ApiClient.put('/api/lead', { id: l.id, read: true })));
    } catch (err) {
      console.warn('API leads no disponible, marcando localmente:', err.message);
      const leads = (await this.getAll()).map(l => ({ ...l, read: true }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    }
  },

  async clear() {
    try {
      await ApiClient.delete('/api/lead');
    } catch (err) {
      console.warn('API leads no disponible, borrando localmente:', err.message);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  },

  async countUnread() {
    const leads = await this.getAll();
    return leads.filter(l => !l.read).length;
  }
};

// Gestión de contraseña del dashboard
const PasswordManager = {
  STORAGE_KEY: 'nfc_dashboard_password',

  async hash(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray));
  },

  async set(password) {
    try {
      await ApiClient.post('/api/auth', { password });
    } catch (err) {
      console.warn('API auth no disponible, guardando localmente:', err.message);
    }
    const hashed = await this.hash(password);
    localStorage.setItem(this.STORAGE_KEY, hashed);
  },

  async verify(password) {
    try {
      const res = await ApiClient.post('/api/auth', { password });
      return res.success === true;
    } catch (err) {
      console.warn('API auth no disponible, verificando localmente:', err.message);
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;
      const hashed = await this.hash(password);
      return stored === hashed;
    }
  },

  async isSet() {
    try {
      const res = await ApiClient.get('/api/auth');
      return res.exists === true;
    } catch (err) {
      console.warn('API auth no disponible, revisando localmente:', err.message);
      return !!localStorage.getItem(this.STORAGE_KEY);
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
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
    LeadsManager,
    PasswordManager,
    VCardUtils,
    Validators,
    ImageUtils
  };
}
