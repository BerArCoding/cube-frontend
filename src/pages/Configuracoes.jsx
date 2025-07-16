import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui';
import dominioService from '../services/dominioService';
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
  const [formData, setFormData] = useState({
    nome: '',
    dominio: '',
    ativo: true,
    ordem: '',
    cor: '#0066CC',
    isRSSapp: false
  });

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

  useEffect(() => {
    if (activeSection === 'dominios') {
      carregarDominios();
    }
  }, [activeSection]);

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

  const menuItems = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Key },
    { id: 'dominios', label: 'Domínios RSS', icon: Globe }
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
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Seu cargo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografia
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary">
                      Salvar Alterações
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
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Alterar Senha</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha atual
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova senha
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar nova senha
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Autenticação em Duas Etapas</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">2FA habilitado</p>
                        <p className="text-xs text-gray-500">Adicione uma camada extra de segurança</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary">
                      Atualizar Senha
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;