import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScriptInput from "@/components/ScriptInput";
import { ConfigStatus } from "@/components/ConfigStatus";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar se está acessando via subdomínio
    const hostname = window.location.hostname;
    console.log('🔍 Index detectando hostname:', hostname);

    // Lista de domínios base
    const dominiosBase = ['converseia.com', 'localhost', 'vercel.app'];

    // Verificar se é um subdomínio
    for (const dominioBase of dominiosBase) {
      if (hostname.endsWith(dominioBase) && hostname !== dominioBase) {
        const subdomain = hostname.replace(`.${dominioBase}`, '');
        
        // Ignorar subdomínios reservados
        const subdomainReservados = ['www', 'api', 'admin', 'mail', 'ftp', 'chat-teste'];
        if (!subdomainReservados.includes(subdomain)) {
          console.log('✅ Subdomínio detectado:', subdomain, '→ Redirecionando para Preview');
          navigate(`/${subdomain}`, { replace: true });
          return;
        }
      }
    }

    console.log('💻 Domínio principal → Carregando página de criação');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ConfigStatus />
        <ScriptInput />
      </div>
    </div>
  );
};

export default Index;
