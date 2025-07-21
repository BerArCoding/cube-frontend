import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui';
import dominioService from '../services/dominioService';
import authAPI from '../services/auth';
import { 
  RefreshCw, 
  ExternalLink, 
  Calendar, 
  Globe, 
  Search,
  Clock,
  AlertCircle,
  Shield,
  X,
  Bookmark,
  Rss,
  Star,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RSSAppFeed = () => {
  const [feedsData, setFeedsData] = useState({}); // Dados organizados por feed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rssAppFeeds, setRssAppFeeds] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [expandedFeeds, setExpandedFeeds] = useState({}); // Controla quais feeds estão expandidos
  const [hoveredNews, setHoveredNews] = useState(null); // Controla qual notícia está com hover
  const [showMoreFeeds, setShowMoreFeeds] = useState({}); // Controla quantas notícias mostrar por feed
  const [loadingMoreNews, setLoadingMoreNews] = useState({}); // Loading para carregar mais notícias

  // Função para buscar notícias de um feed específico
  const fetchSingleRssFeed = async (feedUrl, feedName, limit = 5) => {
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`Erro ao acessar feed ${feedName}: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error(`Erro ao processar XML do feed ${feedName}`);
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const feedNews = Array.from(items).slice(0, limit).map((item, index) => { // Limite dinâmico
        const title = item.querySelector('title')?.textContent || 'Sem título';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const creator = item.querySelector('dc\\:creator, creator')?.textContent || feedName;
        const category = item.querySelector('category')?.textContent || 'Noticias';

        // Buscar imagem
        let linkImagem = '';
        const mediaContentEls = item.getElementsByTagName('media:content');
        if (mediaContentEls.length > 0) {
          linkImagem = mediaContentEls[0].getAttribute('url') || '';
        } else {
          const mediaThumbEls = item.getElementsByTagName('media:thumbnail');
          if (mediaThumbEls.length > 0) {
            linkImagem = mediaThumbEls[0].getAttribute('url') || '';
          }
        }

        // Fallback: extrair imagem da descrição
        if (!linkImagem && description) {
          const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch && imgMatch[1]) {
            linkImagem = imgMatch[1];
          }
        }

        return {
          guid: `${feedName}-${Date.now()}-${index}`,
          title: title.trim(),
          link: link.trim(),
          summary: description.replace(/<[^>]*>/g, '').trim(),
          pubDate: pubDate,
          creator: creator,
          category: category,
          feedName: feedName,
          image: linkImagem
        };
      });
      
      return feedNews.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB - dateA;
      });
      
    } catch (err) {
      console.error(`❌ Erro ao buscar feed ${feedName}:`, err);
      return [];
    }
  };

  // Função para carregar todos os feeds
  const fetchAllRssFeeds = async () => {
    if (rssAppFeeds.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const feedPromises = rssAppFeeds.map(async (feed) => {
        const news = await fetchSingleRssFeed(feed.dominio, feed.nome);
        return {
          feedId: feed.id,
          feedName: feed.nome,
          feedUrl: feed.dominio,
          news: news
        };
      });

      const results = await Promise.all(feedPromises);
      
      // Organizar dados por feed
      const organizedData = {};
      results.forEach(result => {
        organizedData[result.feedId] = result;
      });
      
      setFeedsData(organizedData);
      setLastUpdate(new Date());
      
    } catch (err) {
      setError(`Erro ao carregar feeds: ${err.message}`);
      console.error('❌ Erro ao buscar todos os feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar feeds salvos
  useEffect(() => {
    const carregarRSSAppFeeds = async () => {
      if (!authAPI.isAuthenticated()) return;
      
      try {
        setLoadingFeeds(true);
        const dominiosData = await dominioService.obterFeedsRSSappAtivos();
        setRssAppFeeds(dominiosData);
        
        // Expandir todos os feeds por padrão
        const expanded = {};
        dominiosData.forEach(feed => {
          expanded[feed.id] = true;
        });
        setExpandedFeeds(expanded);
        
      } catch (error) {
        console.error('❌ Erro ao carregar feeds:', error);
        setError(`Erro ao carregar feeds: ${error.message}`);
        setRssAppFeeds([]);
      } finally {
        setLoadingFeeds(false);
      }
    };

    carregarRSSAppFeeds();
  }, []);

  // Carregar notícias quando os feeds estiverem disponíveis
  useEffect(() => {
    if (rssAppFeeds.length > 0) {
      fetchAllRssFeeds();
    }
  }, [rssAppFeeds]);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authAPI.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setError('Você precisa estar logado para acessar os feeds RSS');
      }
    };

    checkAuth();
  }, []);

  // Auto refresh a cada 15 minutos
  useEffect(() => {
    if (!authAPI.isAuthenticated() || rssAppFeeds.length === 0) return;
    
    const interval = setInterval(() => {
      fetchAllRssFeeds();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [rssAppFeeds]);

  // Função para expandir/recolher feeds
  const toggleFeedExpansion = (feedId) => {
    setExpandedFeeds(prev => ({
      ...prev,
      [feedId]: !prev[feedId]
    }));
  };

  // Filtrar notícias por termo de busca
  const getFilteredFeeds = () => {
    if (!searchTerm) return feedsData;
    
    const filtered = {};
    Object.keys(feedsData).forEach(feedId => {
      const feed = feedsData[feedId];
      const filteredNews = feed.news.filter(item => {
        const title = (item.title || '').toLowerCase();
        const summary = (item.summary || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return title.includes(searchLower) || summary.includes(searchLower);
      });
      
      if (filteredNews.length > 0) {
        filtered[feedId] = {
          ...feed,
          news: filteredNews
        };
      }
    });
    
    return filtered;
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

  // Função para carregar mais notícias de um feed específico
  const loadMoreNews = async (feedId, feedUrl, feedName) => {
    try {
      setLoadingMoreNews(prev => ({ ...prev, [feedId]: true }));
      
      const currentLimit = showMoreFeeds[feedId] || 5;
      const newLimit = currentLimit + 10; // Carregar mais 10
      
      const moreNews = await fetchSingleRssFeed(feedUrl, feedName, newLimit);
      
      setFeedsData(prev => ({
        ...prev,
        [feedId]: {
          ...prev[feedId],
          news: moreNews
        }
      }));
      
      setShowMoreFeeds(prev => ({
        ...prev,
        [feedId]: newLimit
      }));
      
    } catch (err) {
      console.error(`❌ Erro ao carregar mais notícias de ${feedName}:`, err);
    } finally {
      setLoadingMoreNews(prev => ({ ...prev, [feedId]: false }));
    }
  };

  const getTotalNews = () => {
    return Object.values(getFilteredFeeds()).reduce((total, feed) => total + feed.news.length, 0);
  };

  // Se não autenticado, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Autenticação Necessária
        </h3>
        <p className="text-gray-600 mb-4">
          Você precisa estar logado para acessar as noticias.
        </p>
        <Button onClick={() => {
          authAPI.logout();
          window.location.href = '/login';
        }}>
          Fazer Login
        </Button>
      </div>
    );
  }

  const filteredFeeds = getFilteredFeeds();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Rss className="w-8 h-8 mr-3 text-blue-500" />
            Noticias
          </h2>
          <p className="text-gray-600">
            Visualize as 5 notícias mais recentes de cada feed de noticias cadastrado
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {lastUpdate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(lastUpdate)}
            </div>
          )}
          
          <Button
            onClick={fetchAllRssFeeds}
            variant="outline"
            size="sm"
            disabled={loading || rssAppFeeds.length === 0}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Todos</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas e Busca */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estatísticas */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Feeds Ativos:</span>
                <span className="font-semibold text-blue-600">{rssAppFeeds.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de Notícias:</span>
                <span className="font-semibold text-green-600">{getTotalNews()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Feeds Carregados:</span>
                <span className="font-semibold text-orange-600">
                  {Object.keys(filteredFeeds).length}
                </span>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar nas notícias
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={() => setSearchTerm('')}
                variant="outline"
                size="sm"
                disabled={!searchTerm}
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-gray-600">Carregando noticias...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Lista de Feeds */}
      {!loading && rssAppFeeds.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Rss className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum feed cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Vá em Configurações para cadastrar feeds no sistema.
          </p>
          <Button
            onClick={() => window.location.href = '/configuracoes'}
            className="flex items-center space-x-2"
          >
            <Bookmark className="w-4 h-4" />
            <span>Ir para Configurações</span>
          </Button>
        </div>
      )}

      {/* Feeds e Notícias */}
      {!loading && Object.keys(filteredFeeds).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filteredFeeds).map(([feedId, feedData]) => (
            <div key={feedId} className="bg-white rounded-lg shadow border border-gray-200">
              {/* Header do Feed */}
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleFeedExpansion(feedId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Rss className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {feedData.feedName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        • {feedData.news.length} notícias carregadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {feedData.news.length} carregadas
                    </span>
                    {expandedFeeds[feedId] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de Notícias */}
              {expandedFeeds[feedId] && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {feedData.news.map((item, index) => (
                      <div
                        key={item.guid || index}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredNews(`${feedId}-${index}`)}
                        onMouseLeave={() => setHoveredNews(null)}
                        onClick={() => window.open(item.link, '_blank')}
                      >
                        {/* Card da Notícia - AUMENTADO */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                          {/* Imagem - AUMENTADA */}
                          <div className="relative h-48 bg-gray-100">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${item.image ? 'hidden' : 'flex'}`}
                            >
                              <Rss className="w-12 h-12 text-white opacity-50" />
                            </div>
                            
                            {/* Overlay com data */}
                            <div className="absolute top-3 right-3">
                              <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                {formatDate(item.pubDate)}
                              </span>
                            </div>

                            {/* Indicador de hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100" />
                            </div>
                          </div>

                          {/* Conteúdo - EXPANDIDO */}
                          <div className="p-4">
                            <h4 className="text-base font-semibold text-gray-900 line-clamp-3 leading-tight mb-3 min-h-[4.5rem]">
                              {item.title}
                            </h4>
                            
                            {/* Resumo */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {item.summary}
                            </p>
                            
                            {/* Tags e Meta */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 truncate max-w-[70%]">
                                  📰 {item.creator}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-green-600">Online</span>
                                </div>
                              </div>

                              {item.category && item.category !== 'Noticias' && (
                                <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tooltip com descrição - MELHORADO */}
                        {hoveredNews === `${feedId}-${index}` && item.summary && (
                          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-96 max-w-sm">
                            <div className="bg-gray-900 text-white text-sm rounded-xl p-4 shadow-2xl border border-gray-700">
                              <div className="flex items-start space-x-3">
                                <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                                <div>
                                  <p className="font-semibold mb-2 line-clamp-2 text-blue-200">{item.title}</p>
                                  <p className="text-gray-300 line-clamp-4 leading-relaxed">{item.summary}</p>
                                  <div className="mt-2 pt-2 border-t border-gray-700">
                                    <span className="text-xs text-gray-400">🗓️ {formatDate(item.pubDate)} • 👤 {item.creator}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Seta do tooltip */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botão Ver Mais */}
                  <div className="mt-6 text-center">
                    <Button
                      onClick={() => loadMoreNews(feedId, feedData.feedUrl, feedData.feedName)}
                      disabled={loadingMoreNews[feedId]}
                      variant="outline"
                      className="flex items-center space-x-2 mx-auto hover:bg-blue-50 hover:border-blue-300"
                    >
                      {loadingMoreNews[feedId] ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Carregando mais...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Carregar mais 10 notícias</span>
                        </>
                      )}
                    </Button>
                    
                    {/* Contador de notícias carregadas */}
                    <p className="text-xs text-gray-500 mt-2">
                      Mostrando {feedData.news.length} notícias • Próximo: +10 notícias
                    </p>
                  </div>

                  {/* Sem notícias */}
                  {feedData.news.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Rss className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma notícia encontrada neste feed</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com informações */}
      {!loading && Object.keys(filteredFeeds).length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-blue-700">
            <div className="flex items-center space-x-1">
              <Rss className="w-4 h-4" />
              <span>{rssAppFeeds.length} feeds ativos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>{getTotalNews()} notícias carregadas</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Atualização automática a cada 15min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSSAppFeed;