import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../lib/firebase';
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
      return data ? JSON.parse(data) : [];
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
  
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

// Serviços para Clientes
export const clientService = {
  // Criar novo cliente
  async create(data: CreateClientData): Promise<string> {
    if (isFirebaseAvailable()) {
      try {
        const docRef = await addDoc(collection(db!, 'clients'), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return docRef.id;
      } catch (error) {
        console.error('Erro ao criar cliente no Firebase, usando localStorage:', error);
        // Fallback para localStorage
        return this.createLocal(data);
      }
    } else {
      return this.createLocal(data);
    }
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
    if (isFirebaseAvailable()) {
      try {
        const q = query(collection(db!, 'clients'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Client[];
      } catch (error) {
        console.error('Erro ao buscar clientes no Firebase, usando localStorage:', error);
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
    if (isFirebaseAvailable()) {
      try {
        const clientRef = doc(db!, 'clients', id);
        await updateDoc(clientRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
        return;
      } catch (error) {
        console.error('Erro ao atualizar cliente no Firebase, usando localStorage:', error);
      }
    }
    
    // Local fallback
    const clients = localStorage_utils.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data, updatedAt: new Date() };
      localStorage_utils.saveClients(clients);
    }
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    if (isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db!, 'clients', id));
        return;
      } catch (error) {
        console.error('Erro ao deletar cliente no Firebase, usando localStorage:', error);
      }
    }
    
    // Local fallback
    const clients = localStorage_utils.getClients();
    const filtered = clients.filter(c => c.id !== id);
    localStorage_utils.saveClients(filtered);
  }
};

// Serviços para Scripts de Chat
export const scriptService = {
  // Criar novo script
  async create(data: CreateScriptData): Promise<string> {
    if (isFirebaseAvailable()) {
      try {
        const docRef = await addDoc(collection(db!, 'chatScripts'), {
          ...data,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return docRef.id;
      } catch (error) {
        console.error('Erro ao criar script no Firebase, usando localStorage:', error);
        return this.createLocal(data);
      }
    } else {
      return this.createLocal(data);
    }
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
    if (isFirebaseAvailable()) {
      try {
        const q = query(collection(db!, 'chatScripts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as ChatScript[];
      } catch (error) {
        console.error('Erro ao buscar scripts no Firebase, usando localStorage:', error);
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
    if (isFirebaseAvailable()) {
      try {
        const scripts = await this.getAll();
        return scripts.find(script => script.id === id) || null;
      } catch (error) {
        console.error('Erro ao buscar script no Firebase, usando localStorage:', error);
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
    const allScripts = await this.getAll();
    return allScripts.filter(script => script.clientId === clientId);
  },

  // Atualizar script
  async update(id: string, data: Partial<CreateScriptData>): Promise<void> {
    if (isFirebaseAvailable()) {
      try {
        const scriptRef = doc(db!, 'chatScripts', id);
        await updateDoc(scriptRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
        return;
      } catch (error) {
        console.error('Erro ao atualizar script no Firebase, usando localStorage:', error);
      }
    }
    
    // Local fallback
    const scripts = localStorage_utils.getScripts();
    const index = scripts.findIndex(s => s.id === id);
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...data, updatedAt: new Date() } as ChatScript;
      localStorage_utils.saveScripts(scripts);
    }
  },

  // Deletar script
  async delete(id: string): Promise<void> {
    if (isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db!, 'chatScripts', id));
        return;
      } catch (error) {
        console.error('Erro ao deletar script no Firebase, usando localStorage:', error);
      }
    }
    
    // Local fallback
    const scripts = localStorage_utils.getScripts();
    const filtered = scripts.filter(s => s.id !== id);
    localStorage_utils.saveScripts(filtered);
  }
};

// Função para verificar o status do storage
export const getStorageStatus = () => {
  return {
    isFirebaseConnected: isFirebaseAvailable(),
    storageType: isFirebaseAvailable() ? 'Firebase Firestore' : 'LocalStorage',
    message: isFirebaseAvailable() 
      ? 'Conectado ao Firebase - dados persistentes na nuvem' 
      : 'Usando localStorage - dados salvos localmente no navegador'
  };
};