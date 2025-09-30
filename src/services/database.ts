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
import { db } from '../lib/firebase';
import { Client, ChatScript, CreateClientData, CreateScriptData } from '../types/database';

// Serviços para Clientes
export const clientService = {
  // Criar novo cliente
  async create(data: CreateClientData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  // Listar todos os clientes
  async getAll(): Promise<Client[]> {
    try {
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Client[];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  // Atualizar cliente
  async update(id: string, data: Partial<CreateClientData>): Promise<void> {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }
};

// Serviços para Scripts de Chat
export const scriptService = {
  // Criar novo script
  async create(data: CreateScriptData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'chatScripts'), {
        ...data,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar script:', error);
      throw error;
    }
  },

  // Listar todos os scripts
  async getAll(): Promise<ChatScript[]> {
    try {
      const q = query(collection(db, 'chatScripts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as ChatScript[];
    } catch (error) {
      console.error('Erro ao buscar scripts:', error);
      throw error;
    }
  },

  // Buscar script por ID
  async getById(id: string): Promise<ChatScript | null> {
    try {
      const scripts = await this.getAll();
      return scripts.find(script => script.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar script:', error);
      throw error;
    }
  },

  // Buscar scripts por cliente
  async getByClient(clientId: string): Promise<ChatScript[]> {
    try {
      const q = query(
        collection(db, 'chatScripts'), 
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as ChatScript[];
    } catch (error) {
      console.error('Erro ao buscar scripts do cliente:', error);
      throw error;
    }
  },

  // Atualizar script
  async update(id: string, data: Partial<CreateScriptData>): Promise<void> {
    try {
      const scriptRef = doc(db, 'chatScripts', id);
      await updateDoc(scriptRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar script:', error);
      throw error;
    }
  },

  // Deletar script
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'chatScripts', id));
    } catch (error) {
      console.error('Erro ao deletar script:', error);
      throw error;
    }
  }
};