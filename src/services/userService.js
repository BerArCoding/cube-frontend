import authAPI from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const userService = {
  // Atualizar perfil do usuário logado
  updateProfile: async (userData) => {
    try {
      const token = authAPI.getToken();
      const currentUser = authAPI.getUser();
      
      if (!token || !currentUser) {
        throw new Error('Usuário não autenticado');
      }

      
      
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      const data = await response.json();
      
      // Atualizar dados no localStorage
      if (data.usuario) {
        const updatedUser = { ...currentUser, ...data.usuario };
        localStorage.setItem('cube_user', JSON.stringify(updatedUser));
      }

      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Obter dados do usuário atual (opcional - para refresh)
  getCurrentUser: async () => {
    try {
      const token = authAPI.getToken();
      const currentUser = authAPI.getUser();
      
      if (!token || !currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao buscar dados do usuário');
      }

      const usuario = await response.json();
      
      // Atualizar dados no localStorage
      localStorage.setItem('cube_user', JSON.stringify(usuario));
      
      return usuario;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      throw error;
    }
  },

  // Alterar senha usando o endpoint específico
  changePassword: async (passwordData) => {
    try {
      const token = authAPI.getToken();
      const currentUser = authAPI.getUser();
      
      if (!token || !currentUser) {
        throw new Error('Usuário não autenticado');
      }

      
      
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual: passwordData.senhaAtual,
          novaSenha: passwordData.novaSenha
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao alterar senha');
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      throw error;
    }
  },

  // =====================================================
  // FUNÇÕES ADMINISTRATIVAS (requerem permissão de admin)
  // =====================================================

  // Listar todos os usuários (apenas admin)
  getAllUsers: async (filters = {}) => {
    try {
      const token = authAPI.getToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Construir query string com filtros
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tipo) queryParams.append('tipo', filters.tipo);
      if (filters.ativo !== undefined) queryParams.append('ativo', filters.ativo);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/api/users${queryString ? `?${queryString}` : ''}`;

      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar usuários');
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      throw error;
    }
  },

  // Criar novo usuário (apenas admin)
  createUser: async (userData) => {
    try {
      const token = authAPI.getToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      
      
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  },

  // Atualizar usuário (apenas admin)
  updateUser: async (userId, userData) => {
    try {
      const token = authAPI.getToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar usuário');
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Deletar usuário (apenas admin)
  deleteUser: async (userId) => {
    try {
      const token = authAPI.getToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao deletar usuário');
      }

      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // Obter usuário específico por ID (apenas admin)
  getUserById: async (userId) => {
    try {
      const token = authAPI.getToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao buscar usuário');
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      throw error;
    }
  }
};

export default userService;