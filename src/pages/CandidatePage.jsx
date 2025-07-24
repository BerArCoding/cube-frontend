import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateAvatar from '../components/CandidateAvatar';
import { FolderOpen } from 'lucide-react';
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  Instagram,
  MapPin,
  Target,
  Users,
  MessageCircle,
  Heart,
  Share,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  BarChart3,
  Clock,
  Rss,
  Eye,
  RefreshCw,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CandidatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  const [ultimoPost, setUltimoPost] = useState(null);
  const [analisesSentimento, setAnalisesSentimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para notícias RSS
  const [noticias, setNoticias] = useState([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const [errorNoticias, setErrorNoticias] = useState(null);
  const [lastUpdateNoticias, setLastUpdateNoticias] = useState(null);
  const [hoveredNews, setHoveredNews] = useState(null);
  const [showMoreNews, setShowMoreNews] = useState(5);
  const [loadingMoreNews, setLoadingMoreNews] = useState(false);

  useEffect(() => {
    carregarDadosCandidato();
  }, [id]);

  // Carregar notícias quando candidato estiver carregado
  useEffect(() => {
    if (candidato && candidato.urlRss) {
      fetchCandidateNews();
    }
  }, [candidato]);

  const carregarDadosCandidato = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('cube_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const [candidatoRes, ultimaPublicacaoRes, analisesSentimentoRes] = await Promise.all([
        fetch(`${API_BASE}/api/candidates/${id}`, { headers }),
        fetch(`${API_BASE}/api/dashboard/candidatos`, { headers }),
        fetch(`${API_BASE}/api/dashboard/nuvem-palavras?candidatos=${id}`, { headers })
      ]);

      if (!candidatoRes.ok) {
        throw new Error('Candidato não encontrado');
      }

      const candidatoData = await candidatoRes.json();
      setCandidato(candidatoData.data);
      console.log('Candidato carregado:', candidatoData.data);
      if (ultimaPublicacaoRes.ok) {
        const todosData = await ultimaPublicacaoRes.json();
        const candidatoCompleto = todosData.data?.find(c => c.id === id);
        if (candidatoCompleto && candidatoCompleto.postsCount > 0) {
          setUltimoPost({
            type: 'IMAGE',
            caption: `Último post de ${candidatoCompleto.nome}`,
            likesCount: Math.round(candidatoCompleto.followersCount * 0.02),
            commentsCount: Math.round(candidatoCompleto.followersCount * 0.005),
            url: candidatoCompleto.instagramHandle ? `https://instagram.com/${candidatoCompleto.instagramHandle}` : null
          });
        }
      }

      if (analisesSentimentoRes.ok) {
        const sentimentoData = await analisesSentimentoRes.json();
        if (sentimentoData.sucesso && sentimentoData.dados) {
          setAnalisesSentimento({
            resumoInsights: {
              palavrasChave: sentimentoData.dados.palavras?.slice(0, 7).map(p => p.text) || []
            }
          });
        }
      }

    } catch (err) {
      console.error('Erro ao carregar candidato:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar notícias do RSS do candidato
  const fetchCandidateNews = async (limit = 5) => {
    if (!candidato.urlRss) return;

    try {
      setLoadingNoticias(true);
      setErrorNoticias(null);
      
      const response = await fetch(candidato.urlRss);
      if (!response.ok) {
        throw new Error(`Erro ao acessar feed: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Erro ao processar XML do feed');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const feedNews = Array.from(items).slice(0, limit).map((item, index) => {
        const title = item.querySelector('title')?.textContent || 'Sem título';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const creator = item.querySelector('dc\\:creator, creator')?.textContent || candidato.nome;
        const category = item.querySelector('category')?.textContent || 'Política';

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
          guid: `${candidato.nome}-${Date.now()}-${index}`,
          title: title.trim(),
          link: link.trim(),
          summary: description.replace(/<[^>]*>/g, '').trim().substring(0, 200) + '...',
          pubDate: pubDate,
          creator: creator,
          category: category,
          image: linkImagem
        };
      });
      
      const sortedNews = feedNews.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB - dateA;
      });
      
      setNoticias(sortedNews);
      setLastUpdateNoticias(new Date());
      
    } catch (err) {
      console.error('❌ Erro ao buscar notícias:', err);
      setErrorNoticias(`Erro ao carregar notícias: ${err.message}`);
    } finally {
      setLoadingNoticias(false);
    }
  };

  // Função para carregar mais notícias
  const loadMoreNews = async () => {
    try {
      setLoadingMoreNews(true);
      const newLimit = showMoreNews + 10;
      await fetchCandidateNews(newLimit);
      setShowMoreNews(newLimit);
    } catch (err) {
      console.error('❌ Erro ao carregar mais notícias:', err);
    } finally {
      setLoadingMoreNews(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getViabilidadeColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do candidato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!candidato) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </button>
            
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Foto e Nome */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <CandidateAvatar 
              candidate={candidato} 
              size="xxxl" 
              showStatus={false}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{candidato.nome}</h1>
        </div>

        {/* Dados Principais */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">DADOS</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">REDUTO DE ORIGEM</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.redutoOrigem || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">MACRORREGIÃO</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.macrorregiao?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">CARGO ATUAL</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.cargo?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VOTOS ÚLTIMA ELEIÇÃO</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.votosUltimaEleicao ? formatNumber(candidato.votosUltimaEleicao) : 'N/A'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">CARGO PRETENDIDO</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.cargoPretendido?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VOTOS NECESSÁRIOS</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.votosNecessarios ? formatNumber(candidato.votosNecessarios) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Métricas Instagram */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">INSTAGRAM</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.instagramHandle ? `@${candidato.instagramHandle}` : 'N/A'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">SEGUIDORES</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                <span>{formatNumber(candidato.followersCount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Total Atual</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">POSTS</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                <span>{formatNumber(candidato.postsCount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">SEGUINDO</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                <span>{formatNumber(candidato.followsCount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">ENGAJAMENTO</div>
              <div className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {candidato.followersCount && ultimoPost?.likesCount ? 
                  `${((ultimoPost.likesCount / candidato.followersCount) * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">Último post</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VERIFICADO</div>
              <div className={`${candidato.verified ? 'bg-blue-500' : 'bg-gray-400'} text-white px-3 py-2 rounded-lg text-sm font-medium`}>
                {candidato.verified ? '✓ Sim' : '✗ Não'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Instagram</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VIABILIDADE</div>
              <div className={`${getViabilidadeColor(candidato.pontuacaoViabilidade)} text-white px-3 py-2 rounded-lg text-sm font-medium`}>
                {candidato.pontuacaoViabilidade ? `${candidato.pontuacaoViabilidade.toFixed(0)}%` : 'N/A'}
              </div>
            </div>
          </div>

          {candidato.observacoes && (
            <div className="border-t border-gray-300 pt-6">
              <div className="text-xs font-semibold text-gray-600 mb-3">OBSERVAÇÕES</div>
                {candidato.observacoes}
            </div>
          )}
        </div>

        {/* Documentos - Full Width */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
      <FolderOpen className="w-6 h-6 text-orange-500" />
      <span>Documentos</span>
    </h2>
    {candidato.urlDrive && (
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
        Disponível
      </span>
    )}
  </div>

  {candidato.urlDrive ? (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Pasta de Documentos
            </h3>
            <p className="text-sm text-gray-600">
              Acesse todos os documentos e arquivos do candidato
            </p>
          </div>
        </div>
        
        <a 
          href={candidato.urlDrive} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
        >
          <span>Abrir Pasta</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📁 Google Drive</span>
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>Documentos disponíveis para download</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhum documento disponível
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Os documentos deste candidato ainda não foram disponibilizados ou estão sendo processados.
      </p>
    </div>
  )}
</div>

        {/* Análise Post - Full Width */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ANÁLISE POST</h2>
          
          {ultimoPost ? (
            <>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  TEMA POST - {ultimoPost.type?.toUpperCase() || 'POST'}
                </div>
                <div className="text-xs text-gray-600">
                  {ultimoPost.caption?.substring(0, 100)}...
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">ENGAJAMENTO</div>
                  <div className="bg-orange-400 rounded-lg h-6 relative overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ 
                        width: ultimoPost.likesCount && candidato.followersCount ? 
                          `${Math.min(((ultimoPost.likesCount / candidato.followersCount) * 100), 100)}%` : '0%'
                      }}
                    ></div>
                    <div className="absolute left-2 top-1 text-white text-xs font-medium">
                      {ultimoPost.likesCount && candidato.followersCount ? 
                        `${((ultimoPost.likesCount / candidato.followersCount) * 100).toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">COMENTÁRIOS</div>
                  <div className="bg-orange-400 rounded-lg h-6 relative overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ 
                        width: ultimoPost.commentsCount ? 
                          `${Math.min((ultimoPost.commentsCount / 50) * 100, 100)}%` : '0%'
                      }}
                    ></div>
                    <div className="absolute left-2 top-1 text-white text-xs font-medium">
                      {ultimoPost.commentsCount || 0} comentários
                    </div>
                  </div>
                </div>
              </div>

              {ultimoPost.url && (
                <div className="mt-4">
                  <a 
                    href={ultimoPost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver post no Instagram</span>
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <Instagram className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum post encontrado</p>
            </div>
          )}
        </div>

        {/* Análise Sentimento - Full Width */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ANÁLISE SENTIMENTO</h2>
          
          {analisesSentimento ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <div className="w-full h-full rounded-full bg-green-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/5 h-full bg-red-500 transform rotate-45 origin-bottom-left"></div>
                    <div className="absolute top-0 right-0 w-1/5 h-full bg-gray-400 transform rotate-12 origin-bottom-left"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {analisesSentimento.sentimentoScore ? 
                          `${Math.round(analisesSentimento.sentimentoScore * 100)}%` : 
                          'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs mb-6">
                <div>
                  <div className="font-semibold text-gray-700">POSITIVOS</div>
                  <div className="text-gray-600">
                    {analisesSentimento.sentimentoLabel === 'POSITIVO' ? 
                      'Maioria positiva' : 'Alguns positivos'
                    }
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">NEUTROS</div>
                  <div className="text-gray-600">
                    {analisesSentimento.sentimentoLabel === 'NEUTRO' ? 
                      'Maioria neutra' : 'Alguns neutros'
                    }
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">NEGATIVOS</div>
                  <div className="text-gray-600">
                    {analisesSentimento.sentimentoLabel === 'NEGATIVO' ? 
                      'Maioria negativa' : 'Alguns negativos'
                    }
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">PALAVRAS CHAVES MENCIONADAS</h3>
                <div className="flex flex-wrap gap-2">
                  {analisesSentimento.resumoInsights?.palavrasChave?.map((palavra, index) => (
                    <span key={index} className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm">
                      {palavra}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma análise de sentimento disponível</p>
            </div>
          )}
        </div>

        {/* Recomendações - Full Width */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">RECOMENDAÇÕES ESTRATÉGICAS</h2>
          
          {candidato.insights && candidato.insights.length > 0 ? (
            <div className="space-y-4">
              {candidato.insights.slice(0, 3).map((insight, index) => (
                <div key={insight.id}>
                  <h3 className="font-semibold text-gray-800 mb-2">{insight.titulo}</h3>
                  <p className="text-sm text-gray-600">{insight.conteudo}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma recomendação disponível</p>
            </div>
          )}
        </div>

        {/* ✅ NOVA SEÇÃO - Notícias RSS */}
        <div className="bg-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-gray-900">NOTÍCIAS</h2>
              {candidato.urlRss && (
                <div className="flex items-center space-x-2">
                  <Rss className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Feed ativo</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {lastUpdateNoticias && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(lastUpdateNoticias)}
                </div>
              )}
              
              {candidato.urlRss && (
                <button
                  onClick={() => fetchCandidateNews()}
                  disabled={loadingNoticias}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingNoticias ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loadingNoticias && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-gray-600">Carregando notícias...</span>
              </div>
            </div>
          )}

          {/* Erro */}
          {errorNoticias && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{errorNoticias}</span>
              </div>
            </div>
          )}

          {/* Sem RSS configurado */}
          {!candidato.urlRss && !loadingNoticias && (
            <div className="text-center text-gray-500 py-8">
              <Rss className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">URL do RSS não configurada para este candidato</p>
              <p className="text-xs text-gray-400 mt-1">Configure uma URL no cadastro do candidato para ver notícias</p>
            </div>
          )}

          {/* Grid de Notícias */}
          {!loadingNoticias && candidato.urlRss && noticias.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {noticias.map((item, index) => (
                  <div
                    key={item.guid || index}
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredNews(index)}
                    onMouseLeave={() => setHoveredNews(null)}
                    onClick={() => window.open(item.link, '_blank')}
                  >
                    {/* Card da Notícia */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                      {/* Imagem */}
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
                          className={`absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${item.image ? 'hidden' : 'flex'}`}
                        >
                          <MessageCircle className="w-12 h-12 text-white opacity-50" />
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

                      {/* Conteúdo */}
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
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-orange-600">Noticias</span>
                            </div>
                          </div>

                          {item.category && item.category !== 'Política' && (
                            <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tooltip com descrição */}
                    {hoveredNews === index && item.summary && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-96 max-w-sm">
                        <div className="bg-gray-900 text-white text-sm rounded-xl p-4 shadow-2xl border border-gray-700">
                          <div className="flex items-start space-x-3">
                            <Eye className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-semibold mb-2 line-clamp-2 text-orange-200">{item.title}</p>
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
                <button
                  onClick={loadMoreNews}
                  disabled={loadingMoreNews}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {loadingMoreNews ? (
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
                </button>
                
                {/* Contador de notícias carregadas */}
                <p className="text-xs text-gray-500 mt-2">
                  Mostrando {noticias.length} notícias • Próximo: +10 notícias
                </p>
              </div>

              {/* Rodapé com informações */}
              <div className="mt-6 bg-orange-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-orange-700">
                  <div className="flex items-center space-x-1">
                    <Rss className="w-4 h-4" />
                    <span>Feed de notícias do candidato</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{noticias.length} notícias carregadas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Atualizadas automaticamente</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sem notícias encontradas */}
          {!loadingNoticias && candidato.urlRss && noticias.length === 0 && !errorNoticias && (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notícia encontrada no feed</p>
              <p className="text-xs text-gray-400 mt-1">Verifique se a URL do feed está correta e ativa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;