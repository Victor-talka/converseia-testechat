// Configuração do Baserow
const BASEROW_CONFIG = {
  apiToken: import.meta.env.VITE_BASEROW_API_TOKEN || "wT4NNP5hwTaVuzixirWycVT4D4xDRorE",
  baseUrl: import.meta.env.VITE_BASEROW_BASE_URL || "https://api.baserow.io",
  databaseId: import.meta.env.VITE_BASEROW_DATABASE_ID || "296836",
  tables: {
    clients: import.meta.env.VITE_BASEROW_CLIENTS_TABLE_ID || "689319",
    scripts: import.meta.env.VITE_BASEROW_SCRIPTS_TABLE_ID || "689333"
  }
};

// Verificar se as configurações do Baserow estão disponíveis
const hasBaserowConfig = () => {
  // Desabilitado temporariamente para evitar erros 400
  // Remover este return false quando o Baserow estiver configurado corretamente
  return false;
  
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

  console.log(`Baserow Request: ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('Request Body:', options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Baserow API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Baserow API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Baserow Response:', result);
  return result;
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

    console.log("🔍 Testando conexão Baserow...");
    console.log("Config:", {
      baseUrl: BASEROW_CONFIG.baseUrl,
      databaseId: BASEROW_CONFIG.databaseId,
      apiToken: BASEROW_CONFIG.apiToken ? "***" + BASEROW_CONFIG.apiToken.slice(-4) : "não definido"
    });

    // Tentar buscar as tabelas do banco
    const response = await baserowRequest(`/api/database/${BASEROW_CONFIG.databaseId}/tables/`);
    console.log("✅ Baserow conectado com sucesso", response);
    return { success: true, message: "Conectado ao Baserow" };
  } catch (error) {
    console.warn("⚠️ Erro ao conectar Baserow:", error);
    return { success: false, message: `Erro: ${error}` };
  }
};

export { BASEROW_CONFIG };
export default BASEROW_CONFIG;