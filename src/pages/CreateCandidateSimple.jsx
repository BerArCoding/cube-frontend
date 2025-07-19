import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/Header.jsx';
import { Button, Input } from '../components/ui';
import { Plus, ArrowLeft, User } from 'lucide-react';

const CreateCandidateSimple = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    foto: '',
    cargoAtual: '',
    redutoOrigem: '',
    votosUltimaEleicao: '',
    cargoPretendido: ''
  });

  // Verificar se é admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock - simular criação
      console.log('Criando candidato:', formData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect para lista de candidatos
      navigate('/candidates');
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      alert(`Erro ao cadastrar candidato: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Cadastrar Candidato" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Plus className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Cadastrar Novo Candidato
              </h1>
              <p className="text-slate-600 mt-1">
                Adicione um novo candidato para análise política
              </p>
            </div>
          </div>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Informações do Candidato
            </h2>
            <p className="text-sm text-slate-600">
              Preencha os dados básicos do candidato. Apenas o nome é obrigatório.
            </p>
          </div>
          
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
              />
            </div>

            {/* Cargo Atual */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo Atual
              </label>
              <Input
                type="text"
                placeholder="Ex: Vereador, Deputado..."
                value={formData.cargoAtual}
                onChange={handleInputChange('cargoAtual')}
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
                onChange={handleInputChange('redutoOrigem')}
              />
            </div>

            {/* Cargo Pretendido */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo Pretendido
              </label>
              <Input
                type="text"
                placeholder="Digite o cargo pretendido..."
                value={formData.cargoPretendido}
                onChange={handleInputChange('cargoPretendido')}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Cadastrar Candidato
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidateSimple;
