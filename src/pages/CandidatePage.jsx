import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateAvatar from '../components/CandidateAvatar';
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
  Clock
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

  useEffect(() => {
    carregarDadosCandidato();
  }, [id]);

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
        </div>

        {/* Documentos - Full Width */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">DOCUMENTOS</h2>
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum documento disponível</p>
          </div>
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

        {/* Notícias - Full Width */}
        <div className="bg-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">NOTÍCIAS</h2>
          
          <div className="text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notícia disponível</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;