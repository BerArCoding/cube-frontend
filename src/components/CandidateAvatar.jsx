import React from 'react';
import { UserMinus } from 'lucide-react';

const CandidateAvatar = ({ 
  candidate, 
  size = 'md', 
  showStatus = true,
  className = '' 
}) => {
  // Tamanhos predefinidos
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  // Função para fazer proxy da imagem do Instagram
  const getProxiedImageUrl = (instagramUrl) => {
    if (!instagramUrl || !instagramUrl.includes('instagram')) {
      return instagramUrl;
    }
    
    // Usa um serviço de proxy CORS público
    return `https://images.weserv.nl/?url=${encodeURIComponent(instagramUrl)}&w=400&h=400&fit=cover&a=smart`;
  };

  // Prioridade: 1) profilePicUrlHD (Instagram HD com proxy), 2) foto (URL manual), 3) inicial
  const avatarUrl = candidate.profilePicUrlHD 
    ? getProxiedImageUrl(candidate.profilePicUrlHD)
    : candidate.foto;
    
  const fallbackInitial = candidate.nome?.charAt(0)?.toUpperCase() || '?';
  
  const handleImageError = (e) => {
    console.log('❌ Erro ao carregar imagem:', e.target.src);
    // Se a foto com proxy falhar, tenta a foto normal
    if (candidate.foto && e.target.src.includes('weserv.nl')) {
      console.log('🔄 Tentando foto backup:', candidate.foto);
      e.target.src = candidate.foto;
    } else {
      // Se ambas falharem, mostra a inicial
      console.log('💥 Todas as fotos falharam, mostrando inicial');
      e.target.style.display = 'none';
      e.target.nextElementSibling.style.display = 'flex';
    }
  };

  return (
    <div className={`${sizes[size]} rounded-lg overflow-hidden bg-slate-100 relative ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={candidate.nome}
          className="h-full w-full object-cover"
          onError={handleImageError}
          onLoad={() => console.log('✅ Foto carregada com sucesso:', avatarUrl)}
          referrerPolicy="no-referrer"
        />
      ) : null}
      
      {/* Fallback inicial - mostra se não tiver URL ou se der erro */}
      <div 
        className={`h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium ${
          avatarUrl ? 'hidden' : 'flex'
        }`}
        style={{ 
          fontSize: size === 'sm' ? '0.75rem' : 
                   size === 'lg' ? '1.5rem' : 
                   size === 'xl' ? '2rem' : '1rem'
        }}
      >
        {fallbackInitial}
      </div>
      
      {/* Overlay para candidatos inativos */}
      {showStatus && !candidate.ativo && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <UserMinus className={`text-white ${
            size === 'sm' ? 'h-3 w-3' : 
            size === 'lg' ? 'h-6 w-6' : 
            size === 'xl' ? 'h-8 w-8' : 'h-4 w-4'
          }`} />
        </div>
      )}
      

    </div>
  );
};

export default CandidateAvatar;