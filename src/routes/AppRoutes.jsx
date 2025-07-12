import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth.jsx';
import ProtectedRoute, { PublicRoute } from '../components/ProtectedRoute.jsx';

// Importar páginas
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import CandidatesList from '../pages/CandidatesList.jsx';
import CreateCandidate from '../pages/CreateCandidate.jsx';
import EditCandidate from '../pages/EditCandidate.jsx';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota raiz - redireciona para dashboard se autenticado, senão para login */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />

          {/* Rotas públicas (só para usuários não autenticados) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Rotas protegidas (só para usuários autenticados) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de candidatos (só para admins) */}
          <Route 
            path="/candidates" 
            element={
              <ProtectedRoute adminOnly={true}>
                <CandidatesList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/candidates/create" 
            element={
              <ProtectedRoute adminOnly={true}>
                <CreateCandidate />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/candidates/edit/:id" 
            element={
              <ProtectedRoute adminOnly={true}>
                <EditCandidate />
              </ProtectedRoute>
            } 
          />

          {/* Rotas administrativas (só para admins) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="min-h-screen bg-slate-50">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                      <h1 className="text-2xl font-bold text-slate-900 mb-4">
                        Área Administrativa
                      </h1>
                      <p className="text-slate-600 mb-6">
                        Funcionalidades administrativas em desenvolvimento...
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="font-medium text-slate-900 mb-2">
                            🔧 Configurações
                          </h3>
                          <p className="text-sm text-slate-600">
                            Configurações do sistema
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="font-medium text-slate-900 mb-2">
                            👥 Usuários
                          </h3>
                          <p className="text-sm text-slate-600">
                            Gerenciar usuários
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="font-medium text-slate-900 mb-2">
                            📊 Relatórios
                          </h3>
                          <p className="text-sm text-slate-600">
                            Análises e relatórios
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h3 className="font-medium text-slate-900 mb-2">
                            🗳️ Eleições
                          </h3>
                          <p className="text-sm text-slate-600">
                            Configurar eleições
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Rota 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="p-8 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
                    <p className="text-slate-600 mb-8">
                      Oops! A página que você procura não foi encontrada.
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="/dashboard" 
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                      >
                        Voltar ao Dashboard
                      </a>
                      <br />
                      <a 
                        href="/candidates" 
                        className="inline-block text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Ver Candidatos
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;