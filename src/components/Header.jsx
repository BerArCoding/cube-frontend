import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { Button, CubeLogo } from './ui';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  Shield, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const Header = ({ title = "CUBE Dashboard" }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-20 p-2 gradient-bg rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CubeLogo className="h-6 w-auto" shadow={false} />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 transition-all duration-200 hover:shadow-md"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="h-8 w-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {isAdmin() && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <Shield className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700 truncate max-w-32">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center space-x-1">
                    {isAdmin() ? (
                      <>
                        <Shield className="h-3 w-3" />
                        <span>Administrador</span>
                      </>
                    ) : (
                      <span>Usuário</span>
                    )}
                  </p>
                </div>

                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                  {/* User Info */}
                  <div className="px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">
                          {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {isAdmin() && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center ring-2 ring-white">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.nome}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {isAdmin() && (
                          <span className="inline-flex items-center space-x-1 mt-2 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                            <Shield className="h-3 w-3" />
                            <span>Administrador</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                      <div className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium">Meu Perfil</span>
                        <p className="text-xs text-slate-500">Editar informações pessoais</p>
                      </div>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors group">
                      <div className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <Settings className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium">Configurações</span>
                        <p className="text-xs text-slate-500">Preferências do sistema</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/rss-feed');
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-1 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="font-medium">RSS Feed</span>
                        <p className="text-xs text-slate-500">Ultimas noticias</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <div className="p-1 rounded-md bg-red-100 group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium">Sair</span>
                        <p className="text-xs text-red-500">Encerrar sessão</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Title */}
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            </div>

            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {isAdmin() && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{user?.nome}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2">
              
              <button className="flex items-center space-x-3 w-full p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <User className="h-4 w-4" />
                <span>Meu Perfil</span>
              </button>
              <button className="flex items-center space-x-3 w-full p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </button>
              <button 
                onClick={() => {
                  navigate('/rss-feed');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span>RSS Feed</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;