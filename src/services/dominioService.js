import { authAPI } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class DominioService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/dominios`;
  }

  // Headers padrão para requisições autenticadas
  getHeaders() {
    const token = authAPI.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Fazer requisição com tratamento de erro
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      

      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido - limpar autenticação
          authAPI.logout();
          throw new Error('Token de autenticação inválido ou expirado');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Apenas administradores podem gerenciar domínios');
        }
        if (response.status === 404) {
          throw new Error('Domínio não encontrado');
        }
        if (response.status === 409) {
          throw new Error('Domínio já existe');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Erro desconhecido da API');
      }

      
      return data;

    } catch (error) {
      console.error(`❌ Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  // Listar todos os domínios (público)
  async listarDominios(options = {}) {
    const { 
      ativo = true, 
      busca = '', 
      limit = 50,
      isRSSapp = undefined 
    } = options;

    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    if (busca) params.append('busca', busca);
    if (limit) params.append('limit', limit.toString());
    if (isRSSapp !== undefined) params.append('isRSSapp', isRSSapp.toString());

    const endpoint = `?${params.toString()}`;

    try {
      
      const response = await this.makeRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('❌ Erro ao listar domínios:', error);
      throw error;
    }
  }

  // Obter domínio específico por ID (admin)
  async obterDominio(id) {
    try {
      
      const response = await this.makeRequest(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao obter domínio ${id}:`, error);
      throw error;
    }
  }

  // Validar formato de domínio ou URL (helper)
  validarDominioOuURL(dominio, isRSSapp = false) {
    if (!dominio || typeof dominio !== 'string') {
      return false;
    }

    const dominioTrimmed = dominio.trim();
    
    // Se for RSS.app, deve conter o padrão específico
    if (isRSSapp) {
      return dominioTrimmed.includes('rss.app/feeds/') && dominioTrimmed.includes('.xml');
    }
    
    // Aceitar URLs completas (http:// ou https://)
    const urlRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})(\/.*)?$/;
    
    // Aceitar domínios simples (exemplo.com, exemplo.com.br)
    const dominioRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    
    return urlRegex.test(dominioTrimmed) || dominioRegex.test(dominioTrimmed);
  }

  // Criar novo domínio (admin)
  async criarDominio(dominioData) {
    const { nome, dominio, ativo = true, ordem, cor, isRSSapp = false } = dominioData;

    // Validações básicas no frontend
    if (!nome || !dominio) {
      throw new Error('Nome e domínio são obrigatórios');
    }

    // Validar formato do domínio baseado no tipo
    if (!this.validarDominioOuURL(dominio, isRSSapp)) {
      if (isRSSapp) {
        throw new Error('URLs do RSS.app devem conter "rss.app/feeds/" e terminar com ".xml"');
      } else {
        throw new Error('Formato inválido. Use uma URL completa (https://exemplo.com/path) ou domínio simples (exemplo.com.br)');
      }
    }

    try {
      
      
      const response = await this.makeRequest('', {
        method: 'POST',
        body: JSON.stringify({
          nome: nome.trim(),
          dominio: dominio.trim().toLowerCase(),
          ativo,
          ordem: ordem ? parseInt(ordem) : null,
          cor: cor || '#0066CC',
          isRSSapp
        })
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar domínio:', error);
      throw error;
    }
  }

  // Atualizar domínio (admin)
  async atualizarDominio(id, dominioData) {
    const { nome, dominio, ativo, ordem, cor, isRSSapp } = dominioData;

    // Validar formato do domínio se foi fornecido
    if (dominio && !this.validarDominioOuURL(dominio, isRSSapp)) {
      if (isRSSapp) {
        throw new Error('URLs do RSS.app devem conter "rss.app/feeds/" e terminar com ".xml"');
      } else {
        throw new Error('Formato inválido. Use uma URL completa (https://exemplo.com/path) ou domínio simples (exemplo.com.br)');
      }
    }

    try {
      
      
      const updateData = {};
      if (nome !== undefined) updateData.nome = nome.trim();
      if (dominio !== undefined) updateData.dominio = dominio.trim().toLowerCase();
      if (ativo !== undefined) updateData.ativo = ativo;
      if (ordem !== undefined) updateData.ordem = ordem ? parseInt(ordem) : null;
      if (cor !== undefined) updateData.cor = cor;
      if (isRSSapp !== undefined) updateData.isRSSapp = isRSSapp;

      const response = await this.makeRequest(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar domínio ${id}:`, error);
      throw error;
    }
  }

  // Deletar domínio (admin)
  async deletarDominio(id) {
    try {
      
      
      const response = await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      });

      return response;
    } catch (error) {
      console.error(`❌ Erro ao deletar domínio ${id}:`, error);
      throw error;
    }
  }

  // Verificar funcionamento do domínio (admin)
  async verificarDominio(id) {
    try {
      
      
      const response = await this.makeRequest(`/${id}/verificar`, {
        method: 'POST'
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao verificar domínio ${id}:`, error);
      throw error;
    }
  }

  // Importar domínios em lote (admin)
  async importarDominios(dominios) {
    if (!Array.isArray(dominios) || dominios.length === 0) {
      throw new Error('Lista de domínios deve ser um array não vazio');
    }

    // Validar cada domínio antes de enviar
    const dominiosValidados = dominios.map((dominio, index) => {
      if (!dominio.nome || !dominio.dominio) {
        throw new Error(`Domínio ${index + 1}: Nome e domínio são obrigatórios`);
      }

      const isRSSapp = dominio.isRSSapp || false;

      if (!this.validarDominioOuURL(dominio.dominio, isRSSapp)) {
        if (isRSSapp) {
          throw new Error(`Domínio ${index + 1}: URLs do RSS.app devem conter "rss.app/feeds/" e terminar com ".xml" (${dominio.dominio})`);
        } else {
          throw new Error(`Domínio ${index + 1}: Formato inválido (${dominio.dominio}). Use uma URL completa ou domínio simples`);
        }
      }

      return {
        nome: dominio.nome.trim(),
        dominio: dominio.dominio.trim().toLowerCase(),
        ativo: dominio.ativo !== undefined ? dominio.ativo : true,
        ordem: dominio.ordem ? parseInt(dominio.ordem) : null,
        cor: dominio.cor || '#0066CC',
        isRSSapp
      };
    });

    try {
      
      
      const response = await this.makeRequest('/importar', {
        method: 'POST',
        body: JSON.stringify({ dominios: dominiosValidados })
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao importar domínios:', error);
      throw error;
    }
  }

  // Buscar domínios com filtro
  async buscarDominios(termo, isRSSapp = undefined) {
    try {
      
      return await this.listarDominios({ busca: termo, ativo: undefined, isRSSapp });
    } catch (error) {
      console.error('❌ Erro na busca de domínios:', error);
      throw error;
    }
  }

  // Obter domínios ativos apenas (para sugestões)
  async obterDominiosAtivos(limit = 20, isRSSapp = undefined) {
    try {
      
      return await this.listarDominios({ ativo: true, limit, isRSSapp });
    } catch (error) {
      console.error('❌ Erro ao obter domínios ativos:', error);
      throw error;
    }
  }

  // Obter apenas sites de notícias ativos
  async obterSitesNoticiasAtivos(limit = 20) {
    try {
      
      return await this.listarDominios({ ativo: true, limit, isRSSapp: false });
    } catch (error) {
      console.error('❌ Erro ao obter sites de notícias:', error);
      throw error;
    }
  }

  // Obter apenas feeds RSS.app ativos
  async obterFeedsRSSappAtivos(limit = 20) {
    try {
      
      return await this.listarDominios({ ativo: true, limit, isRSSapp: true });
    } catch (error) {
      console.error('❌ Erro ao obter feeds RSS.app:', error);
      throw error;
    }
  }

  // Validar se usuário é admin (helper)
  validarPermissaoAdmin() {
    if (!authAPI.isAuthenticated()) {
      throw new Error('Usuário não está autenticado');
    }

    if (!authAPI.isAdmin()) {
      throw new Error('Apenas administradores podem gerenciar domínios');
    }

    return true;
  }

  // Operações que requerem admin
  async operacaoAdmin(operacao) {
    try {
      this.validarPermissaoAdmin();
      return await operacao();
    } catch (error) {
      if (error.message.includes('admin') || error.message.includes('autenti')) {
        throw error;
      }
      throw new Error(`Erro na operação administrativa: ${error.message}`);
    }
  }

  // Wrapper para operações de admin
  async criarComoAdmin(dominioData) {
    return this.operacaoAdmin(() => this.criarDominio(dominioData));
  }

  async atualizarComoAdmin(id, dominioData) {
    return this.operacaoAdmin(() => this.atualizarDominio(id, dominioData));
  }

  async deletarComoAdmin(id) {
    return this.operacaoAdmin(() => this.deletarDominio(id));
  }

  async verificarComoAdmin(id) {
    return this.operacaoAdmin(() => this.verificarDominio(id));
  }

  async importarComoAdmin(dominios) {
    return this.operacaoAdmin(() => this.importarDominios(dominios));
  }
}

export const dominioService = new DominioService();
export default dominioService;