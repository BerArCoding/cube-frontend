// services/auth.js - VERSÃO CORRIGIDA
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // ← CORRIGIDO

export const authAPI = {
  // Login do usuário
  login: async (credentials) => {
    try {
      console.log('🔍 Fazendo login para:', API_BASE_URL);
      console.log('🔍 Credenciais:', credentials);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('🔍 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Erro da API:', errorData);
        throw new Error(errorData.error || 'Erro na autenticação');
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      
      // ✅ CORRIGIDO - API retorna 'usuario', não 'user'
      if (data.token) {
        localStorage.setItem('cube_token', data.token);
        localStorage.setItem('cube_user', JSON.stringify(data.usuario)); // ← CORRIGIDO
      }

      return {
        token: data.token,
        user: data.usuario  // ← CORRIGIDO
      };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('cube_token');
    localStorage.removeItem('cube_user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('cube_token');
  },

  getToken: () => {
    return localStorage.getItem('cube_token');
  },

  getUser: () => {
    const user = localStorage.getItem('cube_user');
    return user ? JSON.parse(user) : null;
  },

  isAdmin: () => {
    const user = authAPI.getUser();
    return user?.tipo === 'ADMIN';
  },

  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
};

export default authAPI;