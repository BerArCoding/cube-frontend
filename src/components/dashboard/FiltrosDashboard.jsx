import { useState, useEffect, useRef } from 'react';
import { Filter, Users, Briefcase, X, Search, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FiltrosDashboard = ({ onFiltroChange }) => {
  const [filtros, setFiltros] = useState({
    candidatoIds: [],
    cargoIds: []
  });
  const [opcoes, setOpcoes] = useState({
    candidatos: [],
    cargos: []
  });
  const [loading, setLoading] = useState(true);
  const [buscaCandidatos, setBuscaCandidatos] = useState('');
  const [buscaCargos, setBuscaCargos] = useState('');
  const [dropdownAberto, setDropdownAberto] = useState({ candidatos: false, cargos: false });
  
  const candidatosRef = useRef(null);
  const cargosRef = useRef(null);

  useEffect(() => {
    carregarOpcoesFiltros();
  }, []);

  const carregarOpcoesFiltros = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/filtros`);
      const result = await response.json();
      
      if (result.sucesso) {
        setOpcoes(result.dados);
        
        // Iniciar com todos selecionados
        const todosCandidatos = result.dados.candidatos.map(c => c.id);
        const todosCargos = result.dados.cargos.map(c => c.id);
        
        const filtrosIniciais = {
          candidatoIds: todosCandidatos,
          cargoIds: todosCargos
        };
        
        setFiltros(filtrosIniciais);
        onFiltroChange(filtrosIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        candidatosRef.current && !candidatosRef.current.contains(event.target) &&
        cargosRef.current && !cargosRef.current.contains(event.target)
      ) {
        setDropdownAberto({ candidatos: false, cargos: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCandidato = (candidatoId) => {
    const isSelected = filtros.candidatoIds.includes(candidatoId);
    const novosFiltros = {
      ...filtros,
      candidatoIds: isSelected 
        ? filtros.candidatoIds.filter(id => id !== candidatoId)
        : [...filtros.candidatoIds, candidatoId]
    };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const toggleCargo = (cargoId) => {
    const isSelected = filtros.cargoIds.includes(cargoId);
    const novosFiltros = {
      ...filtros,
      cargoIds: isSelected 
        ? filtros.cargoIds.filter(id => id !== cargoId)
        : [...filtros.cargoIds, cargoId]
    };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const removerCandidato = (candidatoId) => {
    const novosFiltros = {
      ...filtros,
      candidatoIds: filtros.candidatoIds.filter(id => id !== candidatoId)
    };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const removerCargo = (cargoId) => {
    const novosFiltros = {
      ...filtros,
      cargoIds: filtros.cargoIds.filter(id => id !== cargoId)
    };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const selecionarTodosCandidatos = () => {
    const todosCandidatos = opcoes.candidatos.map(c => c.id);
    const novosFiltros = { ...filtros, candidatoIds: todosCandidatos };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const limparCandidatos = () => {
    const novosFiltros = { ...filtros, candidatoIds: [] };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const selecionarTodosCargos = () => {
    const todosCargos = opcoes.cargos.map(c => c.id);
    const novosFiltros = { ...filtros, cargoIds: todosCargos };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const limparCargos = () => {
    const novosFiltros = { ...filtros, cargoIds: [] };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  // Filtrar candidatos pela busca
  const candidatosFiltrados = opcoes.candidatos.filter(candidato =>
    candidato.nome.toLowerCase().includes(buscaCandidatos.toLowerCase()) ||
    candidato.cargo?.nome.toLowerCase().includes(buscaCandidatos.toLowerCase())
  );

  // Filtrar cargos pela busca
  const cargosFiltrados = opcoes.cargos.filter(cargo =>
    cargo.nome.toLowerCase().includes(buscaCargos.toLowerCase()) ||
    cargo.nivel.toLowerCase().includes(buscaCargos.toLowerCase())
  );

  // Obter dados dos selecionados
  const candidatosSelecionados = opcoes.candidatos.filter(c => 
    filtros.candidatoIds.includes(c.id)
  );
  const cargosSelecionados = opcoes.cargos.filter(c => 
    filtros.cargoIds.includes(c.id)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="animate-pulse flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Carregando filtros...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-[#FF943A]" />
        <h3 className="text-lg font-semibold text-slate-700">Filtros</h3>
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">
          {filtros.candidatoIds.length} candidatos, {filtros.cargoIds.length} cargos
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filtro Candidatos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">
                Candidatos ({candidatosSelecionados.length}/{opcoes.candidatos.length})
              </span>
            </label>
            <div className="flex space-x-2">
              <button
                onClick={selecionarTodosCandidatos}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Todos
              </button>
              <button
                onClick={limparCandidatos}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Tags dos Selecionados */}
          {candidatosSelecionados.length > 0 && (
            <div className="flex flex-wrap gap-2 h-16 overflow-y-auto p-2 bg-slate-50 rounded-lg">
              {candidatosSelecionados.map(candidato => (
                <span
                  key={candidato.id}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full h-fit"
                >
                  {candidato.nome}
                  <button
                    onClick={() => removerCandidato(candidato.id)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown Candidatos - STYLE SELECT2 */}
          <div className="relative" ref={candidatosRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar candidatos..."
                value={buscaCandidatos}
                onChange={(e) => setBuscaCandidatos(e.target.value)}
                onFocus={() => setDropdownAberto({ ...dropdownAberto, candidatos: true })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF943A] focus:border-[#FF943A] transition-colors"
              />
            </div>

            {dropdownAberto.candidatos && (
              <div 
                className="absolute w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
                style={{ zIndex: 1000 }}
              >
                {candidatosFiltrados.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Nenhum candidato encontrado
                  </div>
                ) : (
                  candidatosFiltrados.map(candidato => (
                    <div
                      key={candidato.id}
                      onClick={() => toggleCandidato(candidato.id)}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-center w-4 h-4">
                        {filtros.candidatoIds.includes(candidato.id) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {candidato.nome}
                        </div>
                        {candidato.cargo && (
                          <div className="text-xs text-slate-500">
                            {candidato.cargo.nome} ({candidato.cargo.nivel})
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filtro Cargos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-slate-700">
                Cargos ({cargosSelecionados.length}/{opcoes.cargos.length})
              </span>
            </label>
            <div className="flex space-x-2">
              <button
                onClick={selecionarTodosCargos}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Todos
              </button>
              <button
                onClick={limparCargos}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Tags dos Selecionados */}
          {cargosSelecionados.length > 0 && (
            <div className="flex flex-wrap gap-2 h-16 overflow-y-auto p-2 bg-slate-50 rounded-lg">
              {cargosSelecionados.map(cargo => (
                <span
                  key={cargo.id}
                  className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full h-fit"
                >
                  {cargo.nome}
                  <button
                    onClick={() => removerCargo(cargo.id)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown Cargos - STYLE SELECT2 */}
          <div className="relative" ref={cargosRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cargos..."
                value={buscaCargos}
                onChange={(e) => setBuscaCargos(e.target.value)}
                onFocus={() => setDropdownAberto({ ...dropdownAberto, cargos: true })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF943A] focus:border-[#FF943A] transition-colors"
              />
            </div>

            {dropdownAberto.cargos && (
              <div 
                className="absolute w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
                style={{ zIndex: 1000 }}
              >
                {cargosFiltrados.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Nenhum cargo encontrado
                  </div>
                ) : (
                  cargosFiltrados.map(cargo => (
                    <div
                      key={cargo.id}
                      onClick={() => toggleCargo(cargo.id)}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-center w-4 h-4">
                        {filtros.cargoIds.includes(cargo.id) && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {cargo.nome}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cargo.nivel}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo dos Filtros Aplicados */}
      {(filtros.candidatoIds.length > 0 || filtros.cargoIds.length > 0) && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600 mb-2">Filtros aplicados:</div>
          <div className="flex flex-wrap gap-2">
            {filtros.candidatoIds.length === opcoes.candidatos.length ? (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                ✓ Todos os candidatos
              </span>
            ) : filtros.candidatoIds.length > 0 && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {filtros.candidatoIds.length} candidato{filtros.candidatoIds.length > 1 ? 's' : ''}
              </span>
            )}
            
            {filtros.cargoIds.length === opcoes.cargos.length ? (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                ✓ Todos os cargos
              </span>
            ) : filtros.cargoIds.length > 0 && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                {filtros.cargoIds.length} cargo{filtros.cargoIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosDashboard;