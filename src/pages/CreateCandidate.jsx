import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/Header.jsx';
import CandidateForm from '../components/forms/CandidateForm.jsx';
import candidateService from '../services/candidates.js';
import { Plus, ArrowLeft } from 'lucide-react';

const CreateCandidate = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se é admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleCreateCandidate = async (candidateData) => {
    setIsLoading(true);
    
    try {
      console.log('Enviando dados para API:', candidateData);
      
      // Fazer request real para a API
      const response = await candidateService.createCandidate(candidateData);
      
      console.log('Candidato criado com sucesso:', response);
      
      // Mostrar mensagem de sucesso
      alert(`Candidato "${candidateData.nome}" cadastrado com sucesso!`);
      
      // Redirect para lista de candidatos
      navigate('/candidates');
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      
      // Mostrar erro específico retornado pela API
      const errorMessage = error.message || 'Erro desconhecido ao cadastrar candidato';
      alert(`Erro ao cadastrar candidato: ${errorMessage}`);
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
            onClick={() => navigate('/candidates')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar à Lista</span>
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
          
          <CandidateForm 
            onSubmit={handleCreateCandidate}
            isLoading={isLoading}
          />
        </div>

        {/* Dicas */}
        {/* <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Para cargos, digite e o sistema buscará na base de dados ou criará novos</li>
            <li>• A foto deve ser uma URL válida (ex: link do Google Drive público)</li>
            <li>• Votos da última eleição ajudam na análise de viabilidade</li>
            <li>• Reduto de origem pode ser cidade, região ou estado</li>
            <li>• Todos os campos são opcionais, exceto o nome</li>
          </ul>
        </div> */}

        {/* Debug Info - remover em produção */}
        {/* {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
            <p><strong>Debug:</strong></p>
            <p>API: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
            <p>Endpoint: POST /api/candidates</p>
            <p>Status: {isLoading ? 'Carregando...' : 'Pronto'}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CreateCandidate;