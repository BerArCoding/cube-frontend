const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const candidateService = {
  // Criar novo candidato
  async createCandidate(candidateData) {
    console.log('Tentando criar candidato:', candidateData);
    
    if (!candidateData.nome?.trim()) {
      throw new Error('Nome é obrigatório');
    }

    return makeRequestWithFallback(`${API_URL}/api/candidates`, {
      method: 'POST',
      body: JSON.stringify(candidateData)
    });
  },

  // Atualizar candidato existente
  async updateCandidate(id, candidateData) {
    console.log('Tentando atualizar candidato:', id, candidateData);
    
    if (!candidateData.nome?.trim()) {
      throw new Error('Nome é obrigatório');
    }

    return makeRequestWithFallback(`${API_URL}/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData)
    });
  },

  // Listar todos os candidatos
  async getAllCandidates(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const url = `${API_URL}/api/candidates${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return makeRequestWithFallback(url);
  },

  // Inativar candidato (soft delete)
  async deactivateCandidate(id) {
    console.log('Inativando candidato:', id);
    
    return makeRequestWithFallback(`${API_URL}/api/candidates/${id}`, {
      method: 'DELETE'
    });
  },

  // Reativar candidato
  async reactivateCandidate(id) {
    console.log('Reativando candidato:', id);
    
    return makeRequestWithFallback(`${API_URL}/api/candidates/${id}/reactivate`, {
      method: 'PUT'
    });
  },

  // Buscar candidato por ID
  async getCandidateById(id, includeInactive = false) {
    const params = includeInactive ? '?includeInactive=true' : '';
    return makeRequestWithFallback(`${API_URL}/api/candidates/${id}${params}`);
  }
};

// Helper para fazer requests com fallback
const makeRequestWithFallback = async (url, options = {}) => {
  const token = localStorage.getItem('cube_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`API request failed: ${error.message}`);
    
    // Fallback para dados mock apenas para GET
    if (!options.method || options.method === 'GET') {
      const mockCandidate = {
        id: '1',
        nome: 'João Silva',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        cargoAtual: 'Vereador',
        cargoPretendido: 'Prefeito',
        redutoOrigem: 'São Paulo - SP',
        votosUltimaEleicao: 15000,
        pontuacaoViabilidade: 7.5,
        instagramHandle: '@joaosilva',
        ativo: true,
        criadoEm: '2025-01-10',
        criador: { nome: 'Admin', email: 'admin@cube.com' }
      };
      
      return {
        success: true,
        data: url.includes('/candidates/') && !url.includes('?') ? mockCandidate : [mockCandidate]
      };
    }
    
    // Para outros métodos, relançar o erro
    throw error;
  }
};

export default candidateService;