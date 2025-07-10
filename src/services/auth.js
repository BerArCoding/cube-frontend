const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const authAPI = {
  // Login do usuário
  login: async (credentials) => {
    try {
      console.log('Fazendo login para:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro na autenticação');
      }

      const data = await response.json();
      
      // Salvar token no localStorage
      if (data.token) {
        localStorage.setItem('cube_token', data.token);
        localStorage.setItem('cube_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Logout do usuário
  logout: () => {
    localStorage.removeItem('cube_token');
    localStorage.removeItem('cube_user');
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('cube_token');
  },

  // Obter token de autenticação
  getToken: () => {
    return localStorage.getItem('cube_token');
  },

  // Obter dados do usuário logado
  getUser: () => {
    const user = localStorage.getItem('cube_user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar se é admin
  isAdmin: () => {
    const user = authAPI.getUser();
    return user?.tipo === 'ADMIN';
  },

  // Testar conexão com a API
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