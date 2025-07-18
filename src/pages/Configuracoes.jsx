import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui';
import dominioService from '../services/dominioService';
import userService from '../services/userService'; // Importar o userService
import authAPI from '../services/auth';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Globe, 
  Palette,
  Database,
  Key,
  Mail,
  Phone,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Link,
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  Loader,
  Rss,
  Newspaper
} from 'lucide-react';

const Configuracoes = () => {
  const [activeSection, setActiveSection] = useState('perfil');
  const [activeTab, setActiveTab] = useState('noticias'); // 'noticias' ou 'rssapp'
  const [dominios, setDominios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDominio, setEditingDominio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para gerenciamento de usuários
  const [usuarios, setUsuarios] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilters, setUserFilters] = useState({
    tipo: '',
    ativo: undefined
  });
  
  // Estado para dados do usuário
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    tipo: ''
  });

  // Estado original para detectar mudanças
  const [originalUserData, setOriginalUserData] = useState({
    nome: '',
    email: '',
    tipo: ''
  });

  // Estado para formulário de senha
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  
  const [formData, setFormData] = useState({
    nome: '',
    dominio: '',
    ativo: true,
    ordem: '',
    cor: '#0066CC',
    isRSSapp: false
  });

  // Estado para formulário de usuário
  const [userFormData, setUserFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'USUARIO',
    ativo: true
  });

  // Carregar dados do usuário logado
  useEffect(() => {
    const user = authAPI.getUser();
    if (user) {
      const userInfo = {
        nome: user.nome || '',
        email: user.email || '',
        tipo: user.tipo || ''
      };
      setUserData(userInfo);
      setOriginalUserData(userInfo);
    }
  }, []);

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Carregar domínios
  const carregarDominios = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Carregando domínios...');
      const dominiosData = await dominioService.listarDominios({ ativo: undefined });
      setDominios(dominiosData);
      console.log(`✅ ${dominiosData.length} domínios carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar domínios:', error);
      setError(`Erro ao carregar domínios: ${error.message}`);
      setDominios([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários (apenas para admin)
  const carregarUsuarios = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Carregando usuários...');
      const filters = {
        search: userSearchTerm,
        ...userFilters
      };
      const response = await userService.getAllUsers(filters);
      
      // Verificar se a resposta é um array ou um objeto com array
      let usuariosData;
      if (Array.isArray(response)) {
        usuariosData = response;
      } else if (response && Array.isArray(response.usuarios)) {
        usuariosData = response.usuarios;
      } else if (response && Array.isArray(response.data)) {
        usuariosData = response.data;
      } else {
        usuariosData = [];
      }
      
      setUsuarios(usuariosData);
      console.log(`✅ ${usuariosData.length} usuários carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      setError(`Erro ao carregar usuários: ${error.message}`);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dominios') {
      carregarDominios();
    } else if (activeSection === 'usuarios' && userData.tipo === 'ADMIN') {
      carregarUsuarios();
    }
  }, [activeSection, userSearchTerm, userFilters]);

  // Filtrar domínios por tipo e busca
  const dominiosFiltrados = dominios
    .filter(dominio => {
      const isRSSappTab = activeTab === 'rssapp';
      return dominio.isRSSapp === isRSSappTab;
    })
    .filter(dominio =>
      dominio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dominio.dominio.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      dominio: '',
      ativo: true,
      ordem: '',
      cor: '#0066CC',
      isRSSapp: activeTab === 'rssapp'
    });
    setShowAddForm(false);
    setEditingDominio(null);
  };

  // Resetar formulário de usuário
  const resetUserForm = () => {
    setUserFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'USUARIO',
      ativo: true
    });
    setShowUserForm(false);
    setEditingUser(null);
  };

  // Função para atualizar dados do usuário
  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para atualizar dados de senha
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Verificar se houve mudanças no perfil
  const hasProfileChanges = () => {
    return userData.nome !== originalUserData.nome || 
           userData.email !== originalUserData.email;
  };

  // Função para salvar alterações do perfil
  const salvarPerfil = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!userData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!userData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Formato de email inválido');
      }

      console.log('📝 Salvando dados do perfil...');
      
      // Preparar dados para envio (apenas nome e email podem ser alterados)
      const dataToUpdate = {
        nome: userData.nome.trim(),
        email: userData.email.trim()
      };

      // Chamar API para atualizar perfil
      const result = await userService.updateProfile(dataToUpdate);
      
      console.log('✅ Perfil atualizado:', result);
      
      // Atualizar estado original para refletir as mudanças salvas
      setOriginalUserData({
        nome: userData.nome,
        email: userData.email,
        tipo: userData.tipo
      });
      
      setSuccess('Perfil atualizado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      setError(error.message || 'Erro ao salvar alterações do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar alterações do perfil
  const cancelarAlteracoesPerfil = () => {
    setUserData({ ...originalUserData });
    setError('');
    setSuccess('');
  };

  // Função para alterar senha
  const alterarSenha = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações
      if (!passwordData.senhaAtual.trim()) {
        throw new Error('Senha atual é obrigatória');
      }

      if (!passwordData.novaSenha.trim()) {
        throw new Error('Nova senha é obrigatória');
      }

      if (passwordData.novaSenha.length < 6) {
        throw new Error('Nova senha deve ter pelo menos 6 caracteres');
      }

      if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        throw new Error('Confirmação de senha não confere');
      }

      if (passwordData.senhaAtual === passwordData.novaSenha) {
        throw new Error('A nova senha deve ser diferente da senha atual');
      }

      console.log('🔐 Alterando senha...');

      // Chamar API para alterar senha
      await userService.changePassword({
        senhaAtual: passwordData.senhaAtual.trim(),
        novaSenha: passwordData.novaSenha.trim()
      });

      console.log('✅ Senha alterada com sucesso');

      // Limpar formulário de senha
      setPasswordData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });

      setSuccess('Senha alterada com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      setError(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  // Salvar domínio (criar ou editar)
  const salvarDominio = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!formData.dominio.trim()) {
        throw new Error('Domínio é obrigatório');
      }

      // Validação específica para RSS.app
      if (formData.isRSSapp && !formData.dominio.includes('rss.app/feeds/')) {
        throw new Error('URLs do RSS.app devem conter "rss.app/feeds/" no endereço');
      }

      let result;
      if (editingDominio) {
        console.log(`📝 Atualizando domínio ID: ${editingDominio.id}`);
        result = await dominioService.atualizarComoAdmin(editingDominio.id, formData);
        setSuccess('Domínio atualizado com sucesso!');
      } else {
        console.log('➕ Criando novo domínio');
        result = await dominioService.criarComoAdmin(formData);
        setSuccess('Domínio criado com sucesso!');
      }

      console.log('✅ Operação realizada:', result);
      
      // Recarregar lista e fechar formulário
      await carregarDominios();
      resetForm();
      
    } catch (error) {
      console.error('❌ Erro ao salvar domínio:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar domínio
  const deletarDominio = async (id) => {
    if (!confirm('Tem certeza que deseja remover este domínio?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🗑️ Deletando domínio ID: ${id}`);
      await dominioService.deletarComoAdmin(id);
      setSuccess('Domínio removido com sucesso!');
      
      // Recarregar lista
      await carregarDominios();
      
    } catch (error) {
      console.error('❌ Erro ao deletar domínio:', error);
      setError(`Erro ao remover domínio: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Editar domínio
  const editarDominio = (dominio) => {
    setFormData({
      nome: dominio.nome,
      dominio: dominio.dominio,
      ativo: dominio.ativo,
      ordem: dominio.ordem?.toString() || '',
      cor: dominio.cor || '#0066CC',
      isRSSapp: dominio.isRSSapp || false
    });
    setEditingDominio(dominio);
    setShowAddForm(true);
  };

  // Verificar domínio
  const verificarDominio = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🔍 Verificando domínio ID: ${id}`);
      const resultado = await dominioService.verificarComoAdmin(id);
      
      if (resultado.verificacaoOk) {
        setSuccess(`Domínio ${resultado.dominio} verificado com sucesso!`);
      } else {
        setError(`Falha na verificação do domínio ${resultado.dominio}: ${resultado.erro}`);
      }
      
      console.log('🔍 Resultado da verificação:', resultado);
      
    } catch (error) {
      console.error('❌ Erro ao verificar domínio:', error);
      setError(`Erro ao verificar domínio: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obter contadores por tipo
  const contadores = {
    noticias: dominios.filter(d => !d.isRSSapp).length,
    rssapp: dominios.filter(d => d.isRSSapp).length
  };

  // Funções para gerenciamento de usuários

  // Salvar usuário (criar ou editar)
  const salvarUsuario = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!userFormData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!userFormData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userFormData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Para novos usuários, senha é obrigatória
      if (!editingUser && !userFormData.senha.trim()) {
        throw new Error('Senha é obrigatória para novos usuários');
      }

      // Validar senha se fornecida
      if (userFormData.senha && userFormData.senha.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      let result;
      if (editingUser) {
        console.log(`📝 Atualizando usuário ID: ${editingUser.id}`);
        // Para edição, remover senha do payload se estiver vazia
        const updateData = { ...userFormData };
        if (!updateData.senha) {
          delete updateData.senha;
        }
        result = await userService.updateUser(editingUser.id, updateData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        console.log('➕ Criando novo usuário');
        result = await userService.createUser(userFormData);
        setSuccess('Usuário criado com sucesso!');
      }

      console.log('✅ Operação realizada:', result);
      
      // Recarregar lista e fechar formulário
      await carregarUsuarios();
      resetUserForm();
      
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar usuário
  const deletarUsuario = async (id) => {
    // Verificar se não está tentando deletar o próprio usuário
    const currentUser = authAPI.getUser();
    if (currentUser && currentUser.id === id) {
      setError('Você não pode deletar sua própria conta');
      return;
    }

    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🗑️ Deletando usuário ID: ${id}`);
      await userService.deleteUser(id);
      setSuccess('Usuário removido com sucesso!');
      
      // Recarregar lista
      await carregarUsuarios();
      
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      setError(`Erro ao remover usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Editar usuário
  const editarUsuario = (usuario) => {
    setUserFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Não pré-carregar senha por segurança
      tipo: usuario.tipo,
      ativo: usuario.ativo
    });
    setEditingUser(usuario);
    setShowUserForm(true);
  };

  const menuItems = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Key },
    { id: 'dominios', label: 'Domínios RSS', icon: Globe },
    // Adicionar categoria de usuários apenas para admins
    ...(userData.tipo === 'ADMIN' ? [{ id: 'usuarios', label: 'Usuários', icon: Shield }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header title="Configurações" />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configurações do Sistema
          </h2>
          <p className="text-gray-600">
            Gerencie suas preferências e configurações da conta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu lateral */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Categorias</h3>
              
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center space-x-3 w-full p-3 text-sm text-left rounded-lg font-medium transition-colors ${
                      activeSection === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mensagens de alerta */}
            {(error || success) && (
              <div className={`p-4 rounded-lg border ${
                error 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                <div className="flex items-center space-x-2">
                  {error ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{error || success}</span>
                </div>
              </div>
            )}
            
            {/* Seção Perfil */}
            {activeSection === 'perfil' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informações do Perfil</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Atualize suas informações pessoais
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        value={userData.nome}
                        onChange={(e) => handleUserDataChange('nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Seu nome completo"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleUserDataChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="seu@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Exibir tipo de usuário (somente leitura) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Usuário
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        userData.tipo === 'ADMIN' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.tipo === 'ADMIN' ? 'Administrador' : 'Usuário'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={cancelarAlteracoesPerfil}
                      disabled={loading || !hasProfileChanges()}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={salvarPerfil}
                      disabled={loading || !hasProfileChanges()}
                      className="flex items-center space-x-2"
                    >
                      {loading && <Loader className="h-4 w-4 animate-spin" />}
                      <span>Salvar Alterações</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Segurança */}
            {activeSection === 'seguranca' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Segurança</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Altere sua senha de acesso
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Alterar Senha</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha atual *
                        </label>
                        <input
                          type="password"
                          value={passwordData.senhaAtual}
                          onChange={(e) => handlePasswordChange('senhaAtual', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Digite sua senha atual"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova senha *
                          </label>
                          <input
                            type="password"
                            value={passwordData.novaSenha}
                            onChange={(e) => handlePasswordChange('novaSenha', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Digite a nova senha"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Mínimo de 6 caracteres
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar nova senha *
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmarSenha}
                            onChange={(e) => handlePasswordChange('confirmarSenha', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              passwordData.confirmarSenha && passwordData.novaSenha !== passwordData.confirmarSenha
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="Confirme a nova senha"
                            disabled={loading}
                          />
                          {passwordData.confirmarSenha && passwordData.novaSenha !== passwordData.confirmarSenha && (
                            <p className="text-xs text-red-600 mt-1">
                              As senhas não conferem
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Indicador de força da senha */}
                      {passwordData.novaSenha && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-700 mb-2">Força da senha:</div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4].map((level) => {
                              const strength = passwordData.novaSenha.length >= 6 
                                ? Math.min(4, Math.floor(passwordData.novaSenha.length / 3) + 1)
                                : 0;
                              return (
                                <div
                                  key={level}
                                  className={`h-2 w-full rounded ${
                                    level <= strength
                                      ? strength <= 2
                                        ? 'bg-red-400'
                                        : strength === 3
                                        ? 'bg-yellow-400'
                                        : 'bg-green-400'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {passwordData.novaSenha.length < 6
                              ? 'Muito fraca'
                              : passwordData.novaSenha.length < 9
                              ? 'Fraca'
                              : passwordData.novaSenha.length < 12
                              ? 'Média'
                              : 'Forte'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPasswordData({
                          senhaAtual: '',
                          novaSenha: '',
                          confirmarSenha: ''
                        });
                        setError('');
                        setSuccess('');
                      }}
                      disabled={loading}
                    >
                      Limpar
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={alterarSenha}
                      disabled={
                        loading || 
                        !passwordData.senhaAtual || 
                        !passwordData.novaSenha || 
                        !passwordData.confirmarSenha ||
                        passwordData.novaSenha !== passwordData.confirmarSenha ||
                        passwordData.novaSenha.length < 6
                      }
                      className="flex items-center space-x-2"
                    >
                      {loading && <Loader className="h-4 w-4 animate-spin" />}
                      <span>Atualizar Senha</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            
            {/* Seção Domínios RSS */}
            {activeSection === 'dominios' && (
              <div className="space-y-6">
                {/* Header da seção */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Gerenciar Domínios RSS</span>
                      </h3>
                      <Button 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, isRSSapp: activeTab === 'rssapp' }));
                          setShowAddForm(true);
                        }}
                        className="flex items-center space-x-2"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar {activeTab === 'rssapp' ? 'RSS.app' : 'Site'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Tabs para separar os tipos */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveTab('noticias')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'noticias'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Newspaper className="h-4 w-4" />
                        <span>Sites de Notícias</span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                          {contadores.noticias}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('rssapp')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'rssapp'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Rss className="h-4 w-4" />
                        <span>RSS.app Feeds</span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                          {contadores.rssapp}
                        </span>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-3">
                      {activeTab === 'noticias' 
                        ? 'Configure sites de notícias tradicionais (ex: CNN, G1, Folha)' 
                        : 'Configure feeds RSS do RSS.app para newsletters e fontes específicas'
                      }
                    </p>
                  </div>

                  {/* Barra de busca */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder={`Buscar ${activeTab === 'rssapp' ? 'feeds RSS.app' : 'sites de notícias'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Lista de domínios */}
                  <div className="p-6">
                    {loading && dominios.length === 0 ? (
                      <div className="text-center py-8">
                        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-500">Carregando domínios...</p>
                      </div>
                    ) : dominiosFiltrados.length === 0 ? (
                      <div className="text-center py-8">
                        {activeTab === 'rssapp' ? (
                          <Rss className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        ) : (
                          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? 'Nenhum resultado encontrado' : `Nenhum ${activeTab === 'rssapp' ? 'feed RSS.app' : 'site de notícias'} cadastrado`}
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm 
                            ? 'Tente ajustar sua busca'
                            : `Adicione o primeiro ${activeTab === 'rssapp' ? 'feed RSS.app' : 'site de notícias'}`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dominiosFiltrados.map((dominio) => (
                          <div 
                            key={dominio.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {dominio.isRSSapp ? (
                                  <Rss className="h-5 w-5 text-orange-500" />
                                ) : (
                                  <Newspaper className="h-5 w-5 text-blue-500" />
                                )}
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: dominio.cor || '#0066CC' }}
                                />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{dominio.nome}</h4>
                                  {dominio.ativo ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{dominio.dominio}</p>
                                {dominio.ordem && (
                                  <p className="text-xs text-gray-400">Ordem: {dominio.ordem}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verificarDominio(dominio.id)}
                                disabled={loading}
                                className="flex items-center space-x-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Verificar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editarDominio(dominio)}
                                disabled={loading}
                                className="flex items-center space-x-1"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletarDominio(dominio.id)}
                                disabled={loading}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Excluir</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulário de adicionar/editar */}
                {showAddForm && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                          {formData.isRSSapp ? (
                            <Rss className="h-5 w-5 text-orange-500" />
                          ) : (
                            <Newspaper className="h-5 w-5 text-blue-500" />
                          )}
                          <span>
                            {editingDominio ? 'Editar' : 'Adicionar'} {formData.isRSSapp ? 'Feed RSS.app' : 'Site de Notícias'}
                          </span>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetForm}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            placeholder={formData.isRSSapp ? "ex: Newsletter do Marco" : "ex: CNN Brasil"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {formData.isRSSapp ? 'URL do RSS.app *' : 'Domínio ou URL *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.dominio}
                            onChange={(e) => setFormData({...formData, dominio: e.target.value})}
                            placeholder={
                              formData.isRSSapp 
                                ? "ex: https://rss.app/feeds/XjP78XjMA3Q3GgQN.xml"
                                : "ex: cnnbrasil.com.br ou https://www.cnnbrasil.com.br/politica/"
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.isRSSapp 
                              ? 'URL completa do feed RSS.app (deve conter "rss.app/feeds/")'
                              : 'Aceita domínios simples (exemplo.com.br) ou URLs completas (https://exemplo.com/secao/)'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo
                          </label>
                          <select
                            value={formData.isRSSapp}
                            onChange={(e) => setFormData({...formData, isRSSapp: e.target.value === 'true'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="false">Site de Notícias</option>
                            <option value="true">RSS.app Feed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ordem
                          </label>
                          <input
                            type="number"
                            value={formData.ordem}
                            onChange={(e) => setFormData({...formData, ordem: e.target.value})}
                            placeholder="1, 2, 3..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cor
                          </label>
                          <input
                            type="color"
                            value={formData.cor}
                            onChange={(e) => setFormData({...formData, cor: e.target.value})}
                            className="w-full h-10 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={formData.ativo}
                            onChange={(e) => setFormData({...formData, ativo: e.target.value === 'true'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={salvarDominio}
                          disabled={loading}
                          className="flex items-center space-x-2"
                        >
                          {loading && <Loader className="h-4 w-4 animate-spin" />}
                          <span>{editingDominio ? 'Atualizar' : 'Criar'} {formData.isRSSapp ? 'Feed' : 'Domínio'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seção Usuários (apenas para admins) */}
            {activeSection === 'usuarios' && userData.tipo === 'ADMIN' && (
              <div className="space-y-6">
                {/* Header da seção */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Gerenciar Usuários</span>
                      </h3>
                      <Button 
                        onClick={() => setShowUserForm(true)}
                        className="flex items-center space-x-2"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Usuário</span>
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Gerencie contas de usuário do sistema
                    </p>
                  </div>

                  {/* Filtros e busca */}
                  <div className="p-6 border-b border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Buscar usuários..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <select
                        value={userFilters.tipo}
                        onChange={(e) => setUserFilters({...userFilters, tipo: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="ADMIN">Administradores</option>
                        <option value="USUARIO">Usuários</option>
                      </select>
                      
                      <select
                        value={userFilters.ativo === undefined ? '' : userFilters.ativo.toString()}
                        onChange={(e) => setUserFilters({
                          ...userFilters, 
                          ativo: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Todos os status</option>
                        <option value="true">Ativos</option>
                        <option value="false">Inativos</option>
                      </select>
                    </div>
                  </div>

                  {/* Lista de usuários */}
                  <div className="p-6">
                    {loading && (!Array.isArray(usuarios) || usuarios.length === 0) ? (
                      <div className="text-center py-8">
                        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-500">Carregando usuários...</p>
                      </div>
                    ) : !Array.isArray(usuarios) || usuarios.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {userSearchTerm || userFilters.tipo || userFilters.ativo !== undefined 
                            ? 'Nenhum resultado encontrado' 
                            : 'Nenhum usuário cadastrado'
                          }
                        </h3>
                        <p className="text-gray-500">
                          {userSearchTerm || userFilters.tipo || userFilters.ativo !== undefined
                            ? 'Tente ajustar seus filtros'
                            : 'Adicione o primeiro usuário'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Array.isArray(usuarios) && usuarios.map((usuario) => {
                          const currentUser = authAPI.getUser();
                          const isCurrentUser = currentUser && currentUser.id === usuario.id;
                          
                          return (
                            <div 
                              key={usuario.id}
                              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                                isCurrentUser 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  {usuario.tipo === 'ADMIN' ? (
                                    <Shield className="h-5 w-5 text-blue-500" />
                                  ) : (
                                    <User className="h-5 w-5 text-gray-500" />
                                  )}
                                  {usuario.ativo ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">
                                      {usuario.nome}
                                      {isCurrentUser && (
                                        <span className="text-blue-600 text-sm ml-2">(Você)</span>
                                      )}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-gray-500">{usuario.email}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      usuario.tipo === 'ADMIN' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {usuario.tipo === 'ADMIN' ? 'Admin' : 'Usuário'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      usuario.ativo 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editarUsuario(usuario)}
                                  disabled={loading}
                                  className="flex items-center space-x-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span>Editar</span>
                                </Button>
                                {!isCurrentUser && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deletarUsuario(usuario.id)}
                                    disabled={loading}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Excluir</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulário de adicionar/editar usuário */}
                {showUserForm && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>{editingUser ? 'Editar' : 'Adicionar'} Usuário</span>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetUserForm}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={userFormData.nome}
                            onChange={(e) => setUserFormData({...userFormData, nome: e.target.value})}
                            placeholder="Nome completo do usuário"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                            placeholder="email@exemplo.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {editingUser ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}
                          </label>
                          <input
                            type="password"
                            required={!editingUser}
                            value={userFormData.senha}
                            onChange={(e) => setUserFormData({...userFormData, senha: e.target.value})}
                            placeholder={editingUser ? "Nova senha (opcional)" : "Senha do usuário"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Mínimo de 6 caracteres
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de usuário *
                          </label>
                          <select
                            value={userFormData.tipo}
                            onChange={(e) => setUserFormData({...userFormData, tipo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="USUARIO">Usuário</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={userFormData.ativo}
                            onChange={(e) => setUserFormData({...userFormData, ativo: e.target.value === 'true'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetUserForm}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={salvarUsuario}
                          disabled={loading}
                          className="flex items-center space-x-2"
                        >
                          {loading && <Loader className="h-4 w-4 animate-spin" />}
                          <span>{editingUser ? 'Atualizar' : 'Criar'} Usuário</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;