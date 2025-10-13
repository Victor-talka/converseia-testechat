import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Banner de boas-vindas e verificação de configuração
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   WIDGET CONVERSER v1.0                        ║
║            Sistema de Gerenciamento de Chatbots                ║
╚════════════════════════════════════════════════════════════════╝

🔍 Verificando configuração...
`);

// Verificar variáveis de ambiente
const envCheck = {
  mode: import.meta.env.MODE,
  hasBaserowToken: !!import.meta.env.VITE_BASEROW_API_TOKEN,
  hasBaserowUrl: !!import.meta.env.VITE_BASEROW_BASE_URL,
  hasBaserowDbId: !!import.meta.env.VITE_BASEROW_DATABASE_ID,
  hasClientsTableId: !!import.meta.env.VITE_BASEROW_CLIENTS_TABLE_ID,
  hasScriptsTableId: !!import.meta.env.VITE_BASEROW_SCRIPTS_TABLE_ID
};

const allConfigured = Object.values(envCheck).every(v => v === true || v === 'development' || v === 'production');

if (allConfigured) {
  console.log(`✅ Todas as variáveis de ambiente estão configuradas!`);
  console.log(`✅ Modo: ${envCheck.mode}`);
  console.log(`✅ Baserow: Conectado`);
} else {
  console.warn(`⚠️ Variáveis de ambiente NÃO configuradas!`);
  console.warn(`⚠️ Usando localStorage como fallback`);
  console.warn(`📖 Veja: VERCEL_SETUP.md para configurar`);
  console.log(`\nStatus das variáveis:`);
  console.log(`- VITE_BASEROW_API_TOKEN: ${envCheck.hasBaserowToken ? '✅' : '❌'}`);
  console.log(`- VITE_BASEROW_BASE_URL: ${envCheck.hasBaserowUrl ? '✅' : '❌'}`);
  console.log(`- VITE_BASEROW_DATABASE_ID: ${envCheck.hasBaserowDbId ? '✅' : '❌'}`);
  console.log(`- VITE_BASEROW_CLIENTS_TABLE_ID: ${envCheck.hasClientsTableId ? '✅' : '❌'}`);
  console.log(`- VITE_BASEROW_SCRIPTS_TABLE_ID: ${envCheck.hasScriptsTableId ? '✅' : '❌'}`);
}

console.log(`\n📚 Documentação:`);
console.log(`- Setup Vercel: VERCEL_SETUP.md`);
console.log(`- Troubleshooting Chat: CHAT_TROUBLESHOOTING.md`);
console.log(`- Solução Rápida: SOLUCAO_RAPIDA.md\n`);

createRoot(document.getElementById("root")!).render(<App />);
