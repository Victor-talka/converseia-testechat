# Widget Converser

Uma aplicação para testar e visualizar widgets de chatbot em um ambiente isolado.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel. O arquivo `vercel.json` já contém as configurações necessárias para:

- ✅ Rotas de SPA (Single Page Application)
- ✅ Headers de CORS para widgets externos
- ✅ Configurações de segurança

## 🔧 Funcionalidades

- **Preview Isolado**: Teste widgets de chatbot em um ambiente limpo
- **Compartilhamento**: Gere links únicos para compartilhar previews
- **Debug Avançado**: Console detalhado para identificar problemas
- **Responsivo**: Funciona em desktop e mobile

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

### Performance

- O app usa localStorage para armazenar scripts temporariamente
- Links de preview podem expirar se o localStorage for limpo
- Use o painel de debug para verificar informações do ambiente

## 🔍 Debug

A página de preview inclui:

- **Logs detalhados** no console do navegador
- **Informações do ambiente** (domínio, protocolo, user agent)
- **Monitoramento de requisições** (fetch e XHR)
- **Detecção automática** de elementos do chatbot

## 📋 Como usar

1. **Cole o script** do seu chatbot na página inicial
2. **Clique em "Gerar Preview"** para criar um link único
3. **Abra o preview** para testar o widget
4. **Compartilhe o link** se necessário

## 🏗️ Tecnologias

- React + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- React Router (navegação)
- Shadcn/ui (componentes)

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
