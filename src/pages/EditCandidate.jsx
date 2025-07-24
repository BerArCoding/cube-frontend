import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/Header.jsx';
import CandidateForm from '../components/forms/CandidateForm.jsx';
import candidateService from '../services/candidates.js';
import { Edit3, ArrowLeft, User } from 'lucide-react';

const EditCandidate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se é admin
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    const loadCandidate = async () => {
      setIsLoadingData(true);
      setError(null);
      
      try {
        const response = await candidateService.getCandidateById(id, true); // incluir inativos
        
        if (response.success && response.data) {
          setCandidate(response.data);
        } else {
          throw new Error('Candidato não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar candidato:', error);
        setError(error.message);
        
        // Se não conseguir carregar, redirecionar após um tempo
        setTimeout(() => {
          navigate('/candidates');
        }, 3000);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) {
      loadCandidate();
    } else {
      setError('ID do candidato não fornecido');
      setIsLoadingData(false);
    }
  }, [id, navigate, isAdmin]);

  const handleUpdateCandidate = async (candidateData) => {
    setIsLoading(true);
    
    try {
      
      const response = await candidateService.updateCandidate(id, candidateData);
      
      if (response.success) {
        alert(`Candidato "${candidateData.nome}" atualizado com sucesso!`);
        navigate('/candidates');
      } else {
        throw new Error(response.error || 'Erro ao atualizar candidato');
      }
    } catch (error) {
      console.error('Erro ao atualizar candidato:', error);
      alert(`Erro ao atualizar candidato: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Editar Candidato" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-slate-600">Carregando dados do candidato...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Editar Candidato" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <User className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Erro ao carregar candidato</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => navigate('/candidates')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Voltar à Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Editar Candidato" />
      
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Editar Candidato
              </h1>
              <div className="text-slate-600 mt-1 flex items-center space-x-2">
                <span>Atualizando informações de</span>
                <span className="font-medium text-slate-900">{candidate?.nome}</span>
                {!candidate?.ativo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Aviso se candidato estiver inativo */}
        {candidate && !candidate.ativo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-yellow-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Candidato Inativo
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Este candidato está inativo. Você pode editá-lo e depois reativá-lo se necessário.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card do formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Informações do Candidato
            </h2>
            <p className="text-sm text-slate-600">
              Atualize os dados do candidato conforme necessário. Apenas o nome é obrigatório.
            </p>
          </div>
          
          <CandidateForm 
            onSubmit={handleUpdateCandidate}
            initialData={candidate}
            isLoading={isLoading}
          />
        </div>

        {/* Informações adicionais */}
        

        {/* Debug Info - remover em produção */}
        {/* {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
            <p><strong>Debug:</strong></p>
            <p>Candidate ID: {id}</p>
            <p>API: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
            <p>Endpoint: PUT /api/candidates/{id}</p>
            <p>Status: {isLoading ? 'Salvando...' : 'Pronto'}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EditCandidate;