import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui';
import rssService from '../services/rssService';
import authAPI from '../services/auth';
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
  X
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

  // Novos estados para filtros de data
  const [dateFilter, setDateFilter] = useState({
    type: 'none', // 'none', 'range', 'custom'
    dateRange: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [articlesLimit, setArticlesLimit] = useState(50); // ← Novo estado para limite

  // Categorias alinhadas com sua API
  const categories = [
    { id: 'general', name: 'Geral', icon: Globe },
    { id: 'business', name: 'Negócios', icon: TrendingUp },
    { id: 'technology', name: 'Tecnologia', icon: TrendingUp },
    { id: 'entertainment', name: 'Entretenimento', icon: Globe },
    { id: 'health', name: 'Saúde', icon: AlertCircle },
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

  // Função para buscar notícias via API com filtros de data
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
      
      // Preparar opções com filtros de data
      const fetchOptions = {
        language: settings.language,
        country: settings.country,
        limit: articlesLimit, // ← Usar limite configurável
        ...dateFilterOptions
      };

      if (search) {
        // Busca por termo específico
        newsData = await rssService.fetchGoogleNews(search, fetchOptions);
      } else {
        // Busca por categoria
        newsData = await rssService.fetchByCategory(category, fetchOptions);
      }

      console.log(`✅ ${newsData.length} notícias carregadas com sucesso`);
      
      setNews(newsData);
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

  // Preparar filtros de data para a API
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

  // Testar conexão e feeds disponíveis
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

  // Filtrar notícias localmente
  const filteredNews = news.filter(item => {
    if (!searchTerm) return true;
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Carregar notícias iniciais
  useEffect(() => {
    const initializeRSS = async () => {
      console.log('🚀 Inicializando RSS Feed...');
      
      if (!isAuthenticated) return;
      
      await testConnection();
      
      if (connectionStatus !== 'error') {
        const dateFilters = prepareDateFilters();
        await fetchNews(selectedCategory, searchTerm, dateFilters);
      }
    };
    
    if (isAuthenticated) {
      initializeRSS();
    }
  }, [selectedCategory, selectedCountry, isAuthenticated, articlesLimit]);

  // Buscar quando filtros mudarem (com delay para busca)
  useEffect(() => {
    if (!authAPI.isAuthenticated()) return;
    
    const timeoutId = setTimeout(() => {
      const dateFilters = prepareDateFilters();
      fetchNews(selectedCategory, searchTerm, dateFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, dateFilter, articlesLimit]);

  // Auto refresh a cada 10 minutos
  useEffect(() => {
    if (!authAPI.isAuthenticated()) return;
    
    const interval = setInterval(() => {
      const dateFilters = prepareDateFilters();
      fetchNews(selectedCategory, searchTerm, dateFilters);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedCategory, searchTerm, selectedCountry, isAuthenticated, dateFilter, articlesLimit]);

  // Handlers para filtros de data
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

  // Indicador de status de conexão
  const ConnectionIndicator = () => {
    const getStatusConfig = () => {
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
        <Icon className={`w-3 h-3 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
        <span>{text}</span>
      </div>
    );
  };

  // Se não autenticado, mostrar mensagem
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
                RSS Feed Global
              </h2>
              <p className="text-gray-600">
                Acompanhe as últimas notícias via API RSS com filtros avançados
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
                  const dateFilters = prepareDateFilters();
                  fetchNews(selectedCategory, searchTerm, dateFilters);
                }}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros principais */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
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

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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

        {/* Categorias rápidas */}
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

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-gray-600">Carregando notícias via API...</span>
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
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredNews.length} notícias encontradas
                {dateFilter.type !== 'none' && (
                  <span className="text-sm font-normal text-orange-600 ml-2">
                    (com filtro de data)
                  </span>
                )}
              </h3>
              {news.length > 0 && (
                <div className="text-sm text-gray-500">
                  {countrySettings[selectedCountry].flag} {countrySettings[selectedCountry].name} - API RSS
                </div>
              )}
            </div>

            {filteredNews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma notícia encontrada
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros, buscar por outros termos ou alterar o período de data.
                  </p>
                  {dateFilter.type !== 'none' && (
                    <Button
                      onClick={clearDateFilters}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Remover filtro de data
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredNews.map((item, index) => (
                  <article
                    key={item.guid || index}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 border-orange-500"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {item.creator || 'RSS Feed'}
                          </span>
                          {item.sourceRegion && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.sourceRegion}
                            </span>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(item.pubDate)}
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
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
      </main>
    </div>
  );
};

export default RSSFeed;