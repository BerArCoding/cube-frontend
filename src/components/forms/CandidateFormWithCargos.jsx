import React, { useState } from 'react';
import { Button, Input } from '../ui';
import CargoSelectFixed from '../ui/CargoSelectFixed.jsx';
import { User, Image, MapPin, Vote, Target } from 'lucide-react';

const CandidateFormWithCargos = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    foto: '',
    cargoAtual: '',
    redutoOrigem: '',
    votosUltimaEleicao: '',
    cargoPretendido: '',
    instagramHandle: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  // Atualizar dados quando initialData mudar
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    // Validar URL da foto se preenchida
    if (formData.foto && formData.foto.trim()) {
      try {
        new URL(formData.foto);
      } catch {
        newErrors.foto = 'URL da foto inválida';
      }
    }

    // Validar votos se preenchido
    if (formData.votosUltimaEleicao && formData.votosUltimaEleicao.trim()) {
      const votos = parseInt(formData.votosUltimaEleicao);
      if (isNaN(votos) || votos < 0) {
        newErrors.votosUltimaEleicao = 'Número de votos inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar dados para envio - converter números e limpar strings vazias
    const dataToSubmit = {
      nome: formData.nome.trim(),
      foto: formData.foto?.trim() || null,
      cargoAtual: formData.cargoAtual?.trim() || null,
      redutoOrigem: formData.redutoOrigem?.trim() || null,
      votosUltimaEleicao: formData.votosUltimaEleicao?.trim() 
        ? parseInt(formData.votosUltimaEleicao) 
        : null,
      cargoPretendido: formData.cargoPretendido?.trim() || null,
      instagramHandle: formData.instagramHandle?.trim() || null
    };
    
    onSubmit(dataToSubmit);
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
          onChange={(e) => handleInputChange('nome', e.target.value)}
          icon={User}
          error={errors.nome}
          disabled={isLoading}
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
          onChange={(e) => handleInputChange('foto', e.target.value)}
          icon={Image}
          error={errors.foto}
          disabled={isLoading}
        />
      </div>

      {/* Cargo Atual */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Cargo Atual
        </label>
        <CargoSelectFixed
          value={formData.cargoAtual}
          onChange={(value) => handleInputChange('cargoAtual', value)}
          placeholder="Ex: Vereador, Deputado..."
          disabled={isLoading}
        />
      </div>

      {/* Cargo Pretendido */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Cargo Pretendido
        </label>
        <CargoSelectFixed
          value={formData.cargoPretendido}
          onChange={(value) => handleInputChange('cargoPretendido', value)}
          placeholder="Digite o cargo pretendido..."
          disabled={isLoading}
        />
      </div>

      {/* Reduto de Origem */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Reduto de Origem
        </label>
        <Input
          type="text"
          placeholder="Ex: São Paulo, Rio de Janeiro..."
          value={formData.redutoOrigem}
          onChange={(e) => handleInputChange('redutoOrigem', e.target.value)}
          icon={MapPin}
          error={errors.redutoOrigem}
          disabled={isLoading}
        />
      </div>

      {/* Votos da Última Eleição */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Votos da Última Eleição
        </label>
        <Input
          type="number"
          placeholder="Ex: 15000"
          value={formData.votosUltimaEleicao}
          onChange={(e) => handleInputChange('votosUltimaEleicao', e.target.value)}
          icon={Vote}
          error={errors.votosUltimaEleicao}
          disabled={isLoading}
          min="0"
        />
      </div>

      {/* Instagram Handle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Instagram (@)
        </label>
        <Input
          type="text"
          placeholder="Ex: @candidato2024"
          value={formData.instagramHandle}
          onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
          icon={Target}
          error={errors.instagramHandle}
          disabled={isLoading}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {initialData ? 'Atualizar' : 'Cadastrar'} Candidato
        </Button>
      </div>
    </form>
  );
};

export default CandidateFormWithCargos;