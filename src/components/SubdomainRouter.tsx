import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente que detecta subdomínio e redireciona para Preview
 * Usado na rota raiz "/" quando acessado via subdomínio
 */
export const SubdomainRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    console.log('🔍 SubdomainRouter detectando hostname:', hostname);

    // Lista de domínios base (principais)
    const dominiosBase = [
      'converseia.com',
      'localhost',
      'vercel.app'
    ];

    // Verificar se é um subdomínio
    let isSubdomain = false;
    let subdomain = '';

    for (const dominioBase of dominiosBase) {
      if (hostname.endsWith(dominioBase) && hostname !== dominioBase) {
        // Extrair subdomínio
        subdomain = hostname.replace(`.${dominioBase}`, '');

        // Ignorar subdomínios reservados (admin, etc)
        const subdomainReservados = ['www', 'api', 'admin', 'mail', 'ftp', 'chat-teste'];
        if (!subdomainReservados.includes(subdomain)) {
          isSubdomain = true;
          break;
        }
      }
    }

    if (isSubdomain && subdomain) {
      console.log('✅ Subdomínio detectado na raiz, redirecionando para Preview com slug:', subdomain);
      // Redireciona para a rota com slug
      navigate(`/${subdomain}`, { replace: true });
    } else {
      console.log('❌ Nenhum subdomínio de cliente, permanecendo na Index');
    }
  }, [navigate, location]);

  // Enquanto detecta, pode mostrar loading ou null
  return null;
};
