# Widget Converser

Uma aplicação completa para gerenciar clientes e testar widgets de chatbot em um ambiente isolado com banco de dados integrado.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel. O arquivo `vercel.json` já contém as configurações necessárias para:

- ✅ Rotas de SPA (Single Page Application)
- ✅ Headers de CORS para widgets externos
- ✅ Configurações de segurança

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

### 🔒 **Banco de Dados**
- **Firebase Firestore**: Banco gratuito e escalável
- **Persistência**: Dados salvos permanentemente
- **Backup automático**: Sincronização em tempo real
- **Segurança**: Configurações de acesso controladas

## 🛠️ Configuração

### 1. **Firebase Setup**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative o **Firestore Database**
4. Configure as regras de segurança (modo desenvolvimento):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 2. **Variáveis de Ambiente**
Crie um arquivo `.env` baseado no `.env.example`:
```bash
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. **Deploy no Vercel**
1. Conecte seu repositório ao Vercel
2. Adicione as variáveis de ambiente no painel do Vercel
3. Deploy automático será feito a cada push

## 🛠️ Resolução de Problemas

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

### Problemas com Firebase

1. **Verifique as variáveis de ambiente** no Vercel
2. **Confirme as regras do Firestore** (devem permitir leitura/escrita)
3. **Verifique o console do Firebase** para logs de erro
4. **Teste a conexão** usando as ferramentas de debug do navegador

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
