export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatScript {
  id: string;
  clientId: string;
  clientName: string;
  script: string;
  title?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface CreateScriptData {
  clientId: string;
  clientName: string;
  script: string;
  title?: string;
  description?: string;
}