const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('cube_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

const macrorregiaoService = {
  // Buscar todas as macrorregiões
  getAllMacrorregioes: async () => {
    try {
      const result = await makeRequest(`${API_URL}/api/macrorregioes`);
      return result; // { success: true, data: [...] }
    } catch (error) {
      console.error('Erro ao buscar macrorregiões:', error);
      return { success: false, data: [], error: error.message };
    }
  }
};

export default macrorregiaoService;