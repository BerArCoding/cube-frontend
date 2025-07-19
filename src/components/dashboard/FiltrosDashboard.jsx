// components/dashboard/FiltrosDashboard.jsx - VERSÃO DEFINITIVA
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Filter, Users, Briefcase, Check, ChevronDown } from 'lucide-react';

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
  const [dropdownAberto, setDropdownAberto] = useState({ candidatos: false, cargos: false });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Refs para os botões dos dropdowns
  const candidatosButtonRef = useRef(null);
  const cargosButtonRef = useRef(null);

  useEffect(() => {
    carregarOpcoesFiltros();
  }, []);

  const carregarOpcoesFiltros = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/dashboard/filtros');
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

  const abrirDropdown = (tipo) => {
    const buttonRef = tipo === 'candidatos' ? candidatosButtonRef : cargosButtonRef;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      // ✅ MELHORAR - Verificar se há espaço suficiente embaixo
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 256; // max-h-64 = 16rem = 256px
      const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      
      setDropdownPosition({
        top: shouldOpenUpward 
          ? rect.top + window.scrollY - dropdownHeight - 4 
          : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setDropdownAberto({ candidatos: false, cargos: false, [tipo]: true });
  };

  const toggleCandidato = (candidatoId, event) => {
    // ✅ Prevenir propagação do evento
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (candidatoId === 'todos') {
      const todosCandidatos = opcoes.candidatos.map(c => c.id);
      const todosSelecionados = filtros.candidatoIds.length === todosCandidatos.length;
      const novosFiltros = { 
        ...filtros, 
        candidatoIds: todosSelecionados ? [] : todosCandidatos 
      };
      setFiltros(novosFiltros);
      onFiltroChange(novosFiltros);
      return;
    }

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

  const toggleCargo = (cargoId, event) => {
    // ✅ Prevenir propagação do evento
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (cargoId === 'todos') {
      const todosCargos = opcoes.cargos.map(c => c.id);
      const todosSelecionados = filtros.cargoIds.length === todosCargos.length;
      const novosFiltros = { 
        ...filtros, 
        cargoIds: todosSelecionados ? [] : todosCargos 
      };
      setFiltros(novosFiltros);
      onFiltroChange(novosFiltros);
      return;
    }

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

  // Fechar dropdown quando clicar fora OU quando rolar a página
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar se clicou em algum dos botões
      const clicouNoCandidatos = candidatosButtonRef.current?.contains(event.target);
      const clicouNosCargos = cargosButtonRef.current?.contains(event.target);
      
      // Verificar se clicou dentro do dropdown
      const clicouNoDropdown = event.target.closest('.dropdown-portal');
      
      if (!clicouNoCandidatos && !clicouNosCargos && !clicouNoDropdown) {
        setDropdownAberto({ candidatos: false, cargos: false });
      }
    };

    // ✅ CORRIGIR - Só fechar se o scroll NÃO for dentro do dropdown
    const handleScroll = (event) => {
      // Verificar se o scroll está acontecendo dentro do dropdown
      const scrollDentroDoDropdown = event.target.closest('.dropdown-portal');
      
      // Só fechar se o scroll não for dentro do dropdown
      if (!scrollDentroDoDropdown) {
        setDropdownAberto({ candidatos: false, cargos: false });
      }
    };

    // ✅ NOVO - Fechar dropdown quando redimensionar a janela
    const handleResize = () => {
      setDropdownAberto({ candidatos: false, cargos: false });
    };

    // Adicionar listeners apenas se algum dropdown estiver aberto
    if (dropdownAberto.candidatos || dropdownAberto.cargos) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // true = capture phase
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [dropdownAberto]);

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

  const todosCandidatosSelecionados = filtros.candidatoIds.length === opcoes.candidatos.length;
  const todosCargosSelecionados = filtros.cargoIds.length === opcoes.cargos.length;

  // Componente Dropdown Portal com posição relativa ao botão
  const DropdownPortal = ({ isOpen, children, tipo }) => {
    if (!isOpen) return null;

    const buttonRef = tipo === 'candidatos' ? candidatosButtonRef : cargosButtonRef;
    
    return createPortal(
      <div
        className="dropdown-portal absolute bg-white border border-slate-300 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'fixed' // Manter fixo mas fechar no scroll
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      {/* Header dos Filtros */}
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-[#FF943A]" />
        <h3 className="text-lg font-semibold text-slate-700">Filtros</h3>
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">
          {filtros.candidatoIds.length} candidatos, {filtros.cargoIds.length} cargos
        </span>
      </div>

      {/* Dropdowns Customizados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dropdown Candidatos */}
        <div className="relative">
          <label className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">Candidatos</span>
          </label>
          
          <button
            ref={candidatosButtonRef}
            onClick={() => abrirDropdown('candidatos')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-left text-sm hover:border-slate-400 focus:ring-2 focus:ring-[#FF943A] focus:border-[#FF943A] transition-colors flex items-center justify-between"
          >
            <span>
              {todosCandidatosSelecionados ? 
                'Todos os candidatos selecionados' : 
                `${filtros.candidatoIds.length} candidatos selecionados`
              }
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownAberto.candidatos ? 'rotate-180' : ''}`} />
          </button>

          <DropdownPortal isOpen={dropdownAberto.candidatos} tipo="candidatos">
            <div
              onClick={(e) => toggleCandidato('todos', e)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center justify-center w-4 h-4">
                {todosCandidatosSelecionados && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <span className="text-sm font-semibold text-blue-600">
                Todos os candidatos ({opcoes.candidatos.length})
              </span>
            </div>
            
            {opcoes.candidatos.map((candidato) => (
              <div
                key={candidato.id}
                onClick={(e) => toggleCandidato(candidato.id, e)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4">
                  {filtros.candidatoIds.includes(candidato.id) && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <span className="text-sm flex-1">{candidato.nome}</span>
                {candidato.cargo && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {candidato.cargo.nome}
                  </span>
                )}
              </div>
            ))}
          </DropdownPortal>
        </div>

        {/* Dropdown Cargos */}
        <div className="relative">
          <label className="flex items-center space-x-2 mb-2">
            <Briefcase className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-slate-700">Cargos</span>
          </label>
          
          <button
            ref={cargosButtonRef}
            onClick={() => abrirDropdown('cargos')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-left text-sm hover:border-slate-400 focus:ring-2 focus:ring-[#FF943A] focus:border-[#FF943A] transition-colors flex items-center justify-between"
          >
            <span>
              {todosCargosSelecionados ? 
                'Todos os cargos selecionados' : 
                `${filtros.cargoIds.length} cargos selecionados`
              }
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownAberto.cargos ? 'rotate-180' : ''}`} />
          </button>

          <DropdownPortal isOpen={dropdownAberto.cargos} tipo="cargos">
            <div
              onClick={(e) => toggleCargo('todos', e)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center justify-center w-4 h-4">
                {todosCargosSelecionados && <Check className="w-4 h-4 text-green-600" />}
              </div>
              <span className="text-sm font-semibold text-green-600">
                Todos os cargos ({opcoes.cargos.length})
              </span>
            </div>
            
            {opcoes.cargos.map((cargo) => (
              <div
                key={cargo.id}
                onClick={(e) => toggleCargo(cargo.id, e)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4">
                  {filtros.cargoIds.includes(cargo.id) && <Check className="w-4 h-4 text-green-600" />}
                </div>
                <span className="text-sm flex-1">{cargo.nome}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {cargo.nivel}
                </span>
              </div>
            ))}
          </DropdownPortal>
        </div>
      </div>

      {/* Resumo Visual dos Filtros */}
      <div className="mt-4 pt-4 border-t border-slate-200">
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
    </div>
  );
};

export default FiltrosDashboard;