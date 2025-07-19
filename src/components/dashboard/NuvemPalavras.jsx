// components/dashboard/NuvemPalavras.jsx
import { useState, useEffect } from 'react';
import { BarChart3, Hash, Target, MessageCircle } from 'lucide-react';

const NuvemPalavras = ({ dados }) => {
  const [palavrasProcessadas, setPalavrasProcessadas] = useState([]);

  useEffect(() => {
    if (dados?.palavras && dados.palavras.length > 0) {
      // Processar palavras para diferentes tamanhos
      const processadas = dados.palavras.map((palavra, index) => ({
        ...palavra,
        size: Math.max(12, Math.min(48, (palavra.weight / 100) * 48)),
        color: getCorPorPeso(palavra.weight),
        animationDelay: index * 0.1
      }));
      setPalavrasProcessadas(processadas);
    }
  }, [dados]);

  const getCorPorPeso = (peso) => {
    if (peso >= 80) return '#FF943A'; // Laranja principal
    if (peso >= 60) return '#475569'; // Azul escuro
    if (peso >= 40) return '#64748B'; // Slate
    if (peso >= 20) return '#94A3B8'; // Slate mais claro
    return '#CBD5E1'; // Slate bem claro
  };

  const getPosicoesAleatorias = () => {
    const posicoes = [];
    const numPalavras = palavrasProcessadas.length;
    
    // Gerar posições em espiral com mais espaçamento
    for (let i = 0; i < numPalavras; i++) {
      const angle = (i / numPalavras) * 6 * Math.PI;
      const radius = 30 + (i * 12); 
      const x = 50 + (radius * Math.cos(angle)) / 3;
      const y = 50 + (radius * Math.sin(angle)) / 3;
      
      posicoes.push({
        left: `${Math.max(8, Math.min(82, x))}%`,
        top: `${Math.max(15, Math.min(75, y))}%`
      });
    }
    return posicoes;
  };

  const posicoes = getPosicoesAleatorias();
  const temPalavras = dados?.palavras && dados.palavras.length > 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Análises</p>
              <p className="text-xl font-bold text-blue-900">
                {dados?.totalAnalises?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Palavras Únicas</p>
              <p className="text-xl font-bold text-green-900">
                {dados?.palavras?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FF943A] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-700">Palavra Principal</p>
              <p className="text-xl font-bold text-orange-900">
                {dados?.palavras?.[0]?.text || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nuvem de Palavras */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 border border-slate-200 relative overflow-hidden min-h-96">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
        
        <div className="relative z-10">
          <h4 className="text-lg font-semibold text-slate-700 mb-6 text-center">
            Principais Temas e Assuntos Discutidos
          </h4>
          
          {temPalavras ? (
            <div className="relative h-80 overflow-hidden">
              {palavrasProcessadas.map((palavra, index) => (
                <div
                  key={palavra.text}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-all duration-300 cursor-pointer select-none animate-fade-in"
                  style={{
                    ...posicoes[index],
                    fontSize: `${palavra.size}px`,
                    color: palavra.color,
                    fontWeight: palavra.weight > 70 ? 'bold' : palavra.weight > 40 ? '600' : 'normal',
                    animationDelay: `${palavra.animationDelay}s`,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                  title={`Relevância: ${palavra.weight}/100`}
                >
                  {palavra.text}
                </div>
              ))}
            </div>
          ) : (
            // Mensagem quando não há dados
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">
                  Nenhuma palavra-chave disponível
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Execute análises de sentimento para gerar a nuvem de palavras
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Decoração de fundo */}
        <div className="absolute bottom-4 right-4 opacity-10">
          <MessageCircle className="w-16 h-16 text-slate-400" />
        </div>
      </div>

      {/* Lista de Palavras com Detalhes */}
      {temPalavras && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700">
              Ranking de Palavras por Relevância
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {dados.palavras.map((palavra, index) => (
              <div 
                key={palavra.text}
                className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-400 w-6">
                    #{index + 1}
                  </span>
                  <span 
                    className="font-semibold"
                    style={{ color: getCorPorPeso(palavra.weight) }}
                  >
                    {palavra.text}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${palavra.weight}%`,
                        backgroundColor: getCorPorPeso(palavra.weight)
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-12 text-right">
                    {palavra.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NuvemPalavras;