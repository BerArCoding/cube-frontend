const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper para fazer requests
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('cube_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    let errorMessage = 'Erro na requisição';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      console.log('Erro ao parsear resposta de erro:', e);
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

const cargoService = {
  // Buscar cargos via API
  searchCargos: async (query = '') => {
    try {
      const url = new URL(`${API_URL}/api/cargos`);
      if (query) {
        url.searchParams.append('search', query);
      }

      const cargos = await makeRequest(url.toString());
      
      return {
        success: true,
        data: cargos || []
      };
    } catch (error) {
      console.error('Erro ao buscar cargos via API:', error);
      
      // Fallback para mock se a API falhar
      const mockCargos = [
        { nome: 'Vereador', nivel: 'MUNICIPAL' },
        { nome: 'Prefeito', nivel: 'MUNICIPAL' },
        { nome: 'Vice-Prefeito', nivel: 'MUNICIPAL' },
        { nome: 'Deputado Estadual', nivel: 'ESTADUAL' },
        { nome: 'Deputado Federal', nivel: 'FEDERAL' },
        { nome: 'Senador', nivel: 'FEDERAL' },
        { nome: 'Governador', nivel: 'ESTADUAL' },
        { nome: 'Vice-Governador', nivel: 'ESTADUAL' },
        { nome: 'Presidente', nivel: 'FEDERAL' },
        { nome: 'Vice-Presidente', nivel: 'FEDERAL' }
      ];

      // Filtrar pelos cargos que contenham a query
      const filtered = mockCargos.filter(cargo => 
        cargo.nome.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: false,
        error: error.message,
        data: filtered
      };
    }
  },

  // Listar todos os cargos
  getAllCargos: async () => {
    try {
      const cargos = await makeRequest(`${API_URL}/api/cargos`);
      return {
        success: true,
        data: cargos || []
      };
    } catch (error) {
      console.error('Erro ao listar cargos:', error);
      throw error;
    }
  },

  // Método específico para obter nomes únicos dos cargos (para filtros)
  getUniqueCargoNames: async () => {
    try {
      const response = await cargoService.getAllCargos();
      
      // Extrair nomes únicos e ordenar
      const nomesUnicos = [...new Set(response.data.map(cargo => cargo.nome))];
      return {
        success: true,
        data: nomesUnicos.sort()
      };
    } catch (error) {
      console.error('Erro ao buscar nomes de cargos:', error);
      
      // Fallback para cargos básicos
      const cargosFallback = [
        'Deputado Estadual',
        'Deputado Federal',
        'Governador',
        'Prefeito', 
        'Presidente',
        'Senador',
        'Vereador',
        'Vice-Governador',
        'Vice-Prefeito',
        'Vice-Presidente'
      ];
      
      return {
        success: false,
        error: error.message,
        data: cargosFallback
      };
    }
  },

  // Buscar cargos por nível
  getCargosByLevel: async (nivel) => {
    try {
      const cargos = await makeRequest(`${API_URL}/api/cargos/nivel/${nivel}`);
      return {
        success: true,
        data: cargos || []
      };
    } catch (error) {
      console.error('Erro ao buscar cargos por nível:', error);
      throw error;
    }
  },

  // Criar novo cargo
  createCargo: async (cargoData) => {
    try {
      const novoCargo = await makeRequest(`${API_URL}/api/cargos`, {
        method: 'POST',
        body: JSON.stringify(cargoData)
      });
      
      return {
        success: true,
        data: novoCargo
      };
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      throw error;
    }
  }
};

export default cargoService;