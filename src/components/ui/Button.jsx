import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white focus:ring-orange-300 disabled:bg-orange-300',
    secondary: 'bg-slate-500 hover:bg-slate-600 active:bg-slate-700 text-white focus:ring-slate-300 disabled:bg-slate-300',
    outline: 'border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-200',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-200'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;