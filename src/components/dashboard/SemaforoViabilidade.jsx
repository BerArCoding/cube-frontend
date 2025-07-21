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
    const totalProcessados = dados?.totalProcessados || 0; // Total de candidatos com viabilidade
    return totalProcessados ? ((valor / totalProcessados) * 100).toFixed(1) : 0;
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
                    {percentual}% dos processados
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemaforoViabilidade;