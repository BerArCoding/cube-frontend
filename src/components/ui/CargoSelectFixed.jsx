import React, { useState, useEffect, useCallback } from 'react';
import cargoService from '../../services/cargos.js';
import { ChevronDown, Plus } from 'lucide-react';

const CargoSelect = ({ 
  value = '', 
  onChange, 
  placeholder = 'Selecione um cargo...',
  className = '',
  allowCreate = true
}) => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOption, setShowCreateOption] = useState(false);

  const loadCargos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cargoService.getAllCargos();
      setCargos(response.data || []);
      setShowCreateOption(false);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      // Fallback para dados mock
      setCargos([
        { nome: 'Vereador', nivel: 'MUNICIPAL' },
        { nome: 'Prefeito', nivel: 'MUNICIPAL' },
        { nome: 'Deputado Estadual', nivel: 'ESTADUAL' },
        { nome: 'Deputado Federal', nivel: 'FEDERAL' },
        { nome: 'Senador', nivel: 'FEDERAL' },
        { nome: 'Governador', nivel: 'ESTADUAL' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCargos = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await cargoService.searchCargos(query);
      setCargos(response.data || []);
      
      // Mostrar opção de criar se não encontrar resultados exatos
      const exactMatch = response.data.some(cargo => 
        cargo.nome.toLowerCase() === query.toLowerCase()
      );
      setShowCreateOption(allowCreate && query.length > 2 && !exactMatch);
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      setCargos([]);
      setShowCreateOption(allowCreate && query.length > 2);
    } finally {
      setLoading(false);
    }
  }, [allowCreate]);

  // Carregar cargos ao montar o componente
  useEffect(() => {
    loadCargos();
  }, [loadCargos]);

  // Buscar cargos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm) {
      searchCargos(searchTerm);
    } else {
      loadCargos();
    }
  }, [searchTerm, searchCargos, loadCargos]);

  const handleSelect = (cargoNome) => {
    onChange(cargoNome);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const filteredCargos = searchTerm 
    ? cargos.filter(cargo => 
        cargo.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cargos;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay para permitir clique nas opções
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pr-10
            border-2 rounded-lg transition-all duration-200
            bg-white text-slate-700 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
            border-slate-200 hover:border-slate-300
            ${className}
          `}
        />
        <ChevronDown className={`
          absolute right-3 top-1/2 transform -translate-y-1/2 
          w-5 h-5 text-slate-400 transition-transform duration-200
          ${isOpen ? 'rotate-180' : ''}
        `} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : (
            <>
              {filteredCargos.length > 0 ? (
                <>
                  {filteredCargos.map((cargo, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(cargo.nome)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900">{cargo.nome}</span>
                      </div>
                    </button>
                  ))}
                </>
              ) : searchTerm ? (
                <div className="px-4 py-3 text-slate-500 text-center">
                  Nenhum cargo encontrado para "{searchTerm}"
                </div>
              ) : (
                <div className="px-4 py-3 text-slate-500 text-center">
                  Nenhum cargo disponível
                </div>
              )}

              {/* Opção de criar novo cargo */}
              {showCreateOption && (
                <button
                  onClick={handleCreateNew}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors border-t border-slate-100"
                >
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Plus className="w-4 h-4" />
                    <span>Criar "{searchTerm}"</span>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CargoSelect;
