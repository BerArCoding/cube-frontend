import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui';
import rssService from '../services/rssService';
import authAPI from '../services/auth';
import dominioService from '../services/dominioService';
import { 
  RefreshCw, 
  ExternalLink, 
  Calendar, 
  Globe, 
  Search,
  Filter,
  TrendingUp,
  Clock,
  AlertCircle,
  Shield,
  Wifi,
  WifiOff,
  CalendarDays,
  X,
  Link,
  Bookmark,
  Rss,
  Plus,
  Trash2,
  Star,
  Edit,
  Check
} from 'lucide-react';

const RSSFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados existentes
  const [domainFilter, setDomainFilter] = useState('');
  const [searchMode, setSearchMode] = useState('general');
  const [showDomainFilters, setShowDomainFilters] = useState(false);
  const [dominiosCadastrados, setDominiosCadastrados] = useState([]);
  const [loadingDominios, setLoadingDominios] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'none',
    dateRange: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [articlesLimit, setArticlesLimit] = useState(50);

  // Novos estados para RSS.APP
  const [rssAppMode, setRssAppMode] = useState(false);
  const [rssAppUrl, setRssAppUrl] = useState('');
  const [rssAppFeeds, setRssAppFeeds] = useState([]);
  const [loadingRssApp, setLoadingRssApp] = useState(false);
  const [showRssAppManager, setShowRssAppManager] = useState(false);
  const [newRssAppFeed, setNewRssAppFeed] = useState({ url: '', name: '', description: '' });
  const [editingFeed, setEditingFeed] = useState(null);

  // Categorias alinhadas com sua API
  const categories = [
    { id: 'general', name: 'Geral', icon: Globe },
    { id: 'business', name: 'Negócios', icon: TrendingUp },
    { id: 'technology', name: 'Tecnologia', icon: TrendingUp },
    { id: 'entertainment', name: 'Entretenimento', icon: Globe },
    { id: 'science', name: 'Ciência', icon: Globe },
    { id: 'sports', name: 'Esportes', icon: TrendingUp },
    { id: 'world', name: 'Mundo', icon: Globe }
  ];

  // Configurações de país/idioma para sua API
  const countrySettings = {
    'BR': { country: 'BR', language: 'pt-BR', name: 'Brasil', flag: '🇧🇷' },
    'US': { country: 'US', language: 'en-US', name: 'Estados Unidos', flag: '🇺🇸' },
    'GB': { country: 'GB', language: 'en-GB', name: 'Reino Unido', flag: '🇬🇧' }
  };

  // Filtros de data pré-definidos
  const dateRangeOptions = [
    { value: '', label: 'Todas as datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'last3months', label: 'Últimos 3 meses' }
  ];

  const [selectedCountry, setSelectedCountry] = useState('BR');

  // Função para validar URL do RSS.APP
  const isValidRssAppUrl = (url) => {
    return url.includes('rss.app/feeds/') && url.endsWith('.xml');
  };

  // Função para buscar notícias do RSS.APP
  const fetchRssAppFeed = async (url) => {
    try {
      setLoadingRssApp(true);
      setError(null);
      
      console.log(`🔍 Buscando feed RSS.APP: ${url}`);
      
      // Fazer requisição para buscar o feed RSS
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao acessar feed: ${response.status}`);
      }
      
      const xmlText = await response.text();
      
      // Parse do XML para extrair notícias
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Verificar se houve erro no parse
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Erro ao processar XML do feed');
      }
      
      // Extrair itens do feed
      const items = xmlDoc.querySelectorAll('item');
      const feedNews = Array.from(items).map((item, index) => {
        const title = item.querySelector('title')?.textContent || 'Sem título';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const creator = item.querySelector('dc\\:creator, creator')?.textContent || 'RSS.APP';
        const category = item.querySelector('category')?.textContent || 'RSS Feed';
        
        return {
          guid: `rssapp-${Date.now()}-${index}`,
          title: title.trim(),
          link: link.trim(),
          summary: description.replace(/<[^>]*>/g, '').trim(), // Remove HTML tags
          pubDate: pubDate,
          publishedAt: pubDate,
          creator: creator,
          category: category,
          source: 'RSS.APP',
          sourceRegion: 'RSS Feed'
        };
      });
      
      console.log(`✅ ${feedNews.length} notícias carregadas do RSS.APP`);
      
      // Ordenar por data mais recente primeiro
      const sortedNews = feedNews.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB - dateA;
      });
      
      setNews(sortedNews);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (err) {
      const errorMsg = `Erro ao carregar feed RSS.APP: ${err.message}`;
      setError(errorMsg);
      console.error('❌ Erro ao buscar RSS.APP:', err);
      setNews([]);
      setConnectionStatus('error');
    } finally {
      setLoadingRssApp(false);
    }
  };

  useEffect(() => {
  const carregarRSSAppFeeds = async () => {
    try {
      console.log('🔄 Carregando domínios...');
      const dominiosData = await dominioService.obterFeedsRSSappAtivos();
      console.log(dominiosData);
      setRssAppFeeds(dominiosData);
      console.log(`✅ ${dominiosData.length} domínios carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar domínios:', error);
      setError(`Erro ao carregar domínios: ${error.message}`);
      setRssAppFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  carregarRSSAppFeeds();
}, []);

  // Verificar autenticação usando seu authAPI
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authAPI.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setError('Você precisa estar logado para acessar as notícias');
      }
    };

    checkAuth();
  }, []);

  // Carregar domínios cadastrados (código existente)
  useEffect(() => {
    const carregarDominios = async () => {
      if (!authAPI.isAuthenticated() || rssAppMode) {
        return;
      }

      setLoadingDominios(true);
      try {
        console.log('📋 Carregando domínios cadastrados...');
        const dominios = await dominioService.listarDominios({ 
          ativo: true, 
          limit: 100 ,
          isRSSapp: false
        });
        
        const dominiosFormatados = dominios.map(dominio => ({
          domain: dominio.dominio,
          domainOriginal: dominio.dominio,
          name: dominio.nome,
          flag: dominio.cor ? '●' : '🌐',
          color: dominio.cor,
          id: dominio.id
        }));

        setDominiosCadastrados(dominiosFormatados);
        console.log(`✅ ${dominiosFormatados.length} domínios carregados:`, dominiosFormatados.map(d => `${d.name} (${d.domain})`));
      } catch (error) {
        console.error('❌ Erro ao carregar domínios:', error);
        setDominiosCadastrados([]);
      } finally {
        setLoadingDominios(false);
      }
    };

    carregarDominios();
  }, [isAuthenticated, rssAppMode]);

  // Função para construir query com domínio (código existente)
  const buildSearchQuery = () => {
    let query = '';
    
    if (domainFilter && searchMode !== 'general') {
      query += `site:${domainFilter}`;
    }
    
    if (searchTerm && searchMode !== 'domain') {
      if (query) query += ' ';
      query += searchTerm;
    }
    
    return query.trim();
  };

  // Função para buscar notícias via API com filtros de domínio e data (código existente)
  const fetchNews = async (category = 'general', search = '', dateFilterOptions = {}) => {
    if (!authAPI.isAuthenticated()) {
      setError('Autenticação necessária');
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Buscando notícias: categoria="${category}", busca="${search}"`, dateFilterOptions);
      
      let newsData = [];
      const settings = countrySettings[selectedCountry];
      
      const fetchOptions = {
        language: settings.language,
        country: settings.country,
        limit: articlesLimit,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        ...dateFilterOptions
      };

      const finalQuery = buildSearchQuery();
      
      if (finalQuery || search) {
        const searchQuery = finalQuery || search;
        console.log(`📡 Query final para API: "${searchQuery}"`);
        newsData = await rssService.fetchGoogleNews(searchQuery, fetchOptions);
      } else if (searchMode === 'domain' && domainFilter) {
        console.log(`🌐 Buscando apenas no domínio: ${domainFilter}`);
        newsData = await rssService.fetchGoogleNews(`site:${domainFilter}`, fetchOptions);
      } else {
        newsData = await rssService.fetchByCategory(category, fetchOptions);
      }

      const sortedNews = newsData.sort((a, b) => {
        const dateA = new Date(a.pubDate || a.publishedAt || 0);
        const dateB = new Date(b.pubDate || b.publishedAt || 0);
        return dateB - dateA;
      });

      console.log(`✅ ${sortedNews.length} notícias carregadas e ordenadas por data`);
      
      setNews(sortedNews);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (err) {
      const errorMsg = `Erro ao carregar notícias: ${err.message}`;
      setError(errorMsg);
      console.error('❌ Erro ao buscar notícias:', err);
      
      if (err.message.includes('autenticação') || err.message.includes('401')) {
        setIsAuthenticated(false);
      }
      
      setNews([]);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Preparar filtros de data para a API (código existente)
  const prepareDateFilters = () => {
    const filters = {};
    
    if (dateFilter.type === 'range' && dateFilter.dateRange) {
      filters.dateRange = dateFilter.dateRange;
    } else if (dateFilter.type === 'custom') {
      if (dateFilter.dateFrom) {
        filters.dateFrom = dateFilter.dateFrom;
      }
      if (dateFilter.dateTo) {
        filters.dateTo = dateFilter.dateTo;
      }
    }
    
    return filters;
  };

  // Testar conexão e feeds disponíveis (código existente)
  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      const isConnected = await rssService.testConnection();
      const feeds = await rssService.getAvailableFeeds();
      
      if (isConnected && feeds) {
        setConnectionStatus('connected');
        console.log('✅ Conexão OK. Feeds disponíveis:', feeds);
      } else {
        setConnectionStatus('error');
        setError('Não foi possível conectar com a API RSS');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(`Erro de conexão: ${err.message}`);
      console.error('❌ Erro ao testar conexão:', err);
    }
  };

  // Filtrar notícias localmente (código existente)
  const filteredNews = news.filter(item => {
    if (!searchTerm) return true;
    
    const title = (item.title || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return title.includes(searchLower) || summary.includes(searchLower);
  });

  const sortedFilteredNews = filteredNews.sort((a, b) => {
    const dateA = new Date(a.pubDate || a.publishedAt || 0);
    const dateB = new Date(b.pubDate || b.publishedAt || 0);
    return dateB - dateA;
  });

  // Carregar notícias iniciais (modificado para incluir RSS.APP)
  useEffect(() => {
    const initializeRSS = async () => {
      console.log('🚀 Inicializando RSS Feed...');
      
      if (!isAuthenticated) return;
      
      if (rssAppMode) {
        // Se está no modo RSS.APP mas não tem URL, não fazer nada
        if (!rssAppUrl) {
          setLoading(false);
          return;
        }
        // Buscar do RSS.APP
        await fetchRssAppFeed(rssAppUrl);
      } else {
        // Buscar da API normal
        await testConnection();
        
        if (connectionStatus !== 'error') {
          const dateFilters = prepareDateFilters();
          await fetchNews(selectedCategory, '', dateFilters);
        }
      }
    };
    
    if (isAuthenticated) {
      initializeRSS();
    }
  }, [selectedCategory, selectedCountry, isAuthenticated, articlesLimit, rssAppMode, rssAppUrl]);

  // Buscar quando filtros mudarem (modificado)
  useEffect(() => {
    if (!authAPI.isAuthenticated()) return;
    if (rssAppMode && !rssAppUrl) return;
    
    const timeoutId = setTimeout(() => {
      if (rssAppMode) {
        fetchRssAppFeed(rssAppUrl);
      } else {
        const dateFilters = prepareDateFilters();
        fetchNews(selectedCategory, '', dateFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, domainFilter, searchMode, dateFilter, articlesLimit, rssAppMode, rssAppUrl]);

  // Auto refresh a cada 10 minutos (modificado)
  useEffect(() => {
    if (!authAPI.isAuthenticated()) return;
    if (rssAppMode && !rssAppUrl) return;
    
    const interval = setInterval(() => {
      if (rssAppMode) {
        fetchRssAppFeed(rssAppUrl);
      } else {
        const dateFilters = prepareDateFilters();
        fetchNews(selectedCategory, '', dateFilters);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedCategory, searchTerm, domainFilter, searchMode, selectedCountry, isAuthenticated, dateFilter, articlesLimit, rssAppMode, rssAppUrl]);

  // Handlers para filtros de data (código existente)
  const handleDateRangeChange = (range) => {
    setDateFilter({
      type: range ? 'range' : 'none',
      dateRange: range,
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleCustomDateChange = (field, value) => {
    setDateFilter(prev => ({
      type: 'custom',
      dateRange: '',
      ...prev,
      [field]: value
    }));
  };

  const clearDateFilters = () => {
    setDateFilter({
      type: 'none',
      dateRange: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Handlers para filtros de domínio (código existente)
  const handleDomainSelect = (domain) => {
    setDomainFilter(domain);
    setSearchMode('domain');
  };

  const clearDomainFilter = () => {
    setDomainFilter('');
    setSearchMode('general');
  };

  // Função para limpar todos os filtros (código existente)
  const clearAllFilters = () => {
    setSearchTerm('');
    setDomainFilter('');
    setSearchMode('general');
    clearDateFilters();
    setSelectedCategory('general');
  };

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Indicador de status de conexão (código existente)
  const ConnectionIndicator = () => {
    const getStatusConfig = () => {
      if (rssAppMode) {
        if (loadingRssApp) {
          return { icon: RefreshCw, color: 'text-yellow-500', text: 'Carregando RSS.APP...' };
        }
        return { icon: Rss, color: 'text-blue-500', text: 'RSS.APP' };
      }
      
      switch (connectionStatus) {
        case 'connected':
          return { icon: Wifi, color: 'text-green-500', text: 'Conectado' };
        case 'error':
          return { icon: WifiOff, color: 'text-red-500', text: 'Desconectado' };
        case 'checking':
          return { icon: RefreshCw, color: 'text-yellow-500', text: 'Verificando...' };
        default:
          return { icon: WifiOff, color: 'text-gray-500', text: 'Desconhecido' };
      }
    };

    const { icon: Icon, color, text } = getStatusConfig();

    return (
      <div className={`flex items-center space-x-1 text-xs ${color}`}>
        <Icon className={`w-3 h-3 ${(connectionStatus === 'checking' || loadingRssApp) ? 'animate-spin' : ''}`} />
        <span>{text}</span>
      </div>
    );
  };

  // Se não autenticado, mostrar mensagem (código existente)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header title="RSS Feed - Últimas Notícias" />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Autenticação Necessária
            </h3>
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para acessar as notícias RSS.
            </p>
            <Button onClick={() => {
              authAPI.logout();
              window.location.href = '/login';
            }}>
              Fazer Login
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header title="RSS Feed - Últimas Notícias" />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header da seção */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {rssAppMode ? 'RSS.APP Feed' : 'RSS Feed Global'}
                {domainFilter && !rssAppMode && (
                  <span className="text-lg font-normal text-orange-600 ml-2">
                    - {extractDomain(domainFilter)}
                  </span>
                )}
                {rssAppUrl && rssAppMode && (
                  <span className="text-lg font-normal text-blue-600 ml-2">
                    - RSS.APP
                  </span>
                )}
              </h2>
              <p className="text-gray-600">
                {rssAppMode 
                  ? 'Acompanhe notícias de feeds RSS.APP personalizados'
                  : 'Acompanhe as últimas notícias via API RSS com filtros avançados e domínios específicos'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <ConnectionIndicator />
              
              {lastUpdate && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(lastUpdate)}
                </div>
              )}
              
              <Button
                onClick={() => {
                  if (rssAppMode && rssAppUrl) {
                    fetchRssAppFeed(rssAppUrl);
                  } else if (!rssAppMode) {
                    const dateFilters = prepareDateFilters();
                    fetchNews(selectedCategory, '', dateFilters);
                  }
                }}
                variant="outline"
                size="sm"
                disabled={loading || loadingRssApp}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || loadingRssApp) ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Seletor de Modo: API RSS vs RSS.APP */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fonte das Notícias</h3>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setRssAppMode(false);
                  setRssAppUrl('');
                  setNews([]);
                  setError(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  !rssAppMode
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-500'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>API RSS Global</span>
              </button>
              
              <button
                onClick={() => {
                  setRssAppMode(true);
                  setNews([]);
                  setError(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  rssAppMode
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-500'
                }`}
              >
                <Rss className="w-4 h-4" />
                <span>RSS.APP</span>
              </button>
            </div>
          </div>

          {/* Configuração RSS.APP */}
          {rssAppMode && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input para URL do RSS.APP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Feed RSS.APP
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Rss className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="url"
                        placeholder="https://rss.app/feeds/XXXXXXXX.xml"
                        value={rssAppUrl}
                        onChange={(e) => setRssAppUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (rssAppUrl && isValidRssAppUrl(rssAppUrl)) {
                          fetchRssAppFeed(rssAppUrl);
                        } else {
                          alert('Por favor, insira uma URL válida do RSS.APP');
                        }
                      }}
                      disabled={!rssAppUrl || loadingRssApp}
                      className="px-4"
                    >
                      {loadingRssApp ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Carregar'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Exemplo: https://rss.app/feeds/5QIm15lLcpEgasoD.xml
                  </p>
                </div>

                {/* Gerenciador de Feeds Salvos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Feeds Salvos ({rssAppFeeds.length})
                    </label>
                  </div>
                  
                  {rssAppFeeds.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {rssAppFeeds // Mostrar apenas os 3 primeiros
                        .map(feed => (
                        <button
                          key={feed.id}
                          onClick={() => {
                            setRssAppUrl(feed.dominio);
                            fetchRssAppFeed(feed.dominio);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg border transition-colors ${
                            rssAppUrl === feed.url
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm font-medium truncate">{feed.nome}</span>
                          </div>
                          <Rss className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                      
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                      <Rss className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Nenhum feed salvo ainda</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status do Feed Atual */}
              {rssAppUrl && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <Rss className="w-4 h-4" />
                      <span>
                        Feed ativo: <strong>{extractDomain(rssAppUrl)}</strong>
                        {loadingRssApp && <span className="ml-2">(carregando...)</span>}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setRssAppUrl('');
                        setNews([]);
                        setError(null);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        
        {/* Filtros principais - Só mostra se não estiver no modo RSS.APP */}
        {!rssAppMode && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar notícias
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Digite sua busca..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value && domainFilter) {
                        setSearchMode('combined');
                      } else if (e.target.value) {
                        setSearchMode('general');
                      } else if (domainFilter) {
                        setSearchMode('domain');
                      } else {
                        setSearchMode('general');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Domínio Específico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio específico
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="ex: cnnbrasil.com.br"
                      value={domainFilter}
                      onChange={(e) => {
                        setDomainFilter(e.target.value);
                        if (e.target.value && searchTerm) {
                          setSearchMode('combined');
                        } else if (e.target.value) {
                          setSearchMode('domain');
                        } else {
                          setSearchMode('general');
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <Button
                    onClick={() => setShowDomainFilters(!showDomainFilters)}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  {domainFilter && (
                    <Button
                      onClick={clearDomainFilter}
                      variant="outline"
                      size="sm"
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País/Região
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {Object.entries(countrySettings).map(([code, settings]) => (
                    <option key={code} value={code}>
                      {settings.flag} {settings.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limite de Artigos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <select
                  value={articlesLimit}
                  onChange={(e) => {
                    setArticlesLimit(parseInt(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={20}>20 artigos</option>
                  <option value={30}>30 artigos</option>
                  <option value={50}>50 artigos</option>
                  <option value={75}>75 artigos</option>
                  <option value={100}>100 artigos</option>
                  <option value={150}>150 artigos</option>
                  <option value={200}>200 artigos</option>
                </select>
              </div>

              {/* Filtros de Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtro de Data
                </label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowDateFilters(!showDateFilters)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center space-x-2 flex-1 ${
                      dateFilter.type !== 'none' ? 'bg-orange-50 border-orange-300 text-orange-700' : ''
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {dateFilter.type === 'range' && dateFilter.dateRange
                        ? dateRangeOptions.find(opt => opt.value === dateFilter.dateRange)?.label
                        : dateFilter.type === 'custom'
                        ? 'Personalizado'
                        : 'Todas as datas'}
                    </span>
                  </Button>
                  
                  {dateFilter.type !== 'none' && (
                    <Button
                      onClick={clearDateFilters}
                      variant="outline"
                      size="sm"
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Domínios Cadastrados */}
            {showDomainFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Domínios Cadastrados
                    {loadingDominios && (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin text-gray-400" />
                    )}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={async () => {
                        if (!authAPI.isAuthenticated()) return;
                        setLoadingDominios(true);
                        try {
                          console.log('🔄 Recarregando domínios cadastrados...');
                          const dominios = await dominioService.listarDominios({ 
                            ativo: true, 
                            limit: 100,
                            isRSSapp: false
                          });
                          
                          const dominiosFormatados = dominios.map(dominio => ({
                            domain: dominio.dominio,
                            domainOriginal: dominio.dominio,
                            name: dominio.nome,
                            flag: dominio.cor ? '●' : '🌐',
                            color: dominio.cor,
                            id: dominio.id
                          }));

                          setDominiosCadastrados(dominiosFormatados);
                          console.log(`✅ ${dominiosFormatados.length} domínios recarregados`);
                        } catch (error) {
                          console.error('❌ Erro ao recarregar domínios:', error);
                        } finally {
                          setLoadingDominios(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={loadingDominios}
                      className="text-xs"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${loadingDominios ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                    
                    {dominiosCadastrados.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {dominiosCadastrados.length} {dominiosCadastrados.length === 1 ? 'domínio' : 'domínios'}
                      </span>
                    )}
                  </div>
                </div>
                
                {dominiosCadastrados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {dominiosCadastrados.map(domain => (
                      <button
                        key={domain.id || domain.domain}
                        onClick={() => handleDomainSelect(domain.domain)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                          domainFilter === domain.domain
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-500 hover:shadow-sm'
                        }`}
                        style={{
                          borderColor: domainFilter === domain.domain ? undefined : domain.color
                        }}
                        title={`${domain.name}\nDomínio: ${domain.domain}\n${domain.domainOriginal !== domain.domain ? `URL Original: ${domain.domainOriginal}` : ''}\nClique para filtrar notícias deste domínio`}
                      >
                        <span style={{ color: domainFilter === domain.domain ? 'white' : domain.color }}>
                          {domain.flag}
                        </span>
                        <div className="flex flex-col items-start min-w-0">
                          <span className="truncate font-medium" title={domain.name}>
                            {domain.name}
                          </span>
                          <span className="text-xs w-[100%] opacity-75 truncate line-clamp" title={domain.domain}>
                            {domain.domain}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !loadingDominios && (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum domínio cadastrado ainda.</p>
                    <p className="text-sm mt-1">
                      Vá em <button 
                        onClick={() => window.location.href = '/configuracoes'} 
                        className="font-medium text-orange-500 hover:text-orange-600 underline"
                      >
                        Configurações
                      </button> para adicionar domínios.
                    </p>
                  </div>
                )}

                {/* Indicador de Filtro Ativo */}
                {domainFilter && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Globe className="w-4 h-4" />
                        <span>
                          Filtrando por: <strong>{extractDomain(domainFilter)}</strong>
                          {searchMode === 'combined' && searchTerm && (
                            <span> + termo "{searchTerm}"</span>
                          )}
                        </span>
                      </div>
                      <Button
                        onClick={() => setShowDomainFilters(false)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Recolher
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filtros de Data Expandidos */}
            {showDateFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Filtros de Data
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Filtros Pré-definidos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Períodos Pré-definidos
                    </label>
                    <select
                      value={dateFilter.type === 'range' ? dateFilter.dateRange : ''}
                      onChange={(e) => handleDateRangeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {dateRangeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Datas Personalizadas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período Personalizado
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="date"
                          value={dateFilter.dateFrom}
                          onChange={(e) => handleCustomDateChange('dateFrom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="Data inicial"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={dateFilter.dateTo}
                          onChange={(e) => handleCustomDateChange('dateTo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="Data final"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicador de Filtro Ativo */}
                {dateFilter.type !== 'none' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-orange-700">
                        <Filter className="w-4 h-4" />
                        <span>
                          Filtro ativo: {' '}
                          {dateFilter.type === 'range'
                            ? dateRangeOptions.find(opt => opt.value === dateFilter.dateRange)?.label
                            : `${dateFilter.dateFrom || 'início'} até ${dateFilter.dateTo || 'hoje'}`
                          }
                        </span>
                      </div>
                      <Button
                        onClick={() => setShowDateFilters(false)}
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Recolher
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Busca simples para modo RSS.APP */}
        {rssAppMode && rssAppUrl && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar nas notícias carregadas
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Filtrar notícias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                  size="sm"
                  disabled={!searchTerm}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Limpar busca</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Indicadores de Filtros Ativos - modificado para RSS.APP */}
        {((domainFilter || dateFilter.type !== 'none') && !rssAppMode) || (searchTerm && rssAppMode) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
              
              {domainFilter && !rssAppMode && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Globe className="w-3 h-3 mr-1" />
                  Domínio: {extractDomain(domainFilter)}
                  <button
                    onClick={clearDomainFilter}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Search className="w-3 h-3 mr-1" />
                  Busca: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {dateFilter.type !== 'none' && !rssAppMode && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  Data: {dateFilter.type === 'range' 
                    ? dateRangeOptions.find(opt => opt.value === dateFilter.dateRange)?.label
                    : 'Personalizado'
                  }
                  <button
                    onClick={clearDateFilters}
                    className="ml-2 hover:text-orange-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {/* Botão para limpar todos os filtros */}
              {!rssAppMode && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-red-600 hover:border-red-300"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar Todos
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Categorias rápidas - Só mostra se não estiver usando domínio específico ou RSS.APP */}
        {searchMode === 'general' && !rssAppMode && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading state */}
        {(loading || loadingRssApp) && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-gray-600">
                {rssAppMode ? 'Carregando feed RSS.APP...' : 'Carregando notícias via API...'}
                {domainFilter && !rssAppMode && <span className="block text-sm text-orange-600 mt-1">
                  Filtrando por {extractDomain(domainFilter)}
                </span>}
                {rssAppUrl && rssAppMode && <span className="block text-sm text-blue-600 mt-1">
                  {extractDomain(rssAppUrl)}
                </span>}
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Lista de notícias */}
        {!loading && !loadingRssApp && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {sortedFilteredNews.length} notícias encontradas
                {domainFilter && !rssAppMode && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    ({extractDomain(domainFilter)})
                  </span>
                )}
                {rssAppUrl && rssAppMode && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    (RSS.APP)
                  </span>
                )}
                {dateFilter.type !== 'none' && !rssAppMode && (
                  <span className="text-sm font-normal text-orange-600 ml-2">
                    (com filtro de data)
                  </span>
                )}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  • Ordenadas por data ↓
                </span>
              </h3>
              {news.length > 0 && (
                <div className="text-sm text-gray-500">
                  {rssAppMode ? (
                    <>
                      <Rss className="inline w-4 h-4 mr-1" />
                      RSS.APP Feed
                      {rssAppUrl && <span className="ml-2">| {extractDomain(rssAppUrl)}</span>}
                    </>
                  ) : (
                    <>
                      {countrySettings[selectedCountry].flag} {countrySettings[selectedCountry].name} - API RSS
                      {domainFilter && <span className="ml-2">| site:{domainFilter}</span>}
                    </>
                  )}
                </div>
              )}
            </div>

            {sortedFilteredNews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="max-w-md mx-auto">
                  {rssAppMode ? (
                    <Rss className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  ) : (
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {rssAppMode ? 'Nenhuma notícia no feed' : 'Nenhuma notícia encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {rssAppMode 
                      ? 'O feed RSS.APP pode estar vazio ou com problemas. Verifique a URL ou tente outro feed.'
                      : 'Tente ajustar os filtros, buscar por outros termos, alterar o domínio ou o período de data.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {rssAppMode ? (
                      <>
                        <Button
                          onClick={() => setRssAppUrl('')}
                          variant="outline"
                          size="sm"
                        >
                          Limpar URL
                        </Button>
                        <Button
                          onClick={() => setShowRssAppManager(true)}
                          variant="outline"
                          size="sm"
                        >
                          Escolher outro feed
                        </Button>
                      </>
                    ) : (
                      <>
                        {domainFilter && (
                          <Button
                            onClick={clearDomainFilter}
                            variant="outline"
                            size="sm"
                          >
                            Remover filtro de domínio
                          </Button>
                        )}
                        {dateFilter.type !== 'none' && (
                          <Button
                            onClick={clearDateFilters}
                            variant="outline"
                            size="sm"
                          >
                            Remover filtro de data
                          </Button>
                        )}
                        {searchTerm && (
                          <Button
                            onClick={() => setSearchTerm('')}
                            variant="outline"
                            size="sm"
                          >
                            Limpar busca
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedFilteredNews.map((item, index) => (
                  <article
                    key={item.guid || index}
                    className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 ${
                      rssAppMode ? 'border-blue-500' : 'border-orange-500'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rssAppMode 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {rssAppMode && <Rss className="w-3 h-3 mr-1" />}
                            {item.creator || (rssAppMode ? 'RSS.APP' : 'RSS Feed')}
                          </span>
                          
                          {item.link && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Globe className="w-3 h-3 mr-1" />
                              {extractDomain(item.link)}
                            </span>
                          )}
                          
                          {item.category && item.category !== 'RSS Feed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {item.category}
                            </span>
                          )}
                          
                          {item.sourceRegion && item.sourceRegion !== 'RSS Feed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.sourceRegion}
                            </span>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(item.pubDate)}
                          </div>
                        </div>
                        
                        <h4 className={`text-lg font-semibold text-gray-900 mb-2 hover:text-${rssAppMode ? 'blue' : 'orange'}-600 transition-colors`}>
                          {item.title}
                        </h4>
                        
                        {item.summary && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0 sm:ml-4">
                        <Button
                          onClick={() => window.open(item.link, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ler mais</span>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dicas de Uso RSS.APP */}
        {rssAppMode && !rssAppUrl && (
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-center">
              <Rss className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como usar feeds RSS.APP
              </h3>
              <div className="text-left max-w-2xl mx-auto space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <p>Acesse <a href="https://rss.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">rss.app</a> e crie feeds personalizados</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <p>Copie a URL do feed XML (ex: https://rss.app/feeds/5QIm15lLcpEgasoD.xml)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <p>Cole a URL no campo acima e clique em "Carregar" para ver as notícias</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <p>Use o gerenciador para salvar feeds favoritos e facilitar o acesso</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2">Exemplo de URL válida:</h4>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  https://rss.app/feeds/5QIm15lLcpEgasoD.xml
                </code>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RSSFeed;