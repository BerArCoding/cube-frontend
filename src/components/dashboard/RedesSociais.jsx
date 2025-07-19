// components/dashboard/RedesSociais.jsx
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageCircle, Users, Heart, TrendingUp } from 'lucide-react';

const RedesSociais = ({ dados, showIcons = true }) => {
  const sentimentoData = [
    { name: 'Positivo', value: dados?.sentimento?.positivo || 0, color: '#10B981' },
    { name: 'Negativo', value: dados?.sentimento?.negativo || 0, color: '#EF4444' },
    { name: 'Neutro', value: dados?.sentimento?.neutro || 0, color: '#6B7280' }
  ];

  const engajamentoData = [
    { name: 'Likes', value: dados?.totalLikes || 0, color: '#FF943A' },
    { name: 'Comentários', value: dados?.totalComentarios || 0, color: '#475569' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || 0;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-sm text-slate-600">
            Valor: <span className="font-bold">{formatNumber(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Verificar se há dados de sentimento para mostrar mensagem
  const temDadosSentimento = (dados?.sentimento?.positivo || 0) + 
                            (dados?.sentimento?.negativo || 0) + 
                            (dados?.sentimento?.neutro || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Menções" 
          value={formatNumber(dados?.totalMencoes)}
          icon={MessageCircle}
          color="bg-blue-500"
          showIcon={showIcons}
        />
        <MetricCard 
          title="Alcance Total" 
          value={formatNumber(dados?.totalAlcance)}
          icon={Users}
          color="bg-green-500"
          showIcon={showIcons}
        />
        <MetricCard 
          title="Total Likes" 
          value={formatNumber(dados?.totalLikes)}
          icon={Heart}
          color="bg-red-500"
          showIcon={showIcons}
        />
        <MetricCard 
          title="Engajamento" 
          value={formatNumber((dados?.totalLikes || 0) + (dados?.totalComentarios || 0))}
          icon={TrendingUp}
          color="bg-[#FF943A]"
          showIcon={showIcons}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Sentimento */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Análise de Sentimento
          </h4>
          
          {temDadosSentimento ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legenda */}
              <div className="flex justify-center space-x-4 mt-4">
                {sentimentoData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs font-medium text-slate-600">
                      {item.name}: {formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Mensagem quando não há dados
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  Nenhuma análise de sentimento disponível
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Execute o scraping de comentários para gerar dados
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Engajamento */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Distribuição de Engajamento
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engajamentoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="#FF943A"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumo de Performance */}
      <div className="bg-gradient-to-r from-[#FF943A] to-orange-600 rounded-lg p-6 text-white">
        <h4 className="text-lg font-semibold mb-4">Resumo de Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {temDadosSentimento && dados?.sentimento?.positivo && (dados?.sentimento?.positivo + dados?.sentimento?.negativo + dados?.sentimento?.neutro) > 0 ? 
                (((dados.sentimento.positivo) / (dados.sentimento.positivo + dados.sentimento.negativo + dados.sentimento.neutro)) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm opacity-90">Sentimento Positivo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {dados?.totalAlcance && dados?.totalLikes ? 
                ((dados.totalLikes / dados.totalAlcance) * 100).toFixed(2) : 0}%
            </p>
            <p className="text-sm opacity-90">Taxa de Engajamento</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatNumber((dados?.totalLikes || 0) + (dados?.totalComentarios || 0))}
            </p>
            <p className="text-sm opacity-90">Interações Totais</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: IconComponent, color, showIcon = true }) => (
  <div className="bg-white rounded-lg p-4 border border-slate-200">
    <div className={`flex items-center ${showIcon ? 'justify-between' : 'justify-center'}`}>
      <div className={showIcon ? '' : 'text-center'}>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xl font-bold text-slate-700 mt-1">
          {value}
        </p>
      </div>
      {showIcon && (
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
          <IconComponent className="w-5 h-5" />
        </div>
      )}
    </div>
  </div>
);

export default RedesSociais;