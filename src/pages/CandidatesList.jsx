import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/Header.jsx';
import candidateService from '../services/candidates.js';
import cargoService from '../services/cargos.js';
import { Button } from '../components/ui';
import { 
  Plus, 
  Search, 
  Users, 
  Edit3, 
  Eye,
  MoreVertical,
  MapPin,
  Vote,
  UserMinus,
  UserPlus,
  Filter
} from 'lucide-react';

const CandidatesList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]); // Todos os candidatos para contagem
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCargos, setLoadingCargos] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  // Carregar cargos do banco
  useEffect(() => {
    const loadCargos = async () => {
      setLoadingCargos(true);
      try {
        const response = await cargoService.getUniqueCargoNames();
        setCargos(response.data);
        
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        setCargos([]);
      } finally {
        setLoadingCargos(false);
      }
    };

    loadCargos();
  }, []);

  // Carregar todos os candidatos para contagem
  useEffect(() => {
    const loadAllCandidates = async () => {
      if (!isAdmin()) {
        navigate('/dashboard');
        return;
      }

      try {
        // Buscar TODOS os candidatos (ativos e inativos) para contagem real
        const responseAll = await candidateService.getAllCandidates({
          includeInactive: true // Sempre incluir inativos para contagem
        });
        setAllCandidates(responseAll.data || []);
      } catch (error) {
        console.error('Erro ao carregar contagem de candidatos:', error);
        setAllCandidates([]);
      }
    };

    loadAllCandidates();
  }, [isAdmin, navigate]);

  // Carregar candidatos filtrados
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    const loadCandidates = async () => {
      try {
        const response = await candidateService.getAllCandidates({
          search: searchTerm,
          cargo: filterCargo,
          includeInactive: showInactive
        });
        setCandidates(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar candidatos:', error);
        // Fallback para dados mock
        const mockCandidates = [
          {
            id: '1',
            nome: 'João Silva Santos',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            cargoAtual: 'Vereador',
            redutoOrigem: 'São Paulo - SP',
            votosUltimaEleicao: 15420,
            cargoPretendido: 'Deputado Estadual',
            pontuacaoViabilidade: 7.8,
            ativo: true,
            criadoEm: '2025-01-10'
          },
          {
            id: '2',
            nome: 'Maria Oliveira Costa',
            foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            cargoAtual: 'Prefeita',
            redutoOrigem: 'Rio de Janeiro - RJ',
            votosUltimaEleicao: 89750,
            cargoPretendido: 'Governadora',
            pontuacaoViabilidade: 8.9,
            ativo: false,
            criadoEm: '2025-01-08'
          }
        ];
        setCandidates(mockCandidates);
        setAllCandidates(mockCandidates); // Para contagem também
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [isAdmin, navigate, searchTerm, filterCargo, showInactive]);

  // Atualizar candidato nas duas listas quando inativar/reativar
  const updateCandidateInBothLists = (id, updates) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
    setAllCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.cargoAtual?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.cargoPretendido?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterCargo || 
                         candidate.cargoAtual === filterCargo || 
                         candidate.cargoPretendido === filterCargo;
    
    const matchesStatus = showInactive || candidate.ativo;
    
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const handleDeactivateCandidate = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja inativar o candidato "${nome}"?`)) {
      setLoadingAction(id);
      try {
        await candidateService.deactivateCandidate(id);
        updateCandidateInBothLists(id, { ativo: false });
        alert('Candidato inativado com sucesso!');
      } catch (error) {
        console.error('Erro ao inativar candidato:', error);
        alert(`Erro ao inativar candidato: ${error.message}`);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleReactivateCandidate = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja reativar o candidato "${nome}"?`)) {
      setLoadingAction(id);
      try {
        await candidateService.reactivateCandidate(id);
        updateCandidateInBothLists(id, { ativo: true });
        alert('Candidato reativado com sucesso!');
      } catch (error) {
        console.error('Erro ao reativar candidato:', error);
        alert(`Erro ao reativar candidato: ${error.message}`);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const getViabilityColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Candidatos" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Contagem real de todos os candidatos (independente de filtros)
  const totalActiveCandidates = allCandidates.filter(c => c.ativo).length;
  const totalInactiveCandidates = allCandidates.filter(c => !c.ativo).length;
  
  // Contagem dos candidatos sendo exibidos (após filtros)
  const displayedActiveCandidates = filteredCandidates.filter(c => c.ativo).length;
  const displayedInactiveCandidates = filteredCandidates.filter(c => !c.ativo).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Candidatos" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Candidatos
              </h1>
              <div className="text-slate-600 mt-1">
                {/* Contagem real total */}
                <p className="text-sm">
                  <span className="font-medium text-green-600">{totalActiveCandidates} ativo(s)</span>
                  {' • '}
                  <span className="font-medium text-red-600">{totalInactiveCandidates} inativo(s)</span>
                  {' • '}
                  <span className="text-slate-500">{allCandidates.length} total</span>
                </p>
                
                {/* Contagem filtrada (se houver filtros aplicados) */}
                {(searchTerm || filterCargo || showInactive) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm && ` • Busca: "${searchTerm}"`}
                    {filterCargo && ` • Cargo: "${filterCargo}"`}
                    {showInactive && ` • Incluindo inativos`}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/candidates/create')}
            className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Candidato</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>
            </div>
            
            {/* Filtro por cargo - DINÂMICO DO BANCO */}
            <div className="lg:w-64">
              <select
                value={filterCargo}
                onChange={(e) => setFilterCargo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                disabled={loadingCargos}
              >
                <option value="">
                  {loadingCargos ? 'Carregando cargos...' : 'Todos os cargos'}
                </option>
                {cargos.map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </select>
              {loadingCargos && (
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500 mr-1"></div>
                  Carregando cargos do banco...
                </div>
              )}
            </div>

            {/* Toggle para mostrar inativos */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-200"
              />
              <label htmlFor="showInactive" className="text-sm text-slate-700">
                Mostrar inativos
              </label>
            </div>

            {/* Info sobre quantos cargos foram carregados */}
            {!loadingCargos && cargos.length > 0 && (
              <div className="text-xs text-slate-500">
                {cargos.length} cargos disponíveis
              </div>
            )}
          </div>
        </div>

        {/* Lista de candidatos */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum candidato encontrado
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterCargo ? 
                'Tente ajustar os filtros de busca' : 
                'Comece adicionando seu primeiro candidato'
              }
            </p>
            {!searchTerm && !filterCargo && (
              <Button
                onClick={() => navigate('/candidates/create')}
                className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Candidato</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className={`bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all ${
                  !candidate.ativo ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <div className="p-6">
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 relative">
                        {candidate.foto ? (
                          <img
                            src={candidate.foto}
                            alt={candidate.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                            {candidate.nome.charAt(0)}
                          </div>
                        )}
                        {!candidate.ativo && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <UserMinus className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {candidate.nome}
                          </h3>
                          {!candidate.ativo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {candidate.cargoAtual || 'Sem cargo atual'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="space-y-3">
                    {candidate.redutoOrigem && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.redutoOrigem}</span>
                      </div>
                    )}
                    
                    {candidate.votosUltimaEleicao && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Vote className="h-4 w-4" />
                        <span>{formatNumber(candidate.votosUltimaEleicao)} votos</span>
                      </div>
                    )}
                    
                    {candidate.cargoPretendido && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Pretende:</span>
                        <span className="text-sm font-medium text-slate-900">
                          {candidate.cargoPretendido}
                        </span>
                      </div>
                    )}
                    
                    {candidate.pontuacaoViabilidade && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Viabilidade:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getViabilityColor(candidate.pontuacaoViabilidade)}`}>
                          {candidate.pontuacaoViabilidade}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>Ver detalhes</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {candidate.ativo ? (
                        <>
                          <button 
                            onClick={() => navigate(`/candidates/edit/${candidate.id}`)}
                            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar candidato"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeactivateCandidate(candidate.id, candidate.nome)}
                            disabled={loadingAction === candidate.id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Inativar candidato"
                          >
                            {loadingAction === candidate.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <UserMinus className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleReactivateCandidate(candidate.id, candidate.nome)}
                          disabled={loadingAction === candidate.id}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reativar candidato"
                        >
                          {loadingAction === candidate.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesList;