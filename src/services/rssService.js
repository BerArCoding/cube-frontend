// Serviço RSS que utiliza sua API backend com suporte a filtros de data

class RSSService {
  constructor() {
    // URL base da sua API
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.apiEndpoint = `${this.apiBaseUrl}/api/rss`;
    
    // Cache simples para evitar requisições desnecessárias
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Obter token do localStorage (sistema cube)
  getAuthToken() {
    return localStorage.getItem('cube_token');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Headers padrão para requisições autenticadas
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Fazer requisição para a API com tratamento de erro
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.apiEndpoint}${endpoint}`;
      

      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido - limpar autenticação
          localStorage.removeItem('cube_token');
          localStorage.removeItem('cube_user');
          throw new Error('Token de autenticação inválido ou expirado');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Verifique suas permissões');
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

  // Cache helper
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}-${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Preparar parâmetros de data para a API
  prepareDateParams(options = {}) {
    const params = new URLSearchParams();
    
    // Parâmetros básicos
    if (options.language) params.append('language', options.language);
    if (options.country) params.append('country', options.country);
    if (options.limit) params.append('limit', options.limit.toString());
    
    // Filtros de data
    if (options.dateRange) {
      params.append('dateRange', options.dateRange);
      
    } else {
      if (options.dateFrom) {
        params.append('dateFrom', options.dateFrom);
        
      }
      if (options.dateTo) {
        params.append('dateTo', options.dateTo);
        
      }
    }
    
    return params;
  }

  // Buscar notícias do Google News via API com filtros de data
  async fetchGoogleNews(query = 'Brasil', options = {}) {
    const {
      language = 'pt-BR',
      country = 'BR',
      limit = 20,
      useCache = true,
      dateRange,
      dateFrom,
      dateTo
    } = options;

    // Preparar parâmetros incluindo filtros de data
    const params = this.prepareDateParams({
      language,
      country,
      limit,
      dateRange,
      dateFrom,
      dateTo
    });
    
    // Adicionar query de busca
    params.append('query', query);

    const endpoint = `/google-news?${params}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Verificar cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return this.formatApiResponse(cached);
    }

    try {
     
      const response = await this.makeRequest(endpoint);
      
      // Salvar no cache
      if (useCache) {
        this.setCache(cacheKey, response);
      }

      return this.formatApiResponse(response);

    } catch (error) {
      console.error('❌ Erro ao buscar Google News:', error);
      throw error;
    }
  }

  // Buscar notícias por categoria via API com filtros de data
  async fetchByCategory(category, options = {}) {
    const {
      language = 'pt-BR',
      country = 'BR',
      limit = 15,
      useCache = true,
      dateRange,
      dateFrom,
      dateTo
    } = options;

    // Preparar parâmetros incluindo filtros de data
    const params = this.prepareDateParams({
      language,
      country,
      limit,
      dateRange,
      dateFrom,
      dateTo
    });

    const endpoint = `/category/${category}?${params}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Verificar cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return this.formatApiResponse(cached);
    }

    try {
      
      const response = await this.makeRequest(endpoint);
      
      // Salvar no cache
      if (useCache) {
        this.setCache(cacheKey, response);
      }

      return this.formatApiResponse(response);

    } catch (error) {
      console.error(`❌ Erro ao buscar categoria ${category}:`, error);
      throw error;
    }
  }

  // Buscar RSS customizado via API com filtros de data
  async fetchCustomRSS(url, options = {}) {
    const { 
      limit = 20,
      dateRange,
      dateFrom,
      dateTo
    } = options;

    // Preparar parâmetros de query incluindo filtros de data
    const params = this.prepareDateParams({
      limit,
      dateRange,
      dateFrom,
      dateTo
    });

    try {
      
      
      const response = await this.makeRequest(`/custom?${params}`, {
        method: 'POST',
        body: JSON.stringify({ url })
      });

      return this.formatApiResponse(response);

    } catch (error) {
      console.error('❌ Erro ao buscar RSS customizado:', error);
      throw error;
    }
  }

  // Buscar notícias com filtros de data avançados
  async fetchWithDateFilter(searchOptions = {}) {
    const {
      type = 'search', // 'search', 'category', 'custom'
      query = 'Brasil',
      category = 'general',
      url = '',
      dateFilter = {},
      ...otherOptions
    } = searchOptions;

    // Preparar opções com filtros de data
    const options = {
      ...otherOptions,
      ...this.prepareDateFilterOptions(dateFilter)
    };

    

    switch (type) {
      case 'search':
        return this.fetchGoogleNews(query, options);
      case 'category':
        return this.fetchByCategory(category, options);
      case 'custom':
        return this.fetchCustomRSS(url, options);
      default:
        throw new Error(`Tipo de busca inválido: ${type}`);
    }
  }

  // Preparar opções de filtro de data baseado no objeto de filtro
  prepareDateFilterOptions(dateFilter = {}) {
    const options = {};

    if (dateFilter.type === 'range' && dateFilter.dateRange) {
      options.dateRange = dateFilter.dateRange;
    } else if (dateFilter.type === 'custom') {
      if (dateFilter.dateFrom) {
        options.dateFrom = dateFilter.dateFrom;
      }
      if (dateFilter.dateTo) {
        options.dateTo = dateFilter.dateTo;
      }
    }

    return options;
  }

  // Listar feeds disponíveis (não precisa autenticação)
  async getAvailableFeeds() {
    try {
      
      
      // Usar endpoint público (sem autenticação)
      const url = `${this.apiEndpoint}/feeds`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao listar feeds');
      }

      return data.data;

    } catch (error) {
      console.error('❌ Erro ao listar feeds:', error);
      throw error;
    }
  }

  // Testar conectividade da API
  async testConnection() {
    try {
      
      
      // Usar endpoint público de teste
      const url = `${this.apiEndpoint}/test`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        return data.success;
      } else {
        console.error('❌ Teste falhou:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      return false;
    }
  }

  // Formatar resposta da API para manter compatibilidade
  formatApiResponse(apiResponse) {
    if (!apiResponse.data || !apiResponse.data.articles) {
      console.warn('⚠️ Resposta da API sem artigos');
      return [];
    }

    const articles = apiResponse.data.articles;
    

    // Informações sobre filtros aplicados
    if (apiResponse.dateFilter) {
      
    }

    return articles.map((item, index) => ({
      guid: item.guid || `api-${Date.now()}-${index}`,
      title: item.title || 'Título não disponível',
      link: item.link,
      pubDate: item.publishedAt || item.pubDate,
      creator: item.source || 'Fonte não informada',
      summary: item.description || 'Resumo não disponível',
      thumbnail: item.thumbnail,
      categories: item.categories || [],
      sourceRegion: item.sourceRegion || 'Brasil',
      // Manter informações do filtro se disponível
      dateFiltered: !!apiResponse.dateFilter
    }));
  }

  // Buscar notícias de múltiplas categorias com filtros de data
  async fetchMultiCategory(categories = ['general', 'technology', 'business'], options = {}) {
    

    const promises = categories.map(async (category) => {
      try {
     
        const news = await this.fetchByCategory(category, { ...options, useCache: false });
        
        return news.map(item => ({
          ...item,
          category: category
        }));
      } catch (error) {
        console.error(`❌ Erro ao buscar categoria ${category}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allNews = results.flat();
    
   
    
    if (allNews.length === 0) {
      throw new Error('Nenhuma notícia foi encontrada em nenhuma categoria');
    }
    
    // Remover duplicatas e ordenar por data
    return this.removeDuplicates(allNews)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }

  // Remover notícias duplicadas
  removeDuplicates(newsArray) {
    const seen = new Set();
    return newsArray.filter(item => {
      const key = item.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Buscar principais notícias com filtros de data
  async fetchTopStories(options = {}) {
  
    return this.fetchGoogleNews('breaking news', { ...options, limit: 10 });
  }

  // Monitorar notícias em tempo real usando sua API com filtros
  startMonitoring(callback, options = {}) {
    const {
      interval = 5 * 60 * 1000, // 5 minutos
      category = 'general',
      query = 'breaking news',
      dateFilter = {}
    } = options;

  

    const monitor = async () => {
      try {
        const searchOptions = {
          useCache: false,
          limit: 10,
          ...this.prepareDateFilterOptions(dateFilter)
        };

        const news = category 
          ? await this.fetchByCategory(category, searchOptions)
          : await this.fetchGoogleNews(query, searchOptions);
        
        
        callback(news);
      } catch (error) {
        console.error('❌ Erro no monitoramento RSS:', error);
        callback([]);
      }
    };

    // Primeira execução
    monitor();

    // Executar em intervalo
    const intervalId = setInterval(monitor, interval);

    // Retornar função para parar monitoramento
    return () => {
      
      clearInterval(intervalId);
    };
  }

  // Buscar notícias por período específico (helper)
  async fetchByDateRange(range, searchOptions = {}) {
    const dateRangeOptions = {
      today: { dateRange: 'today' },
      yesterday: { dateRange: 'yesterday' },
      week: { dateRange: 'last7days' },
      month: { dateRange: 'last30days' },
      quarter: { dateRange: 'last3months' }
    };

    const dateOptions = dateRangeOptions[range];
    if (!dateOptions) {
      throw new Error(`Período inválido: ${range}. Use: ${Object.keys(dateRangeOptions).join(', ')}`);
    }

    

    return this.fetchWithDateFilter({
      ...searchOptions,
      dateFilter: { type: 'range', dateRange: dateOptions.dateRange }
    });
  }

  // Análise de tendências por período
  async analyzeTrends(query, periods = ['today', 'yesterday', 'week']) {
    

    const results = {};
    
    for (const period of periods) {
      try {
        const news = await this.fetchByDateRange(period, {
          type: 'search',
          query,
          limit: 20
        });
        
        results[period] = {
          count: news.length,
          news: news.slice(0, 5) // Top 5 por período
        };
      } catch (error) {
        console.error(`❌ Erro ao analisar período ${period}:`, error);
        results[period] = { count: 0, news: [] };
      }
    }

    return results;
  }

  // Limpar cache manualmente
  clearCache() {
    this.cache.clear();
    
  }

  // Buscar notícias com retry automático
  async fetchWithRetry(fetchFunction, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fetchFunction();
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  // Validar e formatar datas para a API
  formatDateForAPI(date) {
    if (!date) return null;
    
    try {
      // Se já é uma string no formato correto
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Se é um objeto Date
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      
      // Tentar converter string para Date
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
      
      console.warn(`⚠️ Data inválida: ${date}`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao formatar data: ${date}`, error);
      return null;
    }
  }

  // Obter estatísticas de cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

export default new RSSService();