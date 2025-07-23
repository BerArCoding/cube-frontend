import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from '../ui';
import { 
  User, 
  Image, 
  Briefcase, 
  MapPin, 
  Vote,
  Instagram,
  Building,
  Users,
  ChevronDown,
  Search,
  X
} from 'lucide-react';

const CandidateForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    foto: '',
    cargoId: '',
    macrorregiaoId: '',
    redutoOrigem: '',
    votosUltimaEleicao: '',
    populacaoCidade: '',
    votosValidos: '',
    cargoPretendidoId: '',
    instagramHandle: '',
    observacoes: '',
    mandato: ''
  });

  const [cargos, setCargos] = useState([]);
  const [macrorregioes, setMacrorregioes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Estados para os selects customizados
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [cargoSearch, setCargoSearch] = useState('');
  const [macrorregiaoDropdownOpen, setMacrorregiaoDropdownOpen] = useState(false);
  const [macrorregiaoSearch, setMacrorregiaoSearch] = useState('');
  const [cargoPretendidoDropdownOpen, setCargoPretendidoDropdownOpen] = useState(false);
  const [cargoPretendidoSearch, setCargoPretendidoSearch] = useState('');

  // Refs para os dropdowns
  const cargoDropdownRef = useRef(null);
  const macrorregiaoDropdownRef = useRef(null);
  const cargoPretendidoDropdownRef = useRef(null);

  // Carregar dados iniciais quando for edição
  useEffect(() => {
    if (initialData) {
      
      setFormData({
        nome: initialData.nome || '',
        foto: initialData.foto || '',
        cargoId: initialData.cargoId || '',
        macrorregiaoId: initialData.macrorregiaoId || '',
        redutoOrigem: initialData.redutoOrigem || '',
        votosUltimaEleicao: initialData.votosUltimaEleicao?.toString() || '',
        populacaoCidade: initialData.populacaoCidade?.toString() || '',
        votosValidos: initialData.votosValidos?.toString() || '',
        cargoPretendidoId: initialData.cargoPretendidoId || '',
        instagramHandle: initialData.instagramHandle || '',
        observacoes: initialData.observacoes || '',
        mandato: initialData.mandato || ''
      });
    }
  }, [initialData]);

  // Função para fazer requests diretas
  const makeRequest = async (url) => {
    const token = localStorage.getItem('cube_token');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Carregar cargos e macrorregiões
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      
      try {
        console.log('🔄 Iniciando carregamento de opções...');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        const [cargosResponse, macrorregiaoResponse] = await Promise.all([
          makeRequest(`${API_URL}/api/cargos`),
          makeRequest(`${API_URL}/api/macrorregioes`)
        ]);

        console.log('📊 Resposta cargos:', cargosResponse);
        console.log('🗺️ Resposta macrorregiões:', macrorregiaoResponse);

        if (cargosResponse.success && Array.isArray(cargosResponse.data)) {
          setCargos(cargosResponse.data);
          console.log('✅ Cargos carregados:', cargosResponse.data.length);
        } else {
          console.error('❌ Estrutura inválida dos cargos:', cargosResponse);
          setCargos([]);
        }

        if (macrorregiaoResponse.success && Array.isArray(macrorregiaoResponse.data)) {
          setMacrorregioes(macrorregiaoResponse.data);
          console.log('✅ Macrorregiões carregadas:', macrorregiaoResponse.data.length);
        } else {
          console.error('❌ Estrutura inválida das macrorregiões:', macrorregiaoResponse);
          setMacrorregioes([]);
        }

      } catch (error) {
        console.error('❌ Erro ao carregar opções:', error);
        
        // Fallback com dados mock
        console.log('🔄 Usando dados mock...');
        setCargos([
          { id: '1', nome: 'Vereador', nivel: 'MUNICIPAL', descricao: 'Membro da Câmara Municipal' },
          { id: '2', nome: 'Prefeito', nivel: 'MUNICIPAL', descricao: 'Chefe do Poder Executivo Municipal' },
          { id: '3', nome: 'Deputado Estadual', nivel: 'ESTADUAL', descricao: 'Membro da Assembleia Legislativa' },
          { id: '4', nome: 'Deputado Federal', nivel: 'FEDERAL', descricao: 'Membro da Câmara dos Deputados' },
          { id: '5', nome: 'Senador', nivel: 'FEDERAL', descricao: 'Membro do Senado Federal' },
          { id: '6', nome: 'Governador', nivel: 'ESTADUAL', descricao: 'Chefe do Poder Executivo Estadual' }
        ]);
        
        setMacrorregioes([
          { id: '1', nome: 'Noroeste' },
          { id: '2', nome: 'Norte' },
          { id: '3', nome: 'Centro e Centro-Sul' },
          { id: '4', nome: 'Oeste' },
          { id: '5', nome: 'Vales do Iguaçu' },
          { id: '6', nome: 'Campos Gerais' },
          { id: '7', nome: 'Grande Curitiba' }
        ]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) {
        setCargoDropdownOpen(false);
        setCargoSearch('');
      }
      if (macrorregiaoDropdownRef.current && !macrorregiaoDropdownRef.current.contains(event.target)) {
        setMacrorregiaoDropdownOpen(false);
        setMacrorregiaoSearch('');
      }
      if (cargoPretendidoDropdownRef.current && !cargoPretendidoDropdownRef.current.contains(event.target)) {
        setCargoPretendidoDropdownOpen(false);
        setCargoPretendidoSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const cleanInstagram = formData.instagramHandle?.trim().replace(/^@+/, '') || null;

    // Preparar dados para envio
    const candidateData = {
      nome: formData.nome.trim(),
      foto: formData.foto.trim() || null,
      cargoId: formData.cargoId || null,
      macrorregiaoId: formData.macrorregiaoId || null,
      redutoOrigem: formData.redutoOrigem.trim() || null,
      votosUltimaEleicao: formData.votosUltimaEleicao ? parseInt(formData.votosUltimaEleicao) : null,
      populacaoCidade: formData.populacaoCidade ? parseInt(formData.populacaoCidade) : null,
      votosValidos: formData.votosValidos ? parseInt(formData.votosValidos) : null,
      cargoPretendidoId: formData.cargoPretendidoId || null,
      instagramHandle: cleanInstagram,
      observacoes: formData.observacoes.trim() || null,
      mandato: formData.mandato.trim() || null
    };

    console.log('📤 Enviando dados:', candidateData);
    await onSubmit(candidateData);
  };

  // Filtrar opções baseado na busca
  const filteredCargos = cargos.filter(cargo => {
    if (!cargoSearch) return true;
    const searchText = cargoSearch.toLowerCase();
    return (
      cargo.nome?.toLowerCase().includes(searchText) ||
      cargo.nivel?.toLowerCase().includes(searchText) ||
      cargo.descricao?.toLowerCase().includes(searchText)
    );
  });

  const filteredMacrorregioes = macrorregioes.filter(macro => {
    if (!macrorregiaoSearch) return true;
    return macro.nome?.toLowerCase().includes(macrorregiaoSearch.toLowerCase());
  });

  const filteredCargosPretendido = cargos.filter(cargo => {
    if (!cargoPretendidoSearch) return true;
    const searchText = cargoPretendidoSearch.toLowerCase();
    return (
      cargo.nome?.toLowerCase().includes(searchText) ||
      cargo.nivel?.toLowerCase().includes(searchText)
    );
  });

  // Encontrar dados selecionados
  const selectedCargo = cargos.find(cargo => cargo.id === formData.cargoId);
  const selectedMacrorregiao = macrorregioes.find(macro => macro.id === formData.macrorregiaoId);
  const selectedCargoPretendido = cargos.find(cargo => cargo.id === formData.cargoPretendidoId); // ✅ NOVO

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ✅ Select Customizado - Cargo Atual */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cargo Atual
          </label>
          <div className="relative" ref={cargoDropdownRef}>
            {/* Input Principal */}
            <div
              onClick={() => !loadingOptions && setCargoDropdownOpen(!cargoDropdownOpen)}
              className={`
                w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors
                ${cargoDropdownOpen 
                  ? 'ring-2 ring-orange-500 border-transparent' 
                  : 'border-slate-300 hover:border-slate-400'
                }
                ${loadingOptions ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
                flex items-center justify-between
              `}
            >
              <div className="flex-1 min-w-0">
                {selectedCargo ? (
                  <span className="text-slate-900">
                    {selectedCargo.nome}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    {loadingOptions ? 'Carregando cargos...' : 'Selecione ou busque um cargo'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {selectedCargo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, cargoId: '' }));
                    }}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${cargoDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown */}
            {cargoDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                {/* Campo de busca */}
                <div className="p-2 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Digite o nome do cargo..."
                      value={cargoSearch}
                      onChange={(e) => setCargoSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Lista de opções */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredCargos.length > 0 ? (
                    filteredCargos.map((cargo) => (
                      <div
                        key={cargo.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, cargoId: cargo.id }));
                          setCargoDropdownOpen(false);
                          setCargoSearch('');
                        }}
                        className={`
                          px-3 py-2 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0
                          ${formData.cargoId === cargo.id 
                            ? 'bg-orange-50 text-orange-900' 
                            : 'hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{cargo.nome}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-slate-500 text-sm">
                      {cargoSearch ? `Nenhum resultado para "${cargoSearch}"` : 'Nenhum cargo disponível'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {cargos.length} cargos disponíveis
          </div>
        </div>

        {/* ✅ Campo Mandato */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mandato
          </label>
          <Input
            type="text"
            placeholder="Ex: Eleito, Reeleito, 3 Mandato...."
            value={formData.mandato || ''}
            onChange={handleInputChange('mandato')}
            icon={Briefcase}
          />
          <div className="text-xs text-slate-500 mt-1">
            Informe o período ou status do mandato atual (se houver)
          </div>
        </div>

        {/* ✅ Select Customizado - Macrorregião */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Macrorregião
          </label>
          <div className="relative" ref={macrorregiaoDropdownRef}>
            {/* Input Principal */}
            <div
              onClick={() => !loadingOptions && setMacrorregiaoDropdownOpen(!macrorregiaoDropdownOpen)}
              className={`
                w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors
                ${macrorregiaoDropdownOpen 
                  ? 'ring-2 ring-orange-500 border-transparent' 
                  : 'border-slate-300 hover:border-slate-400'
                }
                ${loadingOptions ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
                flex items-center justify-between
              `}
            >
              <div className="flex-1 min-w-0">
                {selectedMacrorregiao ? (
                  <span className="text-slate-900">📍 {selectedMacrorregiao.nome}</span>
                ) : (
                  <span className="text-slate-500">
                    {loadingOptions ? 'Carregando regiões...' : 'Selecione ou busque uma região'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {selectedMacrorregiao && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, macrorregiaoId: '' }));
                    }}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${macrorregiaoDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown */}
            {macrorregiaoDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                {/* Campo de busca */}
                <div className="p-2 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Digite o nome da região..."
                      value={macrorregiaoSearch}
                      onChange={(e) => setMacrorregiaoSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Lista de opções */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredMacrorregioes.length > 0 ? (
                    filteredMacrorregioes.map((macro) => (
                      <div
                        key={macro.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, macrorregiaoId: macro.id }));
                          setMacrorregiaoDropdownOpen(false);
                          setMacrorregiaoSearch('');
                        }}
                        className={`
                          px-3 py-2 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0
                          ${formData.macrorregiaoId === macro.id 
                            ? 'bg-orange-50 text-orange-900' 
                            : 'hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span className="font-medium">{macro.nome}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-slate-500 text-sm">
                      {macrorregiaoSearch ? `Nenhum resultado para "${macrorregiaoSearch}"` : 'Nenhuma região disponível'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {macrorregioes.length} regiões disponíveis
          </div>
        </div>
      </div>

      {/* ✅ Cargo Pretendido com Select Customizado + Reduto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cargo Pretendido
          </label>
          <div className="relative" ref={cargoPretendidoDropdownRef}>
            {/* Input Principal */}
            <div
              onClick={() => !loadingOptions && setCargoPretendidoDropdownOpen(!cargoPretendidoDropdownOpen)}
              className={`
                w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors
                ${cargoPretendidoDropdownOpen 
                  ? 'ring-2 ring-orange-500 border-transparent' 
                  : 'border-slate-300 hover:border-slate-400'
                }
                ${loadingOptions ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
                flex items-center justify-between
              `}
            >
              <div className="flex-1 min-w-0">
                {selectedCargoPretendido ? (
                  <span className="text-slate-900">
                    {selectedCargoPretendido.nome} 
                  </span>
                ) : (
                  <span className="text-slate-500">
                    {loadingOptions ? 'Carregando cargos...' : 'Selecione o cargo pretendido'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {selectedCargoPretendido && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, cargoPretendidoId: '' }));
                    }}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${cargoPretendidoDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown */}
            {cargoPretendidoDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                {/* Campo de busca */}
                <div className="p-2 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Digite o nome do cargo..."
                      value={cargoPretendidoSearch}
                      onChange={(e) => setCargoPretendidoSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Lista de opções */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredCargosPretendido.length > 0 ? (
                    filteredCargosPretendido.map((cargo) => (
                      <div
                        key={cargo.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, cargoPretendidoId: cargo.id }));
                          setCargoPretendidoDropdownOpen(false);
                          setCargoPretendidoSearch('');
                        }}
                        className={`
                          px-3 py-2 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0
                          ${formData.cargoPretendidoId === cargo.id 
                            ? 'bg-orange-50 text-orange-900' 
                            : 'hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{cargo.nome}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-slate-500 text-sm">
                      {cargoPretendidoSearch ? `Nenhum resultado para "${cargoPretendidoSearch}"` : 'Nenhum cargo disponível'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Selecione o cargo que o candidato pretende concorrer
          </div>
        </div>

        {/* Reduto de origem mantido igual */}
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
      </div>

      {/* Dados Eleitorais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            População da Cidade
          </label>
          <Input
            type="number"
            placeholder="Ex: 50000"
            value={formData.populacaoCidade}
            onChange={handleInputChange('populacaoCidade')}
            icon={Users}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Votos Válidos
          </label>
          <Input
            type="number"
            placeholder="Ex: 35000"
            value={formData.votosValidos}
            onChange={handleInputChange('votosValidos')}
            icon={Building}
            min="0"
          />
        </div>
      </div>

      {/* Instagram */}
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

      {/* ✅ NOVO - Campo de Observações */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Observações
        </label>
        <textarea
          placeholder="Observações adicionais sobre o candidato..."
          value={formData.observacoes}
          onChange={handleInputChange('observacoes')}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
        />
        <div className="text-xs text-slate-500 mt-1">
          Informações complementares, notas ou comentários sobre o candidato
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
          disabled={loadingOptions}
        >
          {initialData ? 'Atualizar Candidato' : 'Cadastrar Candidato'}
        </Button>
      </div>

      {/* Loading indicator */}
      {loadingOptions && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-sm text-slate-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
            Carregando opções de cargos e regiões...
          </div>
        </div>
      )}

    </form>
  );
};

export default CandidateForm;