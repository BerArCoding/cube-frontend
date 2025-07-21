const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper para fazer requests
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('cube_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

const cargoService = {
  // Buscar todos os cargos
  getAllCargos: async () => {
    try {
      const result = await makeRequest(`${API_URL}/api/cargos`);
      return result; // { success: true, data: [...] }
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      return { success: false, data: [], error: error.message };
    }
  },

    getUniqueCargoNames: async () => {
    try {
      const result = await makeRequest(`${API_URL}/api/cargos/unique-names`);
      return result;
    } catch (error) {
      console.error('Erro ao buscar nomes únicos de cargos:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Buscar cargos com filtro
  searchCargos: async (query = '') => {
    try {
      const url = query 
        ? `${API_URL}/api/cargos?search=${encodeURIComponent(query)}`
        : `${API_URL}/api/cargos`;
      
      const result = await makeRequest(url);
      return result;
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Buscar cargos por nível
  getCargosByLevel: async (nivel) => {
    try {
      const result = await makeRequest(`${API_URL}/api/cargos/nivel/${nivel}`);
      return result;
    } catch (error) {
      console.error('Erro ao buscar cargos por nível:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Criar novo cargo
  createCargo: async (cargoData) => {
    try {
      const result = await makeRequest(`${API_URL}/api/cargos`, {
        method: 'POST',
        body: JSON.stringify(cargoData),
      });
      return result;
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      throw error;
    }
  }
};

export default cargoService;