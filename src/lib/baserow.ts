// Configuração do Baserow
const BASEROW_CONFIG = {
  apiToken: import.meta.env.VITE_BASEROW_API_TOKEN || "wT4NNP5hwTaVuzixirWycVT4D4xDRorE",
  baseUrl: import.meta.env.VITE_BASEROW_BASE_URL || "https://api.baserow.io/api",
  databaseId: import.meta.env.VITE_BASEROW_DATABASE_ID || "256831", // Será configurado
  tables: {
    clients: import.meta.env.VITE_BASEROW_CLIENTS_TABLE_ID || "765433", // Será configurado
    scripts: import.meta.env.VITE_BASEROW_SCRIPTS_TABLE_ID || "765434"  // Será configurado
  }
};

// Verificar se as configurações do Baserow estão disponíveis
const hasBaserowConfig = () => {
  return BASEROW_CONFIG.apiToken && 
         BASEROW_CONFIG.apiToken !== "your-api-token-here" &&
         BASEROW_CONFIG.databaseId &&
         BASEROW_CONFIG.databaseId !== "your-database-id";
};

// Função para fazer requisições ao Baserow
export const baserowRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASEROW_CONFIG.baseUrl}${endpoint}`;
  
  const defaultHeaders = {
    'Authorization': `Token ${BASEROW_CONFIG.apiToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Baserow API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Função para verificar se Baserow está disponível
export const isBaserowAvailable = () => {
  return hasBaserowConfig();
};

// Testar conexão com Baserow
export const testBaserowConnection = async () => {
  try {
    if (!hasBaserowConfig()) {
      return { success: false, message: "Baserow não configurado" };
    }

    // Tentar buscar informações do banco
    await baserowRequest(`/database/${BASEROW_CONFIG.databaseId}/`);
    console.log("✅ Baserow conectado com sucesso");
    return { success: true, message: "Conectado ao Baserow" };
  } catch (error) {
    console.warn("⚠️ Erro ao conectar Baserow:", error);
    return { success: false, message: `Erro: ${error}` };
  }
};

export { BASEROW_CONFIG };
export default BASEROW_CONFIG;