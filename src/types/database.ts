export interface Client {
  id: string;
  name: string;
  slug: string; // URL amigável, ex: "nomecliente55"
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
  clientSlug: string; // Slug do cliente para URL
  script: string;
  title?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  slug: string; // URL amigável obrigatório
  email?: string;
  phone?: string;
  company?: string;
}

export interface CreateScriptData {
  clientId: string;
  clientName: string;
  clientSlug: string; // Slug do cliente
  script: string;
  title?: string;
  description?: string;
}