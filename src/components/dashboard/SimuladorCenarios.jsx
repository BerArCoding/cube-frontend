// components/dashboard/SimuladorCenarios.jsx
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  RefreshCw,
  Info,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SimuladorCenarios = ({ candidatoId = null, filtros = null, showTitle = true }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cargoSelecionado, setCargoSelecionado] = useState('Federal');

  useEffect(() => {
    carregarDados();
  }, [candidatoId, filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE}/api/simulador-cenarios/tabelas-por-cargo`;
      
      // Se for para um candidato específico, usar endpoint diferente
      if (candidatoId) {
        url = `${API_BASE}/api/simulador-cenarios/simular/${candidatoId}`;
      }
      
      // Aplicar filtros se fornecidos (para dashboard)
      if (filtros && !candidatoId) {
        const params = new URLSearchParams();
        if (filtros.candidatoIds?.length > 0) {
          params.append('candidatos', filtros.candidatoIds.join(','));
        }
        if (filtros.cargoIds?.length > 0) {
          params.append('cargos', filtros.cargoIds.join(','));
        }
        if (filtros.cargoPretendidoIds?.length > 0) {
          params.append('cargosPretendidos', filtros.cargoPretendidoIds.join(','));
        }
        
        if (params.toString()) {
          url += '?' + params.toString();
        }
      }

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.sucesso) {
        setDados(result.dados);
      } else {
        setError(result.erro || 'Erro ao carregar dados do simulador');
      }
    } catch (err) {
      console.error('Erro ao carregar simulador de cenários:', err);
      setError('Erro de conexão ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getCenarioColor = (tipo) => {
    switch (tipo) {
      case 'otimista': return 'text-green-600 bg-green-50 border-green-200';
      case 'realista': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pessimista': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCenarioIcon = (tipo) => {
    switch (tipo) {
      case 'otimista': return <TrendingUp className="w-5 h-5" />;
      case 'realista': return <Target className="w-5 h-5" />;
      case 'pessimista': return <AlertTriangle className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const formatarScore = (score) => {
    return typeof score === 'number' ? Math.round(score) : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#FF943A]" />
            <h3 className="text-lg font-semibold text-slate-700">
              Simulador de Cenários
            </h3>
          </div>
        )}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF943A] mx-auto mb-2" />
            <p className="text-slate-600">Carregando simulações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#FF943A]" />
            <h3 className="text-lg font-semibold text-slate-700">
              Simulador de Cenários
            </h3>
          </div>
        )}
        <div className="text-center text-red-600 h-64 flex items-center justify-center">
          <div>
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={carregarDados}
              className="mt-2 text-sm text-[#FF943A] hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Para candidato individual - mostrar apenas os dados dele
  if (candidatoId && dados) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#FF943A]" />
              <h3 className="text-lg font-semibold text-slate-700">
                Simulador de Cenários
              </h3>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Baseado em análise de dados</span>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-2">
            {dados.categoria === 'Federal' ? 'Deputado Federal' : 'Deputado Estadual'}
          </h4>
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
            {dados.tipoCanditato === 'VETERANO' ? 'Veterano' : 'Estreante'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Cenário Otimista */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Otimista</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-700 mb-1">
                {dados.cenarioOtimista}
              </div>
              <div className="text-xs text-green-600">Cenário favorável</div>
            </div>
          </div>

          {/* Cenário Realista */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Realista</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {dados.cenarioRealista}
              </div>
              <div className="text-xs text-blue-600">Cenário provável</div>
            </div>
          </div>

          {/* Cenário Pessimista */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Pessimista</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-700 mb-1">
                {dados.cenarioPessimista}
              </div>
              <div className="text-xs text-orange-600">Cenário desfavorável</div>
            </div>
          </div>
        </div>

        {/* Informações técnicas */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Score Cube Base:</span>
              <span className="font-medium">{formatarScore(dados.scoreCube)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Processado em:</span>
              <span className="font-medium">
                {new Date(dados.processadoEm).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Para dashboard - mostrar tabelas por cargo
  if (!dados || (!dados.federal?.length && !dados.estadual?.length)) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#FF943A]" />
            <h3 className="text-lg font-semibold text-slate-700">
              Simulador de Cenários
            </h3>
          </div>
        )}
        <div className="text-center text-slate-500 h-64 flex items-center justify-center">
          <div>
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma simulação de cenários disponível</p>
            <p className="text-xs text-slate-400 mt-1">
              Execute simulações para candidatos Federal/Estadual
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#FF943A]" />
            <h3 className="text-lg font-semibold text-slate-700">
              Simulador de Cenários Geral 2026
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Info className="w-3 h-3" />
            <span>Projeção baseada em análise de dados</span>
          </div>
        </div>
      )}

      {/* Seletor de Cargo */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setCargoSelecionado('Federal')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            cargoSelecionado === 'Federal'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Deputado Federal</span>
        </button>
        <button
          onClick={() => setCargoSelecionado('Estadual')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            cargoSelecionado === 'Estadual'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Deputado Estadual</span>
        </button>
      </div>

      {/* Grid de Cenários */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Card Otimista */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              Otimista
            </span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-4xl font-bold text-green-700 mb-2">
              {cargoSelecionado === 'Federal' ? '92' : '85'}
            </div>
            <div className="text-xs text-green-600 mb-2">Cenário favorável</div>
            <div className="text-xs text-slate-500">
              Condições ideais se alinharem
            </div>
          </div>
        </div>

        {/* Card Realista */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Realista
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-4xl font-bold text-blue-700 mb-2">
              {cargoSelecionado === 'Federal' ? '45' : '68'}
            </div>
            <div className="text-xs text-blue-600 mb-2">Cenário provável</div>
            <div className="text-xs text-slate-500">
              Baseado no cenário atual
            </div>
          </div>
        </div>

        {/* Card Pessimista */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              Pessimista
            </span>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="text-4xl font-bold text-orange-700 mb-2">
              {cargoSelecionado === 'Federal' ? '28' : '32'}
            </div>
            <div className="text-xs text-orange-600 mb-2">Cenário desfavorável</div>
            <div className="text-xs text-slate-500">
              Se adversidades ocorrerem
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Candidatos */}
      {dados[cargoSelecionado.toLowerCase()]?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-semibold text-slate-700">
                  Candidato
                </th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">
                  Tipo
                </th>
                <th className="text-center py-3 px-2 font-semibold text-green-700">
                  Otimista (%)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-blue-700">
                  Realista (%)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-orange-700">
                  Pessimista (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {dados[cargoSelecionado.toLowerCase()].map((candidato, index) => (
                <tr 
                  key={`${candidato.nome}-${index}`}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-2">
                    <div className="font-medium text-slate-900">
                      {candidato.nome}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      candidato.tipo === 'V' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {candidato.tipo === 'V' ? 'Veterano' : 'Estreante'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-bold text-green-700">
                      {candidato.otimista}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-bold text-blue-700">
                      {candidato.realista}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-bold text-orange-700">
                      {candidato.pessimista}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé com informações */}
      {/* <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>
              📊 Federal: {dados?.metadados?.totalFederal || 0} candidatos
            </span>
            <span>
              📊 Estadual: {dados?.metadados?.totalEstadual || 0} candidatos
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              Versão {dados?.metadados?.versaoAlgoritmo || 'v1.0'}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default SimuladorCenarios;