import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, CubeLogo } from '../components/ui';
import { useAuth } from '../hooks/useAuth.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegar a rota de onde o usuário veio, ou usar dashboard como padrão
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  setErrors({});

  try {
    const result = await login({
      email: formData.email,
      senha: formData.password
    });

    if (result.success) {
      console.log('✅ Login bem-sucedido:', result.user);
      navigate(from, { replace: true });
    } else {
      setErrors({ 
        general: result.error || 'Erro ao fazer login. Tente novamente.' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    setErrors({ 
      general: 'Erro inesperado. Tente novamente.' 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 gradient-bg rounded-xl flex items-center justify-center mb-6 shadow-lg p-3">
            <CubeLogo 
              className="h-20 w-auto" 
              shadow={true}
              shadowColor="rgba(0, 0, 0, 0.3)"
              shadowBlur="4px"
              shadowOffset="1px"
            />
          </div>
          <h2 className="text-3xl font-bold text-slate-700 mb-2">
            Bem-vindo ao CUBE
          </h2>
          <p className="text-slate-500">
            Transforme dados em decisões inteligentes!
          </p>
        </div>

        {/* Formulário */}
        <div className="card py-8 px-6 shadow-xl">
          <div className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Usuário ou E-mail"
                value={formData.email}
                onChange={handleInputChange('email')}
                icon={Mail}
                error={errors.email}
                disabled={loading}
              />

              <Input
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange('password')}
                icon={Lock}
                error={errors.password}
                disabled={loading}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
              onClick={handleSubmit}
            >
              Entrar
            </Button>
          </div>

          {/* Debug info - remover em produção */}
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            CUBE v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;