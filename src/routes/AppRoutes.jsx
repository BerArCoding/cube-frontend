import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth.jsx';
import ProtectedRoute, { PublicRoute } from '../components/ProtectedRoute';

// Importar páginas
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

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

          {/* Rotas administrativas (só para admins) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Área Administrativa</h1>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Rota 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Página não encontrada</p>
                  <a 
                    href="/dashboard" 
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Voltar ao Dashboard
                  </a>
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
