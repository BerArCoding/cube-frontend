import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateAvatar from '../components/CandidateAvatar';
import { FolderOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
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
  ChevronDown,
  Plus,
  X,
  Edit2,
  Trash2,
  Activity,
} from 'lucide-react';
import SimuladorCenarios from '../components/dashboard/SimuladorCenarios';
import PostAnalysisCalendar from '../components/PostAnalysisCalendar.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Componente compacto para métricas com setas de crescimento
  const MetricaCompacta = ({ icon: IconComponent, color, label, value, historico, campo }) => {
    const calcularCrescimento = () => {
      if (!historico || historico.length < 2) return null;
      
      const atual = historico[0]?.[campo];
      const anterior = historico[1]?.[campo];
      
      if (!atual || !anterior) return null;
      
      const diferenca = atual - anterior;
      
      return {
        diferenca,
        cresceu: diferenca > 0,
        diminuiu: diferenca < 0
      };
    };

    const crescimento = calcularCrescimento();

    const colorClasses = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800 text-blue-900',
      green: 'from-green-50 to-green-100 border-green-200 text-green-600 text-green-800 text-green-900',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600 text-orange-800 text-orange-900',
    };

    const [bgClass, iconClass, labelClass, valueClass] = colorClasses[color].split(' ');

    return (
      <div className={`text-center p-3 bg-gradient-to-br ${bgClass} rounded-lg border ${bgClass.replace('from-', 'border-').replace('-50', '-200').replace(' to-', '').replace('-100', '')}`}>
        <div className="flex items-center justify-center space-x-1 mb-1">
          <IconComponent className={`w-4 h-4 ${iconClass}`} />
          {crescimento && (
            <div className={`${
              crescimento.cresceu ? 'text-emerald-500' : 
              crescimento.diminuiu ? 'text-red-500' : 'text-gray-400'
            }`}>
              {crescimento.cresceu && <TrendingUp className="w-3 h-3" />}
              {crescimento.diminuiu && <TrendingDown className="w-3 h-3" />}
            </div>
          )}
        </div>
        <div className={`text-xs font-semibold ${labelClass} mb-1`}>{label}</div>
        <div className={`text-sm font-bold ${valueClass}`}>
          {value}
        </div>
        {crescimento && (
          <div className={`text-xs font-medium ${
            crescimento.cresceu ? 'text-emerald-600' : 
            crescimento.diminuiu ? 'text-red-600' : 'text-gray-500'
          }`}>
            {crescimento.cresceu ? '+' : ''}{crescimento.diferenca.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

const CandidatePage = () => {
  const { user, logout, isAdmin } = useAuth();
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
  const [insights, setInsights] = useState([]);
const [loadingInsights, setLoadingInsights] = useState(false);
const [showCreateInsight, setShowCreateInsight] = useState(false);
const [editingInsight, setEditingInsight] = useState(null);
const [newInsight, setNewInsight] = useState({ titulo: '', conteudo: '' });
const [insightsPage, setInsightsPage] = useState(1);
const [insightsTotal, setInsightsTotal] = useState(0);
const [deletingInsight, setDeletingInsight] = useState(null);

// Adicionar esta função para carregar insights
const carregarInsights = async (page = 1) => {
  try {
    setLoadingInsights(true);
    const token = localStorage.getItem('cube_token');
    const response = await fetch(
      `${API_BASE}/api/candidates/${id}/insights?page=${page}&limit=10&orderBy=criadoEm&order=desc`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      setInsights(data.data.insights || data.insights || []);
      setInsightsTotal(data.pagination.total || 0);
      setInsightsPage(page);
    }
  } catch (err) {
    console.error('Erro ao carregar insights:', err);
  } finally {
    setLoadingInsights(false);
  }
};

// Adicionar esta função para criar insight
const criarInsight = async () => {
  if (!newInsight.titulo.trim() || !newInsight.conteudo.trim()) {
    alert('Por favor, preencha título e conteúdo');
    return;
  }

  try {
    const token = localStorage.getItem('cube_token');
    const response = await fetch(`${API_BASE}/api/candidates/${id}/insights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newInsight)
    });

    if (response.ok) {
      setNewInsight({ titulo: '', conteudo: '' });
      setShowCreateInsight(false);
      await carregarInsights(1);
    } else {
      alert('Erro ao criar insight');
    }
  } catch (err) {
    console.error('Erro ao criar insight:', err);
    alert('Erro ao criar insight');
  }
};

// Adicionar esta função para atualizar insight
const atualizarInsight = async (insightId, dados) => {
  try {
    const token = localStorage.getItem('cube_token');
    const response = await fetch(`${API_BASE}/api/candidates/${id}/insights/${insightId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      setEditingInsight(null);
      await carregarInsights(insightsPage);
    } else {
      alert('Erro ao atualizar insight');
    }
  } catch (err) {
    console.error('Erro ao atualizar insight:', err);
    alert('Erro ao atualizar insight');
  }
};

// Adicionar esta função para deletar insight
const deletarInsight = async (insightId) => {
  if (!confirm('Tem certeza que deseja deletar este insight?')) return;

  try {
    setDeletingInsight(insightId);
    const token = localStorage.getItem('cube_token');
    const response = await fetch(`${API_BASE}/api/candidates/${id}/insights/${insightId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      await carregarInsights(insightsPage);
    } else {
      alert('Erro ao deletar insight');
    }
  } catch (err) {
    console.error('Erro ao deletar insight:', err);
    alert('Erro ao deletar insight');
  } finally {
    setDeletingInsight(null);
  }
};

// Adicionar no useEffect após carregarDadosCandidato
useEffect(() => {
  if (candidato) {
    carregarInsights();
  }
}, [candidato]);

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

  const [candidatoRes, publicacoesRes, nuvemPalavrasRes, sentimentosRes] = await Promise.all([
    fetch(`${API_BASE}/api/candidates/${id}`, { headers }),
    fetch(`${API_BASE}/api/candidates/${id}/publicacoes?limit=1`, { headers }),
    fetch(`${API_BASE}/api/dashboard/nuvem-palavras?candidatos=${id}`, { headers }),
    fetch(`${API_BASE}/api/candidates/${id}/sentimentos?limit=20`, { headers })
  ]);

    if (!candidatoRes.ok) {
      throw new Error('Candidato não encontrado');
    }

    const candidatoData = await candidatoRes.json();
      setCandidato({
        ...candidatoData.data,

        historicoSeguidores: candidatoData.data.historicoSeguidores?.slice(0, 2) || []
      });

    if (publicacoesRes.ok) {
      const publicacoesData = await publicacoesRes.json();
      if (publicacoesData.success && publicacoesData.data?.length > 0) {
        const ultimaPublicacao = publicacoesData.data[0];
        setUltimoPost(ultimaPublicacao);
      } else {
        setUltimoPost(null);
      }
    } else {
      setUltimoPost(null);
    }


  if (sentimentosRes.ok) {
    const sentimentosData = await sentimentosRes.json();
    if (sentimentosData.success && sentimentosData.data) {
      setAnalisesSentimento(sentimentosData.data);
    } else {
      setAnalisesSentimento(null);
    }
  } else {
    setAnalisesSentimento(null);
  }

  } catch (err) {
    console.error('Erro ao carregar candidato:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Função para buscar notícias do RSS do candidato
  const fetchCandidateNews = async (limit = 8) => {
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
          
          {/* Grid Compacto - Primeira Linha */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">REDUTO DE ORIGEM</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.redutoOrigem || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">MACRORREGIÃO</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.macrorregiao?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">CARGO ATUAL</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.cargo?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VOTOS ÚLTIMA ELEIÇÃO</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.votosUltimaEleicao ? formatNumber(candidato.votosUltimaEleicao) : 'N/A'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">CARGO PRETENDIDO</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.cargoPretendido?.nome || 'Não informado'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VOTOS NECESSÁRIOS</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.votosNecessarios ? formatNumber(candidato.votosNecessarios) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Grid Compacto - Segunda Linha (Instagram) */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">INSTAGRAM</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center">
                {candidato.instagramHandle ? `@${candidato.instagramHandle}` : 'N/A'}
              </div>
            </div>

            {/* Seguidores com Indicador */}
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">SEGUIDORES</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center relative">
                <div className="flex items-center space-x-1">
                  <span>{formatNumber(candidato.followersCount)}</span>
                  {candidato.historicoSeguidores?.length >= 2 && (() => {
                    const atual = candidato.historicoSeguidores[0]?.followersCount;
                    const anterior = candidato.historicoSeguidores[1]?.followersCount;
                    if (atual && anterior) {
                      const cresceu = atual > anterior;
                      const diminuiu = atual < anterior;
                      return (
                        <div className="flex items-center">
                          {cresceu && <TrendingUp className="w-3 h-3 text-green-300" />}
                          {diminuiu && <TrendingDown className="w-3 h-3 text-red-300" />}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="text-xs opacity-75">Total Atual</div>
              </div>
            </div>

            {/* Posts com Indicador */}
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">POSTS</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center">
                <div className="flex items-center space-x-1">
                  <span>{formatNumber(candidato.postsCount)}</span>
                  {candidato.historicoSeguidores?.length >= 2 && (() => {
                    const atual = candidato.historicoSeguidores[0]?.postsCount;
                    const anterior = candidato.historicoSeguidores[1]?.postsCount;
                    if (atual && anterior) {
                      const cresceu = atual > anterior;
                      const diminuiu = atual < anterior;
                      return (
                        <div className="flex items-center">
                          {cresceu && <TrendingUp className="w-3 h-3 text-green-300" />}
                          {diminuiu && <TrendingDown className="w-3 h-3 text-red-300" />}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="text-xs opacity-75">Total</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">SEGUINDO</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center">
                <span>{formatNumber(candidato.followsCount)}</span>
                <div className="text-xs opacity-75">Total</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">ENGAJAMENTO</div>
              <div className="bg-orange-400 text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center">
                <span>
                  {candidato.followersCount && ultimoPost?.likesCount ? 
                    `${((ultimoPost.likesCount / candidato.followersCount) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </span>
                <div className="text-xs opacity-75">Último post</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VERIFICADO</div>
              <div className={`${candidato.verified ? 'bg-orange-400' : 'bg-gray-400'} text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center`}>
                <span>{candidato.verified ? '✓ Sim' : '✗ Não'}</span>
                <div className="text-xs opacity-75">Instagram</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">VIABILIDADE</div>
              <div className={`${getViabilidadeColor(candidato.pontuacaoViabilidade)} text-white px-2 py-2 rounded-lg text-xs font-medium h-12 flex items-center justify-center`}>
                {candidato.pontuacaoViabilidade ? `${candidato.pontuacaoViabilidade.toFixed(0)}%` : 'N/A'}
              </div>
            </div>
          </div>

          {candidato.observacoes && (
            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">OBSERVAÇÕES</div>
              <div className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                {candidato.observacoes}
              </div>
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

<PostAnalysisCalendar 
  candidato={candidato} 
  ultimoPost={ultimoPost} 
/>

{/* Análise Sentimento - Full Width */}
<div className="bg-gray-200 rounded-2xl p-6 mb-8">
  <h2 className="text-xl font-bold text-gray-900 mb-6">ANÁLISE DE SENTIMENTO</h2>
  
  {analisesSentimento ? (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header com resumo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Análise de Sentimento
            </h3>
          </div>
        </div>
        
        {/* Score principal */}
        <div className="text-center">
          <div className={`text-4xl font-bold mb-1 ${
            analisesSentimento.estatisticas.scoreMedio > 0.2 ? 'text-green-600' :
            analisesSentimento.estatisticas.scoreMedio < -0.2 ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {analisesSentimento.estatisticas.scoreMedio > 0 ? '+' : ''}
            {(analisesSentimento.estatisticas.scoreMedio * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">Score Médio</div>
        </div>
      </div>

      {/* Gráfico circular de distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Visualização circular */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64"> {/* Alterado de w-40 h-40 para w-64 h-64 */}
            {/* Círculo base */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              
              {/* Segmento positivo */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={`${(analisesSentimento.estatisticas.distribuicao.positivo / analisesSentimento.estatisticas.total) * 251.2} 251.2`}
                strokeDashoffset="0"
                className="transition-all duration-1000"
              />
              
              {/* Segmento neutro */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeDasharray={`${(analisesSentimento.estatisticas.distribuicao.neutro / analisesSentimento.estatisticas.total) * 251.2} 251.2`}
                strokeDashoffset={`-${(analisesSentimento.estatisticas.distribuicao.positivo / analisesSentimento.estatisticas.total) * 251.2}`}
                className="transition-all duration-1000"
              />
              
              {/* Segmento negativo */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray={`${(analisesSentimento.estatisticas.distribuicao.negativo / analisesSentimento.estatisticas.total) * 251.2} 251.2`}
                strokeDashoffset={`-${((analisesSentimento.estatisticas.distribuicao.positivo + analisesSentimento.estatisticas.distribuicao.neutro) / analisesSentimento.estatisticas.total) * 251.2}`}
                className="transition-all duration-1000"
              />
            </svg>
            
            {/* Texto central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {analisesSentimento.estatisticas.total}
                </div>
                <div className="text-sm text-gray-500">análises</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda e detalhes */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Positivo */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Positivos</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-700">
                  {analisesSentimento.estatisticas.distribuicao.positivo}
                </div>
                <div className="text-xs text-green-600">
                  {((analisesSentimento.estatisticas.distribuicao.positivo / analisesSentimento.estatisticas.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Neutro */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-yellow-800">Neutros</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-700">
                  {analisesSentimento.estatisticas.distribuicao.neutro}
                </div>
                <div className="text-xs text-yellow-600">
                  {((analisesSentimento.estatisticas.distribuicao.neutro / analisesSentimento.estatisticas.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Negativo */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-800">Negativos</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-700">
                  {analisesSentimento.estatisticas.distribuicao.negativo}
                </div>
                <div className="text-xs text-red-600">
                  {((analisesSentimento.estatisticas.distribuicao.negativo / analisesSentimento.estatisticas.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Confiança média */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Confiança Média</span>
              <span className="text-sm font-bold text-slate-800">
                {(analisesSentimento.estatisticas.confiancaMedia * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analisesSentimento.estatisticas.confiancaMedia * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Palavras-chave */}
      {analisesSentimento.estatisticas.palavrasChave?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-500" />
            <span>Palavras-chave Mais Mencionadas</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {analisesSentimento.estatisticas.palavrasChave.map((palavra, index) => (
              <span 
                key={index} 
                className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium border border-orange-200 hover:bg-orange-200 transition-colors"
              >
                {palavra}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Última análise */}
      {/* {analisesSentimento.ultimaAnalise && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Última Análise Processada</span>
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              analisesSentimento.ultimaAnalise.sentimentoLabel === 'POSITIVO' ? 'bg-green-100 text-green-700' :
              analisesSentimento.ultimaAnalise.sentimentoLabel === 'NEGATIVO' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {analisesSentimento.ultimaAnalise.sentimentoLabel}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-medium">Score:</span> {(analisesSentimento.ultimaAnalise.sentimentoScore * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Confiança:</span> {(analisesSentimento.ultimaAnalise.confianca * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Processado:</span> {new Date(analisesSentimento.ultimaAnalise.processadoEm).toLocaleDateString('pt-BR')}
            </div>
            {analisesSentimento.ultimaAnalise.totalComentariosAnalisados && (
              <div>
                <span className="font-medium">Comentários:</span> {analisesSentimento.ultimaAnalise.totalComentariosAnalisados}
              </div>
            )}
            {analisesSentimento.ultimaAnalise.publicacao?.shortCode && (
              <div>
                <span className="font-medium">Post:</span> 
                <a 
                  href={`https://instagram.com/p/${analisesSentimento.ultimaAnalise.publicacao.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 ml-1"
                >
                  {analisesSentimento.ultimaAnalise.publicacao.shortCode}
                </a>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  ) : (
    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Nenhuma análise de sentimento disponível
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
        As análises de sentimento são processadas automaticamente quando há comentários nas publicações.
      </p>
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <RefreshCw className="w-3 h-3" />
          <span>Processamento automático</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Aguardando comentários</span>
        </div>
      </div>
    </div>
  )}
</div>

        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SIMULADOR DE CENÁRIOS</h2>
          
          <div className="bg-white rounded-xl p-6">
            <SimuladorCenarios 
              candidatoId={candidato.id}
              showTitle={false}
            />
          </div>
        </div>

        {/* Recomendações Estratégicas - Full Width */}
<div className="bg-gray-200 rounded-2xl p-6 mb-8">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-3">
      <h2 className="text-xl font-bold text-gray-900">RECOMENDAÇÕES ESTRATÉGICAS</h2>
      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
        {insightsTotal} insights
      </span>
    </div>
    
    {isAdmin()  && (
      <button
      onClick={() => setShowCreateInsight(true)}
      className="flex items-center space-x-2 bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
    >
      <Plus className="w-4 h-4" />
      <span>Novo Insight</span>
    </button>
    )}
    
  </div>

  {/* Formulário de Criação */}
  {showCreateInsight && (
    <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Criar Novo Insight</h3>
        <button
          onClick={() => {
            setShowCreateInsight(false);
            setNewInsight({ titulo: '', conteudo: '' });
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Insight
          </label>
          <input
            type="text"
            value={newInsight.titulo}
            onChange={(e) => setNewInsight(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Estratégia de Redes Sociais"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo
          </label>
          <textarea
            value={newInsight.conteudo}
            onChange={(e) => setNewInsight(prev => ({ ...prev, conteudo: e.target.value }))}
            placeholder="Descreva a recomendação estratégica..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowCreateInsight(false);
              setNewInsight({ titulo: '', conteudo: '' });
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={criarInsight}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Criar Insight
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Loading */}
  {loadingInsights && (
    <div className="text-center py-8">
      <div className="flex items-center justify-center space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-gray-600">Carregando insights...</span>
      </div>
    </div>
  )}

  {/* Lista de Insights */}
  {!loadingInsights && insights.length > 0 && (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div key={insight.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200">
          {editingInsight?.id === insight.id ? (
            // Modo de Edição
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={editingInsight.titulo}
                  onChange={(e) => setEditingInsight(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={editingInsight.conteudo}
                  onChange={(e) => setEditingInsight(prev => ({ ...prev, conteudo: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingInsight(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => atualizarInsight(insight.id, {
                    titulo: editingInsight.titulo,
                    conteudo: editingInsight.conteudo
                  })}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            // Modo de Visualização
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.titulo}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      Insight
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify">{insight.conteudo}</p>
                </div>
                
                {isAdmin() && (
                  <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingInsight({ ...insight })}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar insight"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletarInsight(insight.id)}
                    disabled={deletingInsight === insight.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Deletar insight"
                  >
                    {deletingInsight === insight.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                )}
                
              </div>
              
              {/* Meta informações */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {insight.criadoEm ? 
                        new Date(insight.criadoEm).toLocaleDateString('pt-BR') : 
                        'Data não disponível'
                      }
                    </span>
                  </div>
                  {insight.atualizadoEm && insight.atualizadoEm !== insight.criadoEm && (
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>
                        Atualizado em {new Date(insight.atualizadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Target className="w-3 h-3" />
                  <span>Estratégico</span>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )}

  {/* Paginação */}
  {!loadingInsights && insights.length > 0 && insightsTotal > 10 && (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-300">
      <div className="text-sm text-gray-600">
        Mostrando {((insightsPage - 1) * 10) + 1} a {Math.min(insightsPage * 10, insightsTotal)} de {insightsTotal} insights
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => carregarInsights(insightsPage - 1)}
          disabled={insightsPage <= 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
          {insightsPage}
        </span>
        <button
          onClick={() => carregarInsights(insightsPage + 1)}
          disabled={insightsPage * 10 >= insightsTotal}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>
    </div>
  )}

  {/* Estado vazio */}
  {!loadingInsights && insights.length === 0 && (
    <div className="text-center text-gray-500 py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhum insight estratégico
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
        Crie recomendações estratégicas para ajudar na campanha do candidato.
      </p>
      <button
        onClick={() => setShowCreateInsight(true)}
        className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Criar Primeiro Insight</span>
      </button>
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
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-orange-400 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
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
                            <div className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1">
                              <Eye className="w-5 h-5" />
                            </div>
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