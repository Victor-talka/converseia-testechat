/**
 * Serviço para integração com a API do Vercel
 * Permite adicionar domínios automaticamente ao projeto
 */

const VERCEL_API_TOKEN = import.meta.env.VITE_VERCEL_API_TOKEN || '';
const VERCEL_PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID || '';
const VERCEL_TEAM_ID = import.meta.env.VITE_VERCEL_TEAM_ID || '';

const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * Verifica se as credenciais do Vercel estão configuradas
 */
export const hasVercelConfig = (): boolean => {
  const hasConfig = !!VERCEL_API_TOKEN && !!VERCEL_PROJECT_ID;
  console.log('🔧 Vercel Config:', {
    hasToken: !!VERCEL_API_TOKEN,
    hasProjectId: !!VERCEL_PROJECT_ID,
    hasTeamId: !!VERCEL_TEAM_ID
  });
  return hasConfig;
};

/**
 * Adiciona um domínio ao projeto Vercel
 * @param subdomain - Slug do cliente (ex: "empresa-abc")
 * @returns Promise com sucesso ou erro
 */
export const addDomainToVercel = async (subdomain: string): Promise<{
  success: boolean;
  domain?: string;
  message?: string;
}> => {
  if (!hasVercelConfig()) {
    console.warn('⚠️ Vercel API não configurada - domínio não será adicionado automaticamente');
    return {
      success: false,
      message: 'Vercel API não configurada. Configure VITE_VERCEL_API_TOKEN e VITE_VERCEL_PROJECT_ID'
    };
  }

  const domain = `${subdomain}.converseia.com`;
  console.log(`🌐 Tentando adicionar domínio ao Vercel: ${domain}`);

  try {
    const url = VERCEL_TEAM_ID
      ? `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
      : `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Domínio já existe é considerado sucesso
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_taken') {
        console.log(`✅ Domínio ${domain} já existe no Vercel`);
        return {
          success: true,
          domain,
          message: 'Domínio já configurado'
        };
      }

      console.error('❌ Erro ao adicionar domínio no Vercel:', data);
      return {
        success: false,
        message: data.error?.message || 'Erro ao adicionar domínio'
      };
    }

    console.log(`✅ Domínio ${domain} adicionado com sucesso ao Vercel!`);
    return {
      success: true,
      domain,
      message: 'Domínio adicionado com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro na API do Vercel:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Remove um domínio do projeto Vercel
 * @param subdomain - Slug do cliente
 */
export const removeDomainFromVercel = async (subdomain: string): Promise<{
  success: boolean;
  message?: string;
}> => {
  if (!hasVercelConfig()) {
    return {
      success: false,
      message: 'Vercel API não configurada'
    };
  }

  const domain = `${subdomain}.converseia.com`;
  console.log(`🗑️ Tentando remover domínio do Vercel: ${domain}`);

  try {
    const url = VERCEL_TEAM_ID
      ? `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
      : `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('❌ Erro ao remover domínio:', data);
      return {
        success: false,
        message: data.error?.message || 'Erro ao remover domínio'
      };
    }

    console.log(`✅ Domínio ${domain} removido com sucesso!`);
    return {
      success: true,
      message: 'Domínio removido com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao remover domínio:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Lista todos os domínios do projeto
 */
export const listVercelDomains = async (): Promise<string[]> => {
  if (!hasVercelConfig()) {
    return [];
  }

  try {
    const url = VERCEL_TEAM_ID
      ? `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
      : `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Erro ao listar domínios');
      return [];
    }

    const data = await response.json();
    return data.domains?.map((d: any) => d.name) || [];

  } catch (error) {
    console.error('❌ Erro ao listar domínios:', error);
    return [];
  }
};
