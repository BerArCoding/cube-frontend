// components/dashboard/SemaforoViabilidade.jsx
import { useState } from 'react';

const SemaforoViabilidade = ({ dados }) => {
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

  const categorias = [
    { 
      key: 'alta', 
      label: 'Alta Viabilidade', 
      color: 'bg-green-500', 
      textColor: 'text-green-700',
      bgLight: 'bg-green-50'
    },
    { 
      key: 'media', 
      label: 'Média Viabilidade', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50'
    },
    { 
      key: 'risco', 
      label: 'Risco', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-700',
      bgLight: 'bg-orange-50'
    },
    { 
      key: 'critico', 
      label: 'Crítico', 
      color: 'bg-red-500', 
      textColor: 'text-red-700',
      bgLight: 'bg-red-50'
    }
  ];

  const getPercentual = (valor) => {
    return dados?.total ? ((valor / dados.total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Resumo Visual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categorias.map((categoria) => {
          const valor = dados?.distribuicao?.[categoria.key] || 0;
          const percentual = getPercentual(valor);
          
          return (
            <div 
              key={categoria.key}
              className={`${categoria.bgLight} rounded-lg p-4 border-l-4 ${categoria.color.replace('bg-', 'border-')}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {categoria.label}
                  </p>
                  <p className={`text-2xl font-bold ${categoria.textColor}`}>
                    {valor}
                  </p>
                  <p className="text-xs text-slate-500">
                    {percentual}% do total
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Barras Visual */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Distribuição de Viabilidade ({dados?.total || 0} candidatos)
        </h4>
        <div className="space-y-3">
          {categorias.map((categoria) => {
            const valor = dados?.distribuicao?.[categoria.key] || 0;
            const percentual = getPercentual(valor);
            const width = dados?.total ? (valor / dados.total) * 100 : 0;
            
            return (
              <div key={categoria.key} className="flex items-center space-x-3">
                <div className="w-20 text-xs font-medium text-slate-600">
                  {categoria.label.split(' ')[0]}
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`${categoria.color} h-full rounded-full transition-all duration-500 flex items-center justify-center`}
                    style={{ width: `${width}%` }}
                  >
                    {valor > 0 && (
                      <span className="text-white text-xs font-bold">
                        {valor}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-xs font-medium text-slate-600">
                  {percentual}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Candidatos por Categoria */}
      {dados?.candidatos && dados.candidatos.length > 0 ? (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Candidatos por Categoria
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {dados.candidatos.map((candidato) => {
              const categoria = categorias.find(c => c.key === candidato.categoria);
              return (
                <div 
                  key={candidato.id}
                  className="flex items-center justify-between bg-white rounded-md p-3 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setCandidatoSelecionado(candidato)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${categoria?.color}`}></div>
                    <span className="text-sm font-medium text-slate-700">
                      {candidato.nome}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${categoria?.textColor}`}>
                      {candidato.score}/100
                    </span>
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`${categoria?.color} h-2 rounded-full`}
                        style={{ width: `${candidato.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-slate-500">Nenhum candidato com análise de viabilidade disponível</p>
        </div>
      )}

      {/* Modal de detalhes do candidato */}
      {candidatoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Detalhes - {candidatoSelecionado.nome}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Score de Viabilidade:</span>
                <span className="font-bold">{candidatoSelecionado.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Categoria:</span>
                <span className="font-bold capitalize">{candidatoSelecionado.categoria}</span>
              </div>
            </div>
            <button
              onClick={() => setCandidatoSelecionado(null)}
              className="mt-4 w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemaforoViabilidade;