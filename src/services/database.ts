import { baserowRequest, isBaserowAvailable, BASEROW_CONFIG } from '../lib/baserow';
import { Client, ChatScript, CreateClientData, CreateScriptData } from '../types/database';

// Chaves para localStorage
const STORAGE_KEYS = {
  clients: 'widget-converser-clients',
  scripts: 'widget-converser-scripts'
};

// Utilitários para localStorage
const localStorage_utils = {
  getClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.clients);
      return data ? JSON.parse(data).map((client: any) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt)
      })) : [];
    } catch {
      return [];
    }
  },
  
  saveClients(clients: Client[]): void {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  },
  
  getScripts(): ChatScript[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.scripts);
      return data ? JSON.parse(data).map((script: any) => ({
        ...script,
        createdAt: new Date(script.createdAt),
        updatedAt: new Date(script.updatedAt)
      })) : [];
    } catch {
      return [];
    }
  },
  
  saveScripts(scripts: ChatScript[]): void {
    localStorage.setItem(STORAGE_KEYS.scripts, JSON.stringify(scripts));
  },
  
  // FIX 2: Gerar um ID numérico para compatibilidade com o Baserow
  generateId(): string {
    // Gera um ID baseado no tempo e um número aleatório, garantindo que seja numérico.
    return String(Date.now() + Math.floor(Math.random() * 1000));
  }
};

// Mapeamento de campos Baserow para nossa aplicação
const mapBaserowClient = (row: any): Client => ({
  id: row.id.toString(),
  name: row.field_5700970 || '',
  email: row.field_5701032 || '',
  company: row.field_5701033 || '',
  createdAt: new Date(row.created_on || Date.now()),
  updatedAt: new Date(row.updated_on || Date.now())
});

const mapBaserowScript = (row: any): ChatScript => ({
  id: row.id.toString(),
  clientId: row.field_5701034?.toString() || '',
  clientName: row.field_5701038 || '',
  script: row.field_5701039 || '',
  title: row.field_5701040 || '',
  isActive: row.field_5701041 !== false,
  createdAt: new Date(row.created_on || Date.now()),
  updatedAt: new Date(row.updated_on || Date.now())
});

// Serviços para Clientes
export const clientService = {
  // Criar novo cliente
  async create(data: CreateClientData): Promise<string> {
    if (isBaserowAvailable()) {
      try {
        const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.clients}/`, {
          method: 'POST',
          body: JSON.stringify({
            field_5700970: data.name,     // name
            field_5701032: data.email || '',  // email 
            field_5701033: data.company || '' // company
          })
        });
        return response.id.toString();
      } catch (e) {
        console.warn('[clientService.create] Falha Baserow, usando localStorage:', e);
        return this.createLocal(data);
      }
    }
    return this.createLocal(data);
  },

  createLocal(data: CreateClientData): string {
    const clients = localStorage_utils.getClients();
    const newClient: Client = {
      id: localStorage_utils.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    clients.push(newClient);
    localStorage_utils.saveClients(clients);
    return newClient.id;
  },

  // Listar todos os clientes
  async getAll(): Promise<Client[]> {
    if (isBaserowAvailable()) {
      try {
        // FIX 1: Removido '?order_by=-created_on' para evitar Bad Request
        const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.clients}/`);
        return response.results.map(mapBaserowClient);
      } catch (error) {
        console.error('Erro ao buscar clientes no Baserow, usando localStorage:', error);
        return this.getAllLocal();
      }
    } else {
      return this.getAllLocal();
    }
  },

  getAllLocal(): Client[] {
    return localStorage_utils.getClients().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Atualizar cliente
  async update(id: string, data: Partial<CreateClientData>): Promise<void> {
    if (isBaserowAvailable()) {
      try {
        await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.clients}/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            field_5700970: data.name,
            field_5701032: data.email || '',
            field_5701033: data.company || ''
          })
        });
        return;
      } catch (e) {
        console.warn('[clientService.update] Falha Baserow, fallback local:', e);
      }
    }

    const clients = localStorage_utils.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data, updatedAt: new Date() };
      localStorage_utils.saveClients(clients);
    }
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    if (isBaserowAvailable()) {
      try {
        await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.clients}/${id}/`, {
          method: 'DELETE'
        });
        return;
      } catch (e) {
        console.warn('[clientService.delete] Falha Baserow, fallback local:', e);
      }
    }

    const clients = localStorage_utils.getClients();
    const filtered = clients.filter(c => c.id !== id);
    localStorage_utils.saveClients(filtered);
  }
};

// Serviços para Scripts de Chat
export const scriptService = {
  // Criar novo script
  async create(data: CreateScriptData): Promise<string> {
    if (isBaserowAvailable()) {
      try {
        const clientIdNumber = parseInt(data.clientId);
        if (isNaN(clientIdNumber)) throw new Error(`ID do cliente inválido: ${data.clientId}`);
        const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/`, {
          method: 'POST',
            body: JSON.stringify({
            field_5701034: clientIdNumber,
            field_5701038: data.clientName,
            field_5701039: data.script,
            field_5701040: data.title || `Script - ${data.clientName}`,
            field_5701041: true
          })
        });
        return response.id.toString();
      } catch (e) {
        console.warn('[scriptService.create] Falha Baserow, usando localStorage:', e);
        return this.createLocal(data);
      }
    }
    return this.createLocal(data);
  },

  createLocal(data: CreateScriptData): string {
    const scripts = localStorage_utils.getScripts();
    const newScript: ChatScript = {
      id: localStorage_utils.generateId(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    scripts.push(newScript);
    localStorage_utils.saveScripts(scripts);
    return newScript.id;
  },

  // Listar todos os scripts
  async getAll(): Promise<ChatScript[]> {
    if (isBaserowAvailable()) {
      try {
        // FIX 1: Removido '?order_by=-created_on' para evitar Bad Request
        const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/`);
        return response.results.map(mapBaserowScript);
      } catch (error) {
        console.error('Erro ao buscar scripts no Baserow, usando localStorage:', error);
        return this.getAllLocal();
      }
    } else {
      return this.getAllLocal();
    }
  },

  getAllLocal(): ChatScript[] {
    return localStorage_utils.getScripts().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Buscar script por ID
  async getById(id: string): Promise<ChatScript | null> {
    if (isBaserowAvailable()) {
      try {
        const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/${id}/`);
        return mapBaserowScript(response);
      } catch (error) {
        console.error('Erro ao buscar script no Baserow, usando localStorage:', error);
      }
    }
    
    // Local fallback + compatibilidade com localStorage antigo
    const scripts = localStorage_utils.getScripts();
    const found = scripts.find(script => script.id === id);
    
    if (found) return found;
    
    // Compatibilidade com sistema antigo
    try {
      const storedScripts = localStorage.getItem("chatbot-scripts");
      if (storedScripts) {
        const oldScripts = JSON.parse(storedScripts);
        const oldScript = oldScripts[id];
        if (oldScript) {
          return {
            id,
            clientId: 'legacy',
            clientName: 'Cliente Legacy',
            script: oldScript.script,
            title: 'Script Legacy',
            isActive: true,
            createdAt: new Date(oldScript.createdAt || Date.now()),
            updatedAt: new Date(oldScript.createdAt || Date.now())
          };
        }
      }
    } catch (error) {
      console.error('Erro ao buscar script legacy:', error);
    }
    
    return null;
  },

  // Buscar scripts por cliente
  async getByClient(clientId: string): Promise<ChatScript[]> {
    if (isBaserowAvailable()) {
      try {
        // Usar filtro direto no Baserow com o client_id
        const clientIdNumber = parseInt(clientId);
        if (!isNaN(clientIdNumber)) {
          const response = await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/?filter__field_5701034__equal=${clientIdNumber}`);
          return response.results.map(mapBaserowScript);
        }
      } catch (error) {
        console.error('Erro ao buscar scripts do cliente no Baserow:', error);
      }
    }
    
    const allScripts = await this.getAllLocal();
    return allScripts.filter(script => script.clientId === clientId);
  },

  // Atualizar script
  async update(id: string, data: Partial<CreateScriptData>): Promise<void> {
    if (isBaserowAvailable()) {
      try {
        const updateData: any = {};
        if (data.script) updateData.field_5701039 = data.script;
        if (data.title) updateData.field_5701040 = data.title;
        if (data.clientName) updateData.field_5701038 = data.clientName;
        await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });
        return;
      } catch (e) {
        console.warn('[scriptService.update] Falha Baserow, fallback local:', e);
      }
    }

    const scripts = localStorage_utils.getScripts();
    const index = scripts.findIndex(s => s.id === id);
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...data, updatedAt: new Date() } as ChatScript;
      localStorage_utils.saveScripts(scripts);
    }
  },

  // Deletar script
  async delete(id: string): Promise<void> {
    if (isBaserowAvailable()) {
      try {
        await baserowRequest(`/api/database/rows/table/${BASEROW_CONFIG.tables.scripts}/${id}/`, {
          method: 'DELETE'
        });
        return;
      } catch (e) {
        console.warn('[scriptService.delete] Falha Baserow, fallback local:', e);
      }
    }

    const scripts = localStorage_utils.getScripts();
    const filtered = scripts.filter(s => s.id !== id);
    localStorage_utils.saveScripts(filtered);
  }
};

// Função para verificar o status do storage
export const getStorageStatus = () => {
  return {
    isBaserowConnected: isBaserowAvailable(),
    storageType: isBaserowAvailable() ? 'Baserow Database' : 'LocalStorage',
    message: isBaserowAvailable() 
      ? 'Conectado ao Baserow - dados persistentes na nuvem' 
      : 'Usando localStorage - dados salvos localmente no navegador'
  };
};