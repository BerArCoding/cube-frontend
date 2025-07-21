// pages/Dashboard.jsx - COM ÍCONES E RSS.APP
import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  Users, 
  FileText, 
  MessageCircle, 
  TrendingUp,
  BarChart3,
  Target,
  MessageSquare,
  Activity,
  Zap,
  Rss
} from 'lucide-react';
import Header from '../components/Header';
import SemaforoViabilidade from '../components/dashboard/SemaforoViabilidade';
import RedesSociais from '../components/dashboard/RedesSociais';
import NuvemPalavras from '../components/dashboard/NuvemPalavras';
import MetricasAvancadas from '../components/dashboard/MetricasAvancadas';
import RSSAppFeed from '../components/RssAppFeed'; // ← NOVO IMPORT
import styles from '../styles/Dashboard.module.css';
import FiltrosDashboard from '../components/dashboard/FiltrosDashboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Dashboard = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState('geral');
  const [filtrosAtivos, setFiltrosAtivos] = useState(null);
  const [filtrosCarregados, setFiltrosCarregados] = useState(false);

  // ✅ CORRIGIR - Carregar dados quando filtros estiverem prontos
  useEffect(() => {
    if (filtrosCarregados && filtrosAtivos) {
      carregarDados();
    }
  }, [filtrosAtivos, filtrosCarregados]);

  // ✅ CARREGAR dados iniciais sem filtros se não houver filtros em 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!filtrosCarregados) {
        carregarDadosSemFiltros();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtrosAtivos?.candidatoIds?.length > 0) {
        params.append('candidatos', filtrosAtivos.candidatoIds.join(','));
      }
      if (filtrosAtivos?.cargoIds?.length > 0) {
        params.append('cargos', filtrosAtivos.cargoIds.join(','));
      }

      const url = `${API_BASE}/api/dashboard${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.sucesso) {
        setDados(result.dados);
        setUltimaAtualizacao(new Date());
      } else {
        console.error('❌ Erro na resposta:', result.erro);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVA função para carregar sem filtros
  const carregarDadosSemFiltros = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/dashboard`);
      const result = await response.json();
      
      if (result.sucesso) {
        setDados(result.dados);
        setUltimaAtualizacao(new Date());
      } else {
        console.error('❌ Erro na resposta:', result.erro);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODIFICAR função de mudança de filtros
  const handleFiltroChange = (novosFiltros) => {
    setFiltrosAtivos(novosFiltros);
    setFiltrosCarregados(true);
  };

  const exportarRelatorio = async () => {
    // Implementar depois
  };

  const abas = [
    { id: 'geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'redes', label: 'Redes Sociais', icon: Activity },
    { id: 'viabilidade', label: 'Viabilidade', icon: Target },
    { id: 'palavras', label: 'Nuvem de Palavras', icon: MessageSquare },
    { id: 'rss', label: 'Noticias', icon: Rss }, // ← ATUALIZADO ÍCONE E LABEL
    // { id: 'avancado', label: 'Métricas Avançadas', icon: TrendingUp }
  ];

  if (loading && !dados && !filtrosCarregados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header title="Dashboard" />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className={styles.spinnerCustom}></div>
              <p className="text-slate-600 mt-4">Carregando dados do dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      <Header title="Dashboard" />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header do Dashboard */}
        <div className={`mb-8 ${styles.animateSlideUp}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-slate-700 mb-2">
                Dashboard de Análise Política
              </h2>
              <p className="text-slate-500">
                Acompanhe métricas, viabilidade e engajamento em tempo real
              </p>
              {ultimaAtualizacao && (
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Última atualização: {ultimaAtualizacao.toLocaleString()}</span>
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={carregarDados}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={exportarRelatorio}
                className={`flex items-center space-x-2 px-4 py-2 ${styles.gradientOrange} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Filtros só aparecem se não for a aba RSS */}
        {abaSelecionada !== 'rss' && (
          <div className={`mb-8 ${styles.animateSlideUp} relative z-50`} style={{ animationDelay: '0.05s', minHeight: '300px' }}>
            <FiltrosDashboard onFiltroChange={handleFiltroChange} />
          </div>
        )}

        {/* Navegação por Abas */}
        <div className={`mb-8 ${styles.animateSlideUp}`} style={{ animationDelay: '0.1s' }}>
          <div className="border-b border-slate-200 bg-white rounded-t-lg">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {abas.map((aba) => {
                const IconComponent = aba.icon;
                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaSelecionada(aba.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      abaSelecionada === aba.id
                        ? 'border-[#FF943A] text-[#FF943A]'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{aba.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className={styles.animateFadeIn}>
          {abaSelecionada === 'geral' && (
            <div className="space-y-8">
              {/* Cards de Estatísticas Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Candidatos" 
                  value={dados?.estatisticasGerais?.candidatos?.total || 0}
                  subtitle={`${dados?.estatisticasGerais?.candidatos?.ativos || 0} ativos`}
                  color="bg-blue-500"
                  icon={Users}
                  hoverClass={styles.hoverLift}
                />
                <StatCard 
                  title="Total Publicações" 
                  value={dados?.estatisticasGerais?.conteudo?.publicacoes || 0}
                  color="bg-green-500"
                  icon={FileText}
                  hoverClass={styles.hoverLift}
                />
                <StatCard 
                  title="Total Comentários" 
                  value={dados?.estatisticasGerais?.conteudo?.comentarios || 0}
                  color="bg-purple-500"
                  icon={MessageCircle}
                  hoverClass={styles.hoverLift}
                />
                <StatCard 
                  title="Total Alcance" 
                  value={dados?.redesSociais?.totalAlcance || 0}
                  subtitle="seguidores"
                  color="bg-[#FF943A]"
                  icon={TrendingUp}
                  hoverClass={styles.hoverLift}
                />
              </div>

              {/* Grid Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-[#FF943A]" />
                    <h3 className="text-lg font-semibold text-slate-700">
                      Semáforo de Viabilidade
                    </h3>
                  </div>
                  <SemaforoViabilidade dados={dados?.viabilidade} />
                </div>

                <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="w-5 h-5 text-[#FF943A]" />
                    <h3 className="text-lg font-semibold text-slate-700">
                      Métricas de Redes Sociais
                    </h3>
                  </div>
                  <RedesSociais dados={dados?.redesSociais} showIcons={false} />
                </div>
              </div>
            </div>
          )}

          {abaSelecionada === 'redes' && (
            <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
              <RedesSociais dados={dados?.redesSociais} />
            </div>
          )}

          {abaSelecionada === 'viabilidade' && (
            <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
              <SemaforoViabilidade dados={dados?.viabilidade} />
            </div>
          )}

          {abaSelecionada === 'palavras' && (
            <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
              <NuvemPalavras dados={dados?.nuvemPalavras} />
            </div>
          )}

          {abaSelecionada === 'avancado' && (
            <div className="space-y-6">
              <MetricasAvancadas dados={dados} />
            </div>
          )}

          {/* ✅ NOVA ABA RSS com o componente RSSAppFeed */}
          {abaSelecionada === 'rss' && (
            <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${styles.hoverLift}`}>
              <RSSAppFeed />
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

// StatCard atualizado com ícones
const StatCard = ({ title, value, subtitle, color, icon: IconComponent, hoverClass }) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    return val || 0;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${hoverClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-700">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-16 h-16 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          <IconComponent className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;