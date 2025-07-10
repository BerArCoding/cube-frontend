import { Button } from '../components/ui';
import Header from '../components/Header';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header title="Dashboard" />

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Dashboard
          </h2>
          <p className="text-gray-600">
            Gerencie suas atividades e acesse as funcionalidades do sistema.
          </p>
        </div>

        
      </main>
    </div>
  );
};

export default Dashboard;
