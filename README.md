# Widget Converser

Uma aplicação completa para gerenciar clientes e testar widgets de chatbot em um ambiente isolado com banco de dados integrado.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel. 

### ⚠️ IMPORTANTE: Problemas após Deploy?

Se a aplicação funciona localmente mas não no Vercel:
- 📖 **Leia o guia completo:** [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- 🔧 **Chat não abre?** Veja: [CHAT_TROUBLESHOOTING.md](./CHAT_TROUBLESHOOTING.md)

**Resumo:** Você precisa configurar as variáveis de ambiente no painel do Vercel!

## 🔧 Funcionalidades

### 📊 **Gerenciamento de Clientes**
- **Cadastro de clientes**: Nome, email, empresa
- **Lista de clientes**: Visualização organizada com filtros
- **Histórico de scripts**: Todos os scripts por cliente
- **Exclusão segura**: Remove cliente e scripts associados

### 💬 **Preview de Chatbots**
- **Preview isolado**: Teste widgets em ambiente limpo
- **Popup em destaque**: Chat abre automaticamente em destaque
- **Compartilhamento**: Links únicos para demonstrações
- **Debug avançado**: Console detalhado para identificar problemas

### 🔒 **Sistema de Armazenamento Híbrido**
- **Baserow Database**: API REST simples e gratuita (opcional)
- **LocalStorage**: Fallback automático quando Baserow não configurado
- **Compatibilidade**: Funciona com scripts legacy existentes
- **Indicadores visuais**: Mostra qual storage está sendo usado
- **API Token incluído**: Token já configurado para uso imediato

## 🛠️ Configuração

### ⚡ **Início Rápido (sem configuração)**
A aplicação funciona **imediatamente** sem nenhuma configuração:
- ✅ Usa localStorage como armazenamento padrão
- ✅ Todos os recursos funcionam normalmente
- ✅ Dados salvos localmente no navegador
- ⚠️ **IMPORTANTE:** Para funcionar no Vercel, siga [VERCEL_SETUP.md](./VERCEL_SETUP.md)

### �️ **Baserow Database (Recomendado para Produção)**

A aplicação já vem com API Token configurado! Basta adicionar as variáveis de ambiente:

**Desenvolvimento Local:**
```bash
VITE_BASEROW_API_TOKEN=wT4NNP5hwTaVuzixirWycVT4D4xDRorE
VITE_BASEROW_BASE_URL=https://api.baserow.io
VITE_BASEROW_DATABASE_ID=296836
VITE_BASEROW_CLIENTS_TABLE_ID=689319
VITE_BASEROW_SCRIPTS_TABLE_ID=689333
```

**Deploy no Vercel:**
📖 **Siga o guia completo:** [VERCEL_SETUP.md](./VERCEL_SETUP.md) para configurar as variáveis no painel do Vercel.

### 🔧 **Estrutura do Baserow**

Se quiser criar seu próprio banco Baserow:
1. Acesse [Baserow.io](https://baserow.io) e crie uma conta
2. Crie um novo banco de dados
3. Crie duas tabelas com os campos especificados:

**Tabela "Clientes":**
- `name` (Text) - Nome do cliente
- `email` (Text) - Email do cliente  
- `company` (Text) - Empresa do cliente

**Tabela "Scripts":**
- `client_id` (Number) - ID do cliente
- `client_name` (Text) - Nome do cliente
- `script` (Long Text) - Script do chatbot
- `title` (Text) - Título do script
- `is_active` (Boolean) - Se o script está ativo

4. Obtenha o API Token em Account Settings > API Tokens
5. Obtenha os IDs do banco e tabelas nas URLs do Baserow

### 2. **Variáveis de Ambiente (opcional)**
Para ativar o Firebase, crie um arquivo `.env`:
```bash
# Deixe comentado para usar localStorage
# Descomente para ativar Firebase

# VITE_FIREBASE_API_KEY=your-api-key-here
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your-project-id
# VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
# VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. **Deploy no Vercel**
1. Conecte seu repositório ao Vercel
2. **Opcional**: Adicione as variáveis de ambiente para Firebase
3. Deploy automático funciona com ou sem Firebase

## 🛠️ Resolução de Problemas

### 📖 Guias Completos de Troubleshooting

- **Aplicação não funciona no Vercel:** [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **Chat widget não abre:** [CHAT_TROUBLESHOOTING.md](./CHAT_TROUBLESHOOTING.md)

### ⚡ Problemas Comuns

#### 1. "Gerenciar Clientes" vazio no Vercel
**Causa:** Variáveis de ambiente não configuradas
**Solução:** Siga [VERCEL_SETUP.md](./VERCEL_SETUP.md)

#### 2. Chat não abre no domínio do Vercel
**Causas possíveis:**
- Domínio não autorizado no chatbot (Dify, etc.)
- Restrição de CORS
- Script inválido ou expirado

**Solução:** Siga [CHAT_TROUBLESHOOTING.md](./CHAT_TROUBLESHOOTING.md)

#### 3. Funciona local mas não no Vercel
**Causa:** Variáveis de ambiente do `.env` não são enviadas para o Vercel
**Solução:** Configure manualmente no painel do Vercel (veja [VERCEL_SETUP.md](./VERCEL_SETUP.md))

### Erro 400 (Bad Request)

Se o widget não carregar e você ver um erro 400 no console:

1. **Verifique o chatbot na plataforma original**:
   - Confirme se o chatbot está ativo
   - Verifique se não há restrições de domínio
   - Teste o widget no site original primeiro

2. **Domínios permitidos**:
   - Adicione seu domínio Vercel na lista de domínios permitidos
   - Formato: `https://seu-projeto.vercel.app`
   - Alguns chatbots podem ter whitelist de domínios

3. **CORS e Headers**:
   - O projeto já está configurado com headers CORS
   - Alguns serviços podem ter políticas restritivas

### Widget não aparece

1. **Aguarde alguns segundos** - widgets podem demorar para carregar
2. **Verifique o console (F12)** para mensagens de erro
3. **Teste em modo anônimo** para descartar extensões
4. **Verifique se o script está completo** e sem caracteres especiais

### Problemas com Storage

**A aplicação sempre funciona!** Se você ver indicadores mostrando:

- 🟢 **"Firebase Firestore"**: Conectado à nuvem, dados persistentes
- 🔵 **"LocalStorage"**: Funcionando localmente, dados no navegador

Ambos os modos são **completamente funcionais**:

1. **LocalStorage** (padrão):
   - ✅ Funciona imediatamente
   - ✅ Todos os recursos disponíveis
   - ⚠️ Dados salvos apenas neste navegador

2. **Firebase** (opcional):
   - ✅ Dados na nuvem, acessíveis de qualquer lugar
   - ✅ Backup automático
   - ⚠️ Requer configuração

**Migração**: Quando configurar Firebase, dados existentes serão mantidos.

## 🔍 Debug

A página de preview inclui:

- **Logs detalhados** no console do navegador
- **Informações do ambiente** (domínio, protocolo, user agent)
- **Monitoramento de requisições** (fetch e XHR)
- **Detecção automática** de elementos do chatbot
- **Popup em destaque** mostrando status do chat

## 📋 Como usar

### **Fluxo Principal:**
1. **Acesse a página inicial**
2. **Escolha**: Novo cliente ou cliente existente
3. **Preencha os dados** do cliente (se novo)
4. **Cole o script** do chatbot
5. **Clique em "Gerar Preview"**
6. **Teste o widget** que abrirá em popup
7. **Compartilhe o link** se necessário

### **Gerenciamento:**
1. **Clique em "Gerenciar Clientes"**
2. **Visualize todos** os clientes e scripts
3. **Acesse previews** de scripts existentes
4. **Delete clientes** e scripts conforme necessário

## 🏗️ Tecnologias

- **Frontend**: React + TypeScript
- **Build**: Vite
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/ui
- **Roteamento**: React Router
- **Banco de Dados**: Firebase Firestore
- **Deploy**: Vercel
- **Ícones**: Lucide React

## 📦 Scripts

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🌐 Deploy

O projeto está configurado para deploy automático no Vercel. Cada push na branch `main` dispara um novo deploy.

### Configuração Manual

Se precisar fazer deploy manual:

1. Instale a CLI do Vercel: `npm i -g vercel`
2. Execute: `vercel`
3. Siga as instruções interativas
4. Configure as variáveis de ambiente

## 📊 Estrutura de Dados

### **Cliente**
```typescript
{
  id: string;
  name: string;
  email?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Script de Chat**
```typescript
{
  id: string;
  clientId: string;
  clientName: string;
  script: string;
  title?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a96b36e5-5735-406e-835b-9da3982967f2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
