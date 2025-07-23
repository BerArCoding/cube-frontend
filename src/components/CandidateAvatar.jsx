import React, { useState, useCallback } from 'react';
import { UserMinus } from 'lucide-react';

const CandidateAvatar = ({ 
  candidate = {}, // ✅ Valor padrão para evitar erros de undefined
  size = 'md', 
  showStatus = true,
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // ✅ Tamanhos predefinidos como constante
  const SIZES = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
    xxl: 'h-24 w-24',
    xxxl: 'h-32 w-32'
  };

  // ✅ Função para fazer proxy da imagem do Instagram otimizada
  const getProxiedImageUrl = useCallback((instagramUrl) => {
    if (!instagramUrl || typeof instagramUrl !== 'string' || !instagramUrl.includes('instagram')) {
      return instagramUrl;
    }
    
    try {
      // Usa um serviço de proxy CORS público
      return `https://images.weserv.nl/?url=${encodeURIComponent(instagramUrl)}&w=400&h=400&fit=cover&a=smart`;
    } catch (error) {
      console.warn('Erro ao processar URL da imagem:', error);
      return instagramUrl;
    }
  }, []);

  // ✅ Melhor tratamento de erro de imagem
  const handleImageError = useCallback((e) => {
    console.log('❌ Erro ao carregar imagem:', e.target.src);
    
    // Se a foto com proxy falhar, tenta a foto normal
    if (candidate?.foto && e.target.src.includes('weserv.nl') && !fallbackError) {
      console.log('🔄 Tentando foto backup:', candidate.foto);
      e.target.src = candidate.foto;
      setFallbackError(true);
    } else {
      // Se ambas falharem, mostra a inicial
      console.log('💥 Todas as fotos falharam, mostrando inicial');
      setImageError(true);
    }
  }, [candidate?.foto, fallbackError]);

  // ✅ Verificações de segurança
  const avatarUrl = !imageError && (
    candidate?.profilePicUrlHD 
      ? getProxiedImageUrl(candidate.profilePicUrlHD)
      : candidate?.foto
  );
    
  const fallbackInitial = candidate?.nome?.charAt(0)?.toUpperCase() || '?';
  
  // ✅ Tamanho de fonte baseado no tamanho do avatar
  const getFontSize = () => {
    switch(size) {
      case 'sm': return '0.75rem';
      case 'lg': return '1.5rem';
      case 'xl': return '2rem';
      default: return '1rem';
    }
  };

  // ✅ Tamanho do ícone baseado no tamanho do avatar
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-8 w-8';
      default: return 'h-4 w-4';
    }
  };

  return (
    <div className={`${SIZES[size]} rounded-lg overflow-hidden bg-slate-100 relative ${className}`}>
      {/* Imagem do candidato */}
      {avatarUrl && !imageError && (
        <img
          src={avatarUrl}
          alt={candidate?.nome || 'Avatar do candidato'}
          className="h-full w-full object-cover"
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
      
      {/* Fallback inicial - mostra se não tiver URL ou se der erro */}
      {(!avatarUrl || imageError) && (
        <div 
          className="h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium"
          style={{ fontSize: getFontSize() }}
        >
          {fallbackInitial}
        </div>
      )}
      
      {/* Overlay para candidatos inativos */}
      {showStatus && candidate?.ativo === false && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <UserMinus className={`text-white ${getIconSize()}`} />
        </div>
      )}
    </div>
  );
};

export default CandidateAvatar;