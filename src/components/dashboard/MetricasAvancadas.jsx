// components/dashboard/MetricasAvancadas.jsx
import { TrendingUp, Activity, Users, BarChart3 } from 'lucide-react';

const MetricasAvancadas = ({ dados }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#FF943A]" />
          <h3 className="text-lg font-semibold text-slate-700">
            Métricas Avançadas
          </h3>
        </div>
        
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">
            Métricas Avançadas em Desenvolvimento
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Funcionalidades temporais e comparativas serão implementadas em breve
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricasAvancadas;