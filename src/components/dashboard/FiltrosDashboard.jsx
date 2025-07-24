import { useState, useEffect, useRef } from 'react';
import { Filter, Users, Briefcase, X, Search, Check, MapPin, Award, Building, Target } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FiltrosDashboard = ({ onFiltroChange }) => {
  const [filtros, setFiltros] = useState({
    candidatoIds: [],
    cargoIds: [],
    cargoPretendidoIds: [],
    mandatos: [],
    redutosOrigem: [],
    macrorregiaoIds: []
  });
  const [opcoes, setOpcoes] = useState({
    candidatos: [],
    cargos: [],
    cargosPretendidos: [],
    mandatos: [],
    redutosOrigem: [],
    macrorregioes: []
  });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState({
    candidatos: '',
    cargos: '',
    cargosPretendidos: '',
    mandatos: '',
    redutosOrigem: '',
    macrorregioes: ''
  });
  const [dropdownAberto, setDropdownAberto] = useState({
    candidatos: false,
    cargos: false,
    cargosPretendidos: false,
    mandatos: false,
    redutosOrigem: false,
    macrorregioes: false
  });
  
  const refs = {
    candidatos: useRef(null),
    cargos: useRef(null),
    cargosPretendidos: useRef(null),
    mandatos: useRef(null),
    redutosOrigem: useRef(null),
    macrorregioes: useRef(null)
  };

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
        const todosCargosPretendidos = result.dados.cargosPretendidos.map(c => c.id);
        const todosMandatos = result.dados.mandatos || [];
        const todosRedutos = result.dados.redutosOrigem || [];
        const todasMacrorregioes = result.dados.macrorregioes.map(m => m.id);
        
        const filtrosIniciais = {
          candidatoIds: todosCandidatos,
          cargoIds: todosCargos,
          cargoPretendidoIds: todosCargosPretendidos,
          mandatos: todosMandatos,
          redutosOrigem: todosRedutos,
          macrorregiaoIds: todasMacrorregioes
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar se o clique foi fora de TODOS os dropdowns
      const clickedOutsideAll = Object.entries(refs).every(([tipo, ref]) => {
        const container = ref.current;
        if (!container) return true;
        
        // Verificar se clicou dentro do container do dropdown (incluindo input e lista)
        return !container.contains(event.target);
      });
      
      if (clickedOutsideAll) {
        setDropdownAberto({
          candidatos: false,
          cargos: false,
          cargosPretendidos: false,
          mandatos: false,
          redutosOrigem: false,
          macrorregioes: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFiltros = (newFiltros) => {
    setFiltros(newFiltros);
    onFiltroChange(newFiltros);
  };

  const toggleItem = (tipo, itemId) => {
    const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                     tipo === 'cargos' ? 'cargoIds' :
                     tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                     tipo === 'mandatos' ? 'mandatos' :
                     tipo === 'redutosOrigem' ? 'redutosOrigem' :
                     'macrorregiaoIds';
    
    const isSelected = filtros[campoArray].includes(itemId);
    const novosFiltros = {
      ...filtros,
      [campoArray]: isSelected 
        ? filtros[campoArray].filter(id => id !== itemId)
        : [...filtros[campoArray], itemId]
    };
    updateFiltros(novosFiltros);
  };

  const removerItem = (tipo, itemId) => {
    const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                     tipo === 'cargos' ? 'cargoIds' :
                     tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                     tipo === 'mandatos' ? 'mandatos' :
                     tipo === 'redutosOrigem' ? 'redutosOrigem' :
                     'macrorregiaoIds';
    
    const novosFiltros = {
      ...filtros,
      [campoArray]: filtros[campoArray].filter(id => id !== itemId)
    };
    updateFiltros(novosFiltros);
  };

  const selecionarTodos = (tipo) => {
    const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                     tipo === 'cargos' ? 'cargoIds' :
                     tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                     tipo === 'mandatos' ? 'mandatos' :
                     tipo === 'redutosOrigem' ? 'redutosOrigem' :
                     'macrorregiaoIds';
    
    let todosIds = [];
    
    if (tipo === 'mandatos') {
      todosIds = [...opcoes.mandatos];
    } else if (tipo === 'redutosOrigem') {
      todosIds = [...opcoes.redutosOrigem];
    } else {
      todosIds = opcoes[tipo].map(item => item.id);
    }
    
    const novosFiltros = { ...filtros, [campoArray]: todosIds };
    updateFiltros(novosFiltros);
  };

  const limpar = (tipo) => {
    const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                     tipo === 'cargos' ? 'cargoIds' :
                     tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                     tipo === 'mandatos' ? 'mandatos' :
                     tipo === 'redutosOrigem' ? 'redutosOrigem' :
                     'macrorregiaoIds';
    
    const novosFiltros = { ...filtros, [campoArray]: [] };
    updateFiltros(novosFiltros);
  };

  // Função para filtrar itens pela busca
  const filtrarItens = (tipo, termoBusca) => {
    if (tipo === 'mandatos') {
      return opcoes.mandatos.filter(mandato =>
        mandato.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    if (tipo === 'redutosOrigem') {
      return opcoes.redutosOrigem.filter(reduto =>
        reduto.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    
    return opcoes[tipo].filter(item => {
      const searchText = termoBusca.toLowerCase();
      if (tipo === 'candidatos') {
        return item.nome.toLowerCase().includes(searchText) ||
               item.cargo?.nome.toLowerCase().includes(searchText);
      }
      return item.nome.toLowerCase().includes(searchText) ||
             (item.nivel && item.nivel.toLowerCase().includes(searchText));
    });
  };

  // Obter dados dos selecionados
  const getSelecionados = (tipo) => {
    const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                     tipo === 'cargos' ? 'cargoIds' :
                     tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                     tipo === 'mandatos' ? 'mandatos' :
                     tipo === 'redutosOrigem' ? 'redutosOrigem' :
                     'macrorregiaoIds';
    
    if (tipo === 'mandatos') {
      return opcoes.mandatos.filter(mandato => filtros[campoArray].includes(mandato));
    }
    if (tipo === 'redutosOrigem') {
      return opcoes.redutosOrigem.filter(reduto => filtros[campoArray].includes(reduto));
    }
    
    return opcoes[tipo].filter(item => filtros[campoArray].includes(item.id));
  };

  const FiltroDropdown = ({ tipo, label, icon: IconComponent, color, placeholder }) => {
    const selecionados = getSelecionados(tipo);
    const itensFiltrados = filtrarItens(tipo, busca[tipo]);
    const totalOpcoes = tipo === 'mandatos' || tipo === 'redutosOrigem' ? opcoes[tipo].length : opcoes[tipo].length;
    const inputId = `filtro-${tipo}`;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="flex items-center space-x-2">
            <IconComponent className={`w-4 h-4 ${color}`} />
            <span className="text-sm font-semibold text-slate-700">
              {label} ({selecionados.length}/{totalOpcoes})
            </span>
          </label>
          <div className="flex space-x-2">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selecionarTodos(tipo);
              }}
              className={`text-xs ${color} hover:opacity-80 font-medium`}
            >
              Todos
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); 
                limpar(tipo);
              }}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Tags dos Selecionados */}
        {selecionados.length > 0 && (
          <div className="flex flex-wrap gap-2 h-16 overflow-y-auto p-2 bg-slate-50 rounded-lg">
            {selecionados.map(item => {
              const nome = typeof item === 'string' ? item : item.nome;
              const id = typeof item === 'string' ? item : item.id;
              const colorClass = color.replace('text-', 'bg-').replace('500', '100');
              const textColorClass = color.replace('text-', 'text-').replace('500', '800');
              
              return (
                <span
                  key={id}
                  className={`inline-flex items-center ${colorClass} ${textColorClass} text-xs px-2 py-1 rounded-full h-fit`}
                >
                  {nome}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removerItem(tipo, id);
                    }}
                    className="ml-1 hover:bg-opacity-20 hover:bg-black rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Dropdown */}
        <div className="relative" ref={refs[tipo]}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id={inputId}
              name={inputId}
              type="text"
              placeholder={placeholder}
              value={busca[tipo]}
              onChange={(e) => setBusca({ ...busca, [tipo]: e.target.value })}
              onFocus={() => setDropdownAberto(prev => ({ ...prev, [tipo]: true }))}
              onClick={() => setDropdownAberto(prev => ({ ...prev, [tipo]: true }))}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF943A] focus:border-[#FF943A] transition-colors"
            />
          </div>

          {dropdownAberto[tipo] && (
            <div 
              className="absolute w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
              style={{ zIndex: 1000 }}
            >
              {itensFiltrados.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  Nenhum item encontrado
                </div>
              ) : (
                itensFiltrados.map(item => {
                  const nome = typeof item === 'string' ? item : item.nome;
                  const id = typeof item === 'string' ? item : item.id;
                  const subtitle = typeof item === 'object' ? 
                    (item.nivel || (item.cargo && `${item.cargo.nome} (${item.cargo.nivel})`)) : null;
                  
                  const campoArray = tipo === 'candidatos' ? 'candidatoIds' :
                                   tipo === 'cargos' ? 'cargoIds' :
                                   tipo === 'cargosPretendidos' ? 'cargoPretendidoIds' :
                                   tipo === 'mandatos' ? 'mandatos' :
                                   tipo === 'redutosOrigem' ? 'redutosOrigem' :
                                   'macrorregiaoIds';
                  
                  const isSelected = filtros[campoArray].includes(id);
                  
                  return (
                    <div
                      key={id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleItem(tipo, id);
                      }}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-center w-4 h-4">
                        {isSelected && (
                          <Check className={`w-4 h-4 ${color}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {nome}
                        </div>
                        {subtitle && (
                          <div className="text-xs text-slate-500">
                            {subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {filtros.candidatoIds.length} candidatos, {filtros.cargoIds.length} cargos, {filtros.macrorregiaoIds.length} regiões
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtro Candidatos */}
        <FiltroDropdown
          tipo="candidatos"
          label="Candidatos"
          icon={Users}
          color="text-blue-500"
          placeholder="Buscar candidatos..."
        />

        {/* Filtro Cargos */}
        <FiltroDropdown
          tipo="cargos"
          label="Cargos Atuais"
          icon={Briefcase}
          color="text-green-500"
          placeholder="Buscar cargos..."
        />

        {/* Filtro Cargos Pretendidos */}
        <FiltroDropdown
          tipo="cargosPretendidos"
          label="Cargos Pretendidos"
          icon={Target}
          color="text-purple-500"
          placeholder="Buscar cargos pretendidos..."
        />

        {/* Filtro Mandatos */}
        <FiltroDropdown
          tipo="mandatos"
          label="Mandatos"
          icon={Award}
          color="text-orange-500"
          placeholder="Buscar mandatos..."
        />

        {/* Filtro Redutos de Origem */}
        <FiltroDropdown
          tipo="redutosOrigem"
          label="Redutos de Origem"
          icon={Building}
          color="text-red-500"
          placeholder="Buscar redutos..."
        />

        {/* Filtro Macrorregiões */}
        <FiltroDropdown
          tipo="macrorregioes"
          label="Macrorregiões"
          icon={MapPin}
          color="text-indigo-500"
          placeholder="Buscar macrorregiões..."
        />
      </div>

      {/* Resumo dos Filtros Aplicados */}
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

          {filtros.cargoPretendidoIds.length === opcoes.cargosPretendidos.length ? (
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
              ✓ Todos os cargos pretendidos
            </span>
          ) : filtros.cargoPretendidoIds.length > 0 && (
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
              {filtros.cargoPretendidoIds.length} cargo{filtros.cargoPretendidoIds.length > 1 ? 's' : ''} pretendido{filtros.cargoPretendidoIds.length > 1 ? 's' : ''}
            </span>
          )}

          {filtros.mandatos.length === opcoes.mandatos.length ? (
            <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
              ✓ Todos os mandatos
            </span>
          ) : filtros.mandatos.length > 0 && (
            <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
              {filtros.mandatos.length} mandato{filtros.mandatos.length > 1 ? 's' : ''}
            </span>
          )}

          {filtros.redutosOrigem.length === opcoes.redutosOrigem.length ? (
            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
              ✓ Todos os redutos
            </span>
          ) : filtros.redutosOrigem.length > 0 && (
            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
              {filtros.redutosOrigem.length} reduto{filtros.redutosOrigem.length > 1 ? 's' : ''}
            </span>
          )}

          {filtros.macrorregiaoIds.length === opcoes.macrorregioes.length ? (
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
              ✓ Todas as macrorregiões
            </span>
          ) : filtros.macrorregiaoIds.length > 0 && (
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
              {filtros.macrorregiaoIds.length} macrorregião{filtros.macrorregiaoIds.length > 1 ? 'ões' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltrosDashboard;