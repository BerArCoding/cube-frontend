import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  ExternalLink, 
  FileText, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Target, 
  Activity, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

const PostAnalysisCalendar = ({ candidato, ultimoPost }) => {
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [postsDodia, setPostsDodia] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Carregar publicações do candidato
  const carregarPublicacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cube_token');
      const response = await fetch(`${API_BASE}/api/candidates/${candidato.id}/publicacoes?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPublicacoes(data.data || []);
        
        // Se não há data selecionada, encontrar o último dia com posts
        if (!selectedDate) {
          const ultimoDiaComPost = encontrarUltimoDiaComPost(data.data || []);
          if (ultimoDiaComPost) {
            setSelectedDate(ultimoDiaComPost);
            setPostsDodia(filtrarPostsPorData(data.data || [], ultimoDiaComPost));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar publicações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidato?.id) {
      carregarPublicacoes();
    }
  }, [candidato?.id]);

  // Encontrar o último dia que teve postagem
  const encontrarUltimoDiaComPost = (posts) => {
    if (!posts.length) return null;
    
    const postsComData = posts.filter(post => post.timestamp);
    if (!postsComData.length) return null;
    
    // Ordenar por data mais recente
    postsComData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return new Date(postsComData[0].timestamp);
  };

  // Filtrar posts por uma data específica
  const filtrarPostsPorData = (posts, data) => {
    const dataStr = data.toDateString();
    return posts.filter(post => {
      if (!post.timestamp) return false;
      return new Date(post.timestamp).toDateString() === dataStr;
    });
  };

  // Gerar dias da semana atual
  const gerarDiasSemana = (data) => {
    const inicio = new Date(data);
    const dia = inicio.getDay();
    const diff = inicio.getDate() - dia; // Domingo = 0
    const primeiroDia = new Date(inicio.setDate(diff));
    
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(primeiroDia);
      dia.setDate(primeiroDia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  // Contar posts por dia
  const contarPostsPorDia = (data) => {
    const dataStr = data.toDateString();
    return publicacoes.filter(post => {
      if (!post.timestamp) return false;
      return new Date(post.timestamp).toDateString() === dataStr;
    }).length;
  };

  // Navegar semana
  const navegarSemana = (direcao) => {
    const nova = new Date(currentWeek);
    nova.setDate(nova.getDate() + (direcao * 7));
    setCurrentWeek(nova);
  };

  // Selecionar data
  const selecionarData = (data) => {
    setSelectedDate(data);
    const posts = filtrarPostsPorData(publicacoes, data);
    setPostsDodia(posts);
  };

  const dias = gerarDiasSemana(currentWeek);
  const hoje = new Date().toDateString();

  if (loading) {
    return (
      <div className="bg-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">ANÁLISE DE POSTS</h2>
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
          <span className="text-gray-600">Carregando publicações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">ANÁLISE DE POSTS</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Calendário Semanal */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Calendário de Postagens</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navegarSemana(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                {dias[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              
              <button
                onClick={() => navegarSemana(1)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
              <div key={index} className="text-center text-xs font-semibold text-gray-500 py-2">
                {dia}
              </div>
            ))}
            
            {dias.map((dia, index) => {
              const postsCount = contarPostsPorDia(dia);
              const isHoje = dia.toDateString() === hoje;
              const isSelected = selectedDate && dia.toDateString() === selectedDate.toDateString();
              const hasPosts = postsCount > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => selecionarData(dia)}
                  className={`
                    relative p-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : hasPosts 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }
                    ${isHoje ? 'ring-2 ring-orange-300' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className={`font-semibold ${isHoje ? 'text-orange-600' : ''}`}>
                      {dia.getDate()}
                    </div>
                    {hasPosts && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-orange-100' : 'text-blue-600'}`}>
                        {postsCount} post{postsCount > 1 ? 's' : ''}
                      </div>
                    )}
                    {isHoje && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts do Dia Selecionado */}
        {selectedDate && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Posts de {selectedDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                {postsDodia.length} publicação(ões)
              </span>
            </div>

            {postsDodia.length > 0 ? (
              <div className="space-y-6">
                {postsDodia.map((post, index) => (
                  <div key={post.id} className="border border-gray-200 rounded-xl p-6 bg-slate-50">
                    {/* Header do Post */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              Post #{index + 1}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center space-x-1`}>
                              {post.type === 'Video' ? (
                                <>
                                  <BarChart3 className="w-3 h-3 text-orange-500" />
                                  <span>Vídeo</span>
                                </>
                              ) : post.type === 'Sidecar' ? (
                                <>
                                  <FileText className="w-3 h-3 text-orange-500" />
                                  <span>Carrossel</span>
                                </>
                              ) : (
                                <>
                                  <Instagram className="w-3 h-3 text-orange-500" />
                                  <span>Imagem</span>
                                </>
                              )}
                            </span>
                            {/* {post.shortCode && (
                              <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-mono">
                                {post.shortCode}
                              </span>
                            )} */}
                          </div>
                          <p className="text-sm text-gray-600">
                            {post.timestamp && (
                              <span className="mr-3 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>
                                  {new Date(post.timestamp).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </span>
                            )}
                            {post.locationName && (
                              <span className="flex items-center space-x-1">
                                <Target className="w-3 h-3 text-gray-400" />
                                <span>{post.locationName}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {post.shortCode && (
                          <a 
                            href={`https://www.instagram.com/p/${post.shortCode}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Legenda */}
                    {post.caption && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            {post.caption}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Métricas do Post */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* Engajamento */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Likes</span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">
                            {formatNumber(post.likesCount || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.likesCount && candidato.followersCount ? 
                            `${((post.likesCount / candidato.followersCount) * 100).toFixed(1)}% dos seguidores` : 
                            'Taxa de engajamento N/A'
                          }
                        </div>
                      </div>

                      {/* Comentários */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Comentários</span>
                          </div>
                          <span className="text-lg font-bold text-gray-700">
                            {formatNumber(post.commentsCount || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Interações ativas
                        </div>
                      </div>

                      {/* Taxa de Resposta */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-gray-700">Taxa</span>
                          </div>
                          <span className="text-lg font-bold text-slate-700">
                            {post.likesCount && post.commentsCount ? 
                              `${((post.commentsCount / post.likesCount) * 100).toFixed(1)}%` : 
                              '0%'
                            }
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Comentários/Likes
                        </div>
                      </div>
                    </div>

                    {/* Tags e Hashtags */}
                    {((post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0) ||
                      (post.mentions && Array.isArray(post.mentions) && post.mentions.length > 0)) && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-start space-x-4">
                          {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-2">Hashtags:</span>
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags.slice(0, 5).map((tag, tagIndex) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                    #{tag}
                                  </span>
                                ))}
                                {post.hashtags.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                    +{post.hashtags.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {post.mentions && Array.isArray(post.mentions) && post.mentions.length > 0 && (
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-2">Menções:</span>
                              <div className="flex flex-wrap gap-1">
                                {post.mentions.slice(0, 3).map((mention, mentionIndex) => (
                                  <span key={mentionIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    @{mention}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-gray-200">
                <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Nenhum post neste dia
                </h4>
                <p className="text-sm text-gray-500">
                  Selecione outro dia no calendário para ver as publicações
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado vazio inicial */}
        {!selectedDate && publicacoes.length === 0 && (
          <div className="text-center py-12">
            <Instagram className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma publicação encontrada
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Este candidato ainda não possui posts coletados ou o perfil do Instagram não foi sincronizado.
            </p>
          </div>
        )}

        {/* Resumo Geral */}
        {publicacoes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-700">Resumo das Publicações</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{publicacoes.length} posts total</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Dados em tempo real</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostAnalysisCalendar;