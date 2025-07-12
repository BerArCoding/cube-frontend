import React, { useState, useEffect } from 'react';
import { Button, Input } from '../ui';
import cargoService from '../../services/cargos.js';
import { 
  User, 
  Image, 
  Briefcase, 
  MapPin, 
  Vote, 
  Target, 
  TrendingUp, 
  Instagram,
  Search
} from 'lucide-react';

const CandidateForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    foto: '',
    cargoAtual: '',
    redutoOrigem: '',
    votosUltimaEleicao: '',
    cargoPretendido: '',
    votosNecessarios: '',
    pontuacaoViabilidade: '',
    instagramHandle: ''
  });

  const [cargos, setCargos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [cargoSearch, setCargoSearch] = useState('');
  const [showCargoSuggestions, setShowCargoSuggestions] = useState(false);

  // Carregar dados iniciais quando for edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        foto: initialData.foto || '',
        cargoAtual: initialData.cargoAtual || '',
        redutoOrigem: initialData.redutoOrigem || '',
        votosUltimaEleicao: initialData.votosUltimaEleicao?.toString() || '',
        cargoPretendido: initialData.cargoPretendido || '',
        votosNecessarios: initialData.votosNecessarios?.toString() || '',
        pontuacaoViabilidade: initialData.pontuacaoViabilidade?.toString() || '',
        instagramHandle: initialData.instagramHandle || ''
      });
    }
  }, [initialData]);

  // Carregar cargos do banco
  useEffect(() => {
    const loadCargos = async () => {
      setLoadingCargos(true);
      try {
        const response = await cargoService.getAllCargos();
        setCargos(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        setCargos([]);
      } finally {
        setLoadingCargos(false);
      }
    };

    loadCargos();
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Para campos de cargo, mostrar sugestões
    if (field === 'cargoAtual' || field === 'cargoPretendido') {
      setCargoSearch(value);
      setShowCargoSuggestions(value.length > 0);
    }
  };

  const handleCargoSelect = (field, cargoNome) => {
    setFormData(prev => ({
      ...prev,
      [field]: cargoNome
    }));
    setShowCargoSuggestions(false);
    setCargoSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    // Preparar dados para envio
    const candidateData = {
      nome: formData.nome.trim(),
      foto: formData.foto.trim() || null,
      cargoAtual: formData.cargoAtual.trim() || null,
      redutoOrigem: formData.redutoOrigem.trim() || null,
      votosUltimaEleicao: formData.votosUltimaEleicao ? parseInt(formData.votosUltimaEleicao) : null,
      cargoPretendido: formData.cargoPretendido.trim() || null,
      votosNecessarios: formData.votosNecessarios ? parseInt(formData.votosNecessarios) : null,
      pontuacaoViabilidade: formData.pontuacaoViabilidade ? parseFloat(formData.pontuacaoViabilidade) : null,
      instagramHandle: formData.instagramHandle.trim() || null
    };

    await onSubmit(candidateData);
  };

  // Filtrar cargos para sugestões
  const filteredCargos = cargos.filter(cargo =>
    cargo.nome?.toLowerCase().includes(cargoSearch.toLowerCase())
  ).slice(0, 5);

  const renderCargoInput = (field, label, placeholder) => {
    const value = formData[field];
    const isSearching = (field === 'cargoAtual' || field === 'cargoPretendido') && 
                       showCargoSuggestions && 
                       cargoSearch === value;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange(field)}
            icon={Briefcase}
            onFocus={() => {
              if (field === 'cargoAtual' || field === 'cargoPretendido') {
                setCargoSearch(value);
                setShowCargoSuggestions(true);
              }
            }}
          />
          
          {/* Sugestões de cargos */}
          {isSearching && filteredCargos.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredCargos.map((cargo, index) => (
                <button
                  key={cargo.id || index}
                  type="button"
                  onClick={() => handleCargoSelect(field, cargo.nome)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center space-x-2"
                >
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{cargo.nome}</div>
                    {cargo.nivel && (
                      <div className="text-xs text-slate-500">{cargo.nivel}</div>
                    )}
                  </div>
                </button>
              ))}
              
              {/* Opção para criar novo cargo */}
              <button
                type="button"
                onClick={() => handleCargoSelect(field, cargoSearch)}
                className="w-full px-3 py-2 text-left hover:bg-orange-50 border-t border-slate-200 flex items-center space-x-2"
              >
                <Search className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium text-orange-900">
                    Usar "{cargoSearch}"
                  </div>
                  <div className="text-xs text-orange-600">Será criado automaticamente</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome - Obrigatório */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nome do Candidato *
        </label>
        <Input
          type="text"
          placeholder="Digite o nome completo"
          value={formData.nome}
          onChange={handleInputChange('nome')}
          icon={User}
          required
        />
      </div>

      {/* Foto URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          URL da Foto
        </label>
        <Input
          type="url"
          placeholder="https://exemplo.com/foto.jpg"
          value={formData.foto}
          onChange={handleInputChange('foto')}
          icon={Image}
        />
        {formData.foto && (
          <div className="mt-2">
            <img
              src={formData.foto}
              alt="Preview"
              className="h-16 w-16 object-cover rounded-lg border border-slate-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Cargo Atual */}
      {renderCargoInput('cargoAtual', 'Cargo Atual', 'Ex: Vereador, Deputado...')}

      {/* Reduto de Origem */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Reduto de Origem
        </label>
        <Input
          type="text"
          placeholder="Ex: São Paulo - SP, Rio de Janeiro - RJ..."
          value={formData.redutoOrigem}
          onChange={handleInputChange('redutoOrigem')}
          icon={MapPin}
        />
      </div>

      {/* Grid com 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Votos Última Eleição */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Votos Última Eleição
          </label>
          <Input
            type="number"
            placeholder="Ex: 15000"
            value={formData.votosUltimaEleicao}
            onChange={handleInputChange('votosUltimaEleicao')}
            icon={Vote}
            min="0"
          />
        </div>

        {/* Votos Necessários */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Votos Necessários
          </label>
          <Input
            type="number"
            placeholder="Ex: 25000"
            value={formData.votosNecessarios}
            onChange={handleInputChange('votosNecessarios')}
            icon={Target}
            min="0"
          />
        </div>
      </div>

      {/* Cargo Pretendido */}
      {renderCargoInput('cargoPretendido', 'Cargo Pretendido', 'Digite o cargo pretendido...')}

      {/* Grid com 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pontuação Viabilidade */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Pontuação de Viabilidade (0-10)
          </label>
          <Input
            type="number"
            placeholder="Ex: 7.5"
            value={formData.pontuacaoViabilidade}
            onChange={handleInputChange('pontuacaoViabilidade')}
            icon={TrendingUp}
            min="0"
            max="10"
            step="0.1"
          />
        </div>

        {/* Instagram Handle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Instagram
          </label>
          <Input
            type="text"
            placeholder="@usuario ou usuario"
            value={formData.instagramHandle}
            onChange={handleInputChange('instagramHandle')}
            icon={Instagram}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {initialData ? 'Atualizar Candidato' : 'Cadastrar Candidato'}
        </Button>
      </div>

      {/* Loading de cargos */}
      {loadingCargos && (
        <div className="text-xs text-slate-500 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500 mr-1"></div>
          Carregando cargos do banco...
        </div>
      )}
    </form>
  );
};

export default CandidateForm;