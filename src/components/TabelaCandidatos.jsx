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
  AtSign,
  Filter,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateAvatar from './CandidateAvatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TabelaCandidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'followersCount', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Estados dos filtros simplificados
  const [filters, setFilters] = useState({
    cargoAtual: [],
    cargoPretendido: [],
    macrorregiao: [],
    viabilidade: [],
    verified: null, // null = todos, true = verificados, false = não verificados
    hasInstagram: null // null = todos, true = tem Instagram, false = não tem
  });

  // ✅ Funções utilitárias
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
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
        setCandidatos(data.data || []); // Carregar todos os candidatos
      } else {
        console.error('❌ Erro ao carregar candidatos:', data.error);
        setCandidatos([]);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      setCandidatos([]);
    } finally {
      setLoading(false);
    }
  };

  // Extrair opções únicas para os filtros
  const filterOptions = useMemo(() => {
    if (!candidatos || candidatos.length === 0) return {};

    return {
      cargoAtual: [...new Set(candidatos.map(c => c.cargo?.nome).filter(Boolean))].sort(),
      cargoPretendido: [...new Set(candidatos.map(c => c.cargoPretendido?.nome).filter(Boolean))].sort(),
      macrorregiao: [...new Set(candidatos.map(c => c.macrorregiao?.nome).filter(Boolean))].sort(),
      viabilidade: [...new Set(candidatos.map(c => c.viabilidades?.[0]?.categoria).filter(Boolean))].sort()
    };
  }, [candidatos]);

  // Aplicar filtros
  const candidatosFiltrados = useMemo(() => {
    if (!candidatos || candidatos.length === 0) return [];
    
    let filtered = candidatos.filter(candidato => {
      // Filtro de busca textual
      const matchesSearch = 
        candidato?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidato?.instagramHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidato?.cargo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidato?.cargoPretendido?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidato?.macrorregiao?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidato?.redutoOrigem?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro de cargo atual
      if (filters.cargoAtual.length > 0 && !filters.cargoAtual.includes(candidato.cargo?.nome)) {
        return false;
      }

      // Filtro de cargo pretendido
      if (filters.cargoPretendido.length > 0 && !filters.cargoPretendido.includes(candidato.cargoPretendido?.nome)) {
        return false;
      }

      // Filtro de macrorregião
      if (filters.macrorregiao.length > 0 && !filters.macrorregiao.includes(candidato.macrorregiao?.nome)) {
        return false;
      }

      // Filtro de viabilidade
      if (filters.viabilidade.length > 0 && !filters.viabilidade.includes(candidato.viabilidades?.[0]?.categoria)) {
        return false;
      }

      // Filtro de verificado
      if (filters.verified !== null && candidato.verified !== filters.verified) {
        return false;
      }

      // Filtro de tem Instagram
      if (filters.hasInstagram !== null) {
        const hasInsta = Boolean(candidato.instagramHandle);
        if (hasInsta !== filters.hasInstagram) return false;
      }

      return true;
    });

    return filtered;
  }, [candidatos, searchTerm, filters]);

  // Ordenar candidatos
  const candidatosOrdenados = useMemo(() => {
    if (!sortConfig.key || candidatosFiltrados.length === 0) return candidatosFiltrados;

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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCandidatoClick = (candidato) => {
    navigate(`/candidates/${candidato.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções de filtro
  const handleCheckboxFilter = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [filterType]: newValues };
    });
    setCurrentPage(1);
  };

  const handleBooleanFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      cargoAtual: [],
      cargoPretendido: [],
      macrorregiao: [],
      viabilidade: [],
      verified: null,
      hasInstagram: null
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      filters.cargoAtual.length > 0 ||
      filters.cargoPretendido.length > 0 ||
      filters.macrorregiao.length > 0 ||
      filters.viabilidade.length > 0 ||
      filters.verified !== null ||
      filters.hasInstagram !== null
    );
  };

  // ✅ Componente SortableHeader
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

  // ✅ Componente CheckboxFilter Melhorado
  const CheckboxFilter = ({ label, options, selected, onChange, icon: Icon }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-orange-500" />}
        <label className="text-sm font-medium text-gray-900">{label}</label>
      </div>
      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        <div className="p-2 space-y-2">
          {options.map(option => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <div 
                className="flex items-center"
                onClick={() => onChange(option)}
              >
                {selected.includes(option) ? (
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-700 flex-1">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ Componente BooleanFilter Melhorado
  const BooleanFilter = ({ label, value, onChange, trueLabel, falseLabel, icon: Icon }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-orange-500" />}
        <label className="text-sm font-medium text-gray-900">{label}</label>
      </div>
      <div className="border border-gray-200 rounded-lg bg-white p-3 space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <div onClick={() => onChange(true)}>
            {value === true ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-700">{trueLabel}</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <div onClick={() => onChange(false)}>
            {value === false ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-700">{falseLabel}</span>
        </label>
      </div>
    </div>
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
              {candidatosOrdenados.length} candidatos encontrados de {candidatos.length} total
              {hasActiveFilters() && (
                <span className="ml-2 text-orange-600 font-medium">
                  (filtros aplicados)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar candidatos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Botão de Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters()
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters() && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                  Ativo
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Filter className="w-5 h-5 text-orange-500" />
                <span>Filtros Avançados</span>
              </h4>
              <div className="flex items-center space-x-3">
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-800 font-medium px-3 py-1 bg-white rounded-md border border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Limpar Filtros</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Filtro Cargo Atual */}
              <CheckboxFilter
                label="Cargo Atual"
                icon={Users}
                options={filterOptions.cargoAtual || []}
                selected={filters.cargoAtual}
                onChange={(value) => handleCheckboxFilter('cargoAtual', value)}
              />

              {/* Filtro Cargo Pretendido */}
              <CheckboxFilter
                label="Cargo Pretendido"
                icon={Target}
                options={filterOptions.cargoPretendido || []}
                selected={filters.cargoPretendido}
                onChange={(value) => handleCheckboxFilter('cargoPretendido', value)}
              />

              {/* Filtro Macrorregião */}
              <CheckboxFilter
                label="Macrorregião"
                icon={MapPin}
                options={filterOptions.macrorregiao || []}
                selected={filters.macrorregiao}
                onChange={(value) => handleCheckboxFilter('macrorregiao', value)}
              />

              {/* Filtro Viabilidade */}
              <CheckboxFilter
                label="Categoria Viabilidade"
                icon={TrendingUp}
                options={filterOptions.viabilidade || []}
                selected={filters.viabilidade}
                onChange={(value) => handleCheckboxFilter('viabilidade', value)}
              />

              {/* Filtro Verificado */}
              <BooleanFilter
                label="Status Verificação"
                icon={CheckSquare}
                value={filters.verified}
                onChange={(value) => handleBooleanFilter('verified', value)}
                trueLabel="Verificados"
                falseLabel="Não Verificados"
              />

              {/* Filtro Tem Instagram */}
              <BooleanFilter
                label="Presença no Instagram"
                icon={AtSign}
                value={filters.hasInstagram}
                onChange={(value) => handleBooleanFilter('hasInstagram', value)}
                trueLabel="Tem Instagram"
                falseLabel="Sem Instagram"
              />
            </div>
          </div>
        </div>
      )}

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
            {candidatosPaginados.length > 0 ? candidatosPaginados.map((candidato) => (
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
            )) : (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || hasActiveFilters() ? 'Nenhum candidato encontrado para os filtros aplicados.' : 'Nenhum candidato cadastrado.'}
                </td>
              </tr>
            )}
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
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 10) {
                    page = i + 1;
                  } else {
                    // Lógica para mostrar páginas relevantes quando há muitas páginas
                    if (currentPage <= 5) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 4) {
                      page = totalPages - 9 + i;
                    } else {
                      page = currentPage - 4 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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