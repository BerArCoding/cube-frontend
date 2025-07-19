import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDebounce } from '../../hooks';
import cargoService from '../../services/cargos.js';
import { Search, Plus, ChevronDown } from 'lucide-react';

const CargoAutoComplete = ({ 
  value = '', 
  onChange, 
  placeholder = 'Digite para buscar cargos...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce para evitar muitas chamadas de API
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Lista de cargos padrão para fallback rápido
  const defaultCargos = useMemo(() => [
    'Deputado Federal',
    'Deputado Estadual', 
    'Senador',
    'Vereador',
    'Prefeito',
    'Governador',
    'Presidente',
    'Vice-Prefeito',
    'Vice-Governador',
    'Vice-Presidente'
  ], []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar sugestões quando o valor com debounce muda
  useEffect(() => {
    if (!debouncedInputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchCargos = async () => {
      setLoading(true);
      try {
        const response = await cargoService.searchCargos(debouncedInputValue);
        setSuggestions(response.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Erro ao buscar cargos:', error);
        // Fallback para busca local
        const filtered = defaultCargos.filter(cargo => 
          cargo.toLowerCase().includes(debouncedInputValue.toLowerCase())
        );
        
        const exactMatch = filtered.find(cargo => 
          cargo.toLowerCase() === debouncedInputValue.toLowerCase()
        );

        if (!exactMatch && debouncedInputValue.trim()) {
          filtered.push(`${debouncedInputValue} (Novo)`);
        }

        setSuggestions(filtered);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    };

    searchCargos();
  }, [debouncedInputValue, defaultCargos]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectSuggestion = (suggestion) => {
    const cleanSuggestion = suggestion.replace(' (Novo)', '');
    setInputValue(cleanSuggestion);
    onChange(cleanSuggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (inputValue.trim() && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200"
        />
        
        {/* Ícone de busca */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        
        {/* Loading ou dropdown icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          ) : (
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          )}
        </div>
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                suggestion.includes('(Novo)') 
                  ? 'text-orange-600 font-medium bg-orange-50' 
                  : 'text-slate-700'
              }`}
            >
              <span>{suggestion}</span>
              {suggestion.includes('(Novo)') && (
                <Plus className="h-4 w-4 text-orange-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Indicador de novo cargo */}
      {inputValue && !suggestions.find(s => s.toLowerCase() === inputValue.toLowerCase()) && inputValue.trim() && (
        <p className="mt-2 text-sm text-orange-600 flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>Novo cargo será criado: "{inputValue}"</span>
        </p>
      )}
    </div>
  );
};

export default CargoAutoComplete;
