import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Eye,
  Target,
  MapPin,
  AtSign
} from 'lucide-react';
import CandidateAvatar from './CandidateAvatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TabelaCandidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'followersCount', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    carregarCandidatos();
  }, []);

const carregarCandidatos = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem('cube_token');
    const response = await fetch(`${API_BASE}/api/dashboard/candidatos`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
    });

    const data = await response.json();

    if (data.success) {
      setCandidatos(data.data || []);
    } else {
      console.error('❌ Erro ao carregar candidatos:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  } finally {
    setLoading(false);
  }
};

  // Filtrar candidatos por busca
  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter(candidato =>
      candidato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.instagramHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.cargo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.cargoPretendido?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.macrorregiao?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidatos, searchTerm]);

  // Ordenar candidatos
  const candidatosOrdenados = useMemo(() => {
    if (!sortConfig.key) return candidatosFiltrados;

    return [...candidatosFiltrados].sort((a, b) => {
      let aValue = getNestedValue(a, sortConfig.key);
      let bValue = getNestedValue(b, sortConfig.key);

      // Tratar valores nulos
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;

      // Comparação numérica ou string
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [candidatosFiltrados, sortConfig]);

  // Paginação
  const totalPages = Math.ceil(candidatosOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const candidatosPaginados = candidatosOrdenados.slice(startIndex, startIndex + itemsPerPage);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatPercentage = (num) => {
    if (!num) return null;
    const formatted = num.toFixed(1);
    return formatted > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const getVariacaoIcon = (variacao) => {
    if (!variacao || variacao === 0) return <Minus className="w-3 h-3 text-gray-400" />;
    return variacao > 0 
      ? <TrendingUp className="w-3 h-3 text-green-500" />
      : <TrendingDown className="w-3 h-3 text-red-500" />;
  };

  const getViabilidadeColor = (categoria) => {
    const colors = {
      'ALTA': 'bg-green-100 text-green-800 border-green-200',
      'MEDIA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RISCO': 'bg-orange-100 text-orange-800 border-orange-200',
      'CRITICO': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleCandidatoClick = (candidato) => {
    // TODO: Navegar para página do candidato
    console.log('🎯 Clicou no candidato:', candidato.nome);
    // navigate(`/candidates/${candidato.id}`);
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Carregando candidatos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header da Tabela */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span>Todos os Candidatos</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {candidatosOrdenados.length} candidatos encontrados
            </p>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="nome" className="sticky left-0 bg-gray-50 z-10">
                Candidato
              </SortableHeader>
              <SortableHeader sortKey="cargo.nome">
                Cargo Atual
              </SortableHeader>
              <SortableHeader sortKey="cargoPretendido.nome">
                Cargo Pretendido
              </SortableHeader>
              <SortableHeader sortKey="redutoOrigem">
                Reduto
              </SortableHeader>
              <SortableHeader sortKey="macrorregiao.nome">
                Macrorregião
              </SortableHeader>
              <SortableHeader sortKey="instagramHandle">
                Instagram
              </SortableHeader>
              <SortableHeader sortKey="followersCount">
                Seguidores
              </SortableHeader>
              <SortableHeader sortKey="postsCount">
                Posts
              </SortableHeader>
              <SortableHeader sortKey="followsCount">
                Seguindo
              </SortableHeader>
              <SortableHeader sortKey="pontuacaoViabilidade">
                Score
              </SortableHeader>
              <SortableHeader sortKey="viabilidades.0.categoria">
                Viabilidade
              </SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidatosPaginados.map((candidato) => (
              <tr 
                key={candidato.id}
                onClick={() => handleCandidatoClick(candidato)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Candidato */}
              <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                  <CandidateAvatar 
                    candidate={candidato} 
                    size="md" 
                    showStatus={true} 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {candidato.nome}
                    </p>
                    {candidato.verified && (
                      <div className="flex items-center mt-1">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-blue-600 ml-1">Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
              </td>

                {/* Cargo Atual */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {candidato.cargo?.nome || '-'}
                  </span>
                  {candidato.cargo?.nivel && (
                    <div className="text-xs text-gray-500">
                      {candidato.cargo.nivel}
                    </div>
                  )}
                </td>

                {/* Cargo Pretendido */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {candidato.cargoPretendido?.nome || '-'}
                  </span>
                  {candidato.cargoPretendido?.nivel && (
                    <div className="text-xs text-gray-500">
                      {candidato.cargoPretendido.nivel}
                    </div>
                  )}
                </td>

                {/* Reduto */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {candidato.redutoOrigem || '-'}
                    </span>
                  </div>
                </td>

                {/* Macrorregião */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {candidato.macrorregiao?.nome || '-'}
                  </span>
                </td>

                {/* Instagram */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {candidato.instagramHandle ? (
                    <a 
                      href={`https://instagram.com/${candidato.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <AtSign className="w-3 h-3" />
                      <span>{candidato.instagramHandle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                {/* Seguidores */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(candidato.followersCount)}
                    </span>
                    {candidato.historicoSeguidores?.[0]?.percentualVariacao && (
                      <div className="flex items-center space-x-1">
                        {getVariacaoIcon(candidato.historicoSeguidores[0].percentualVariacao)}
                        <span className={`text-xs ${
                          candidato.historicoSeguidores[0].percentualVariacao > 0 
                            ? 'text-green-600' 
                            : candidato.historicoSeguidores[0].percentualVariacao < 0
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {formatPercentage(candidato.historicoSeguidores[0].percentualVariacao)}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Posts */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatNumber(candidato.postsCount)}
                  </span>
                </td>

                {/* Seguindo */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatNumber(candidato.followsCount)}
                    </span>
                  </div>
                </td>

                {/* Score Viabilidade */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {candidato.pontuacaoViabilidade?.toFixed(1) || '-'}
                    </span>
                  </div>
                </td>

                {/* Categoria Viabilidade */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {candidato.viabilidades?.[0]?.categoria ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getViabilidadeColor(candidato.viabilidades[0].categoria)}`}>
                      {candidato.viabilidades[0].categoria}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Pendente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, candidatosOrdenados.length)} de {candidatosOrdenados.length} candidatos
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaCandidatos;