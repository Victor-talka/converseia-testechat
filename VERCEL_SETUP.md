# 🚀 Guia de Deploy no Vercel - Widget Converser

## Problema Identificado

Quando você roda localmente com `npm run dev`, as variáveis de ambiente são carregadas do arquivo `.env` local. Porém, quando faz deploy no Vercel, esse arquivo `.env` **não é enviado** por questões de segurança.

Por isso:
- ✅ Funciona localmente (usa o `.env` local)
- ❌ Não funciona no Vercel (variáveis não configuradas)

## 📋 Solução: Configurar Variáveis no Vercel

### Passo 1: Acessar o Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `converseia-testechat`

### Passo 2: Adicionar Variáveis de Ambiente

1. No menu lateral, clique em **Settings** (Configurações)
2. Clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione TODAS as seguintes variáveis:

#### Variáveis Obrigatórias do Baserow:

```
VITE_BASEROW_API_TOKEN=wT4NNP5hwTaVuzixirWycVT4D4xDRorE
```
- **Environment:** Production, Preview, Development (marque todos)

```
VITE_BASEROW_BASE_URL=https://api.baserow.io
```
- **Environment:** Production, Preview, Development (marque todos)

```
VITE_BASEROW_DATABASE_ID=296836
```
- **Environment:** Production, Preview, Development (marque todos)

```
VITE_BASEROW_CLIENTS_TABLE_ID=689319
```
- **Environment:** Production, Preview, Development (marque todos)

```
VITE_BASEROW_SCRIPTS_TABLE_ID=689333
```
- **Environment:** Production, Preview, Development (marque todos)

### Passo 3: Fazer Redeploy

Após adicionar as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos três pontinhos (...) do deployment mais recente
3. Clique em **Redeploy**
4. Marque a opção **"Use existing Build Cache"** (opcional)
5. Clique em **Redeploy**

**IMPORTANTE:** As variáveis de ambiente só são aplicadas em novos deploys!

### Passo 4: Verificar se Funcionou

1. Acesse seu site no domínio do Vercel
2. Abra o Console do navegador (F12 → Console)
3. Procure pela mensagem: `🔧 Baserow Config:`
4. Verifique se todas as variáveis estão corretas

**O que deve aparecer:**
```javascript
🔧 Baserow Config: {
  hasApiToken: true,
  apiTokenPreview: "wT4NNP5h...",
  baseUrl: "https://api.baserow.io",
  databaseId: "296836",
  clientsTableId: "689319",
  scriptsTableId: "689333",
  envMode: "production",
  envVars: {
    VITE_BASEROW_API_TOKEN: "definido",
    VITE_BASEROW_BASE_URL: "definido",
    VITE_BASEROW_DATABASE_ID: "definido"
  }
}
```

**Se ainda mostrar "não definido":**
- Verifique se fez o redeploy após adicionar as variáveis
- Confirme que marcou "Production" ao adicionar as variáveis
- Limpe o cache do navegador (Ctrl+Shift+Delete)

## 🔍 Diagnóstico de Problemas

### Problema 1: "Gerenciar Clientes" vazio no Vercel

**Causa:** Variáveis de ambiente não configuradas
**Solução:** Siga os passos acima

### Problema 2: Chat não abre no domínio

**Possíveis causas:**

1. **Restrição de domínio no script do chat**
   - O script do chatbot (Dify ou outro) pode ter restrição de domínio
   - Verifique nas configurações do chatbot se o domínio do Vercel está autorizado
   - Adicione `*.vercel.app` ou seu domínio específico

2. **CORS bloqueado**
   - Verifique no Console (F12) se há erros de CORS
   - O arquivo `vercel.json` já tem configurações de CORS, mas pode precisar de ajustes

3. **Script não carregado**
   - Verifique se o script do chat está correto
   - Teste primeiro criando um novo script no Vercel após configurar o Baserow

## 🎯 Checklist de Verificação

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Redeploy feito após adicionar variáveis
- [ ] Console mostra configuração correta do Baserow
- [ ] Clientes aparecem em "Gerenciar Clientes"
- [ ] Domínio do Vercel autorizado no chatbot (Dify/outro)
- [ ] Chat widget abre corretamente

## 📝 Notas Importantes

1. **Variáveis começam com `VITE_`**: No Vite, apenas variáveis que começam com `VITE_` são expostas no código frontend.

2. **Redeploy é necessário**: Mudanças nas variáveis de ambiente só aplicam em novos deploys.

3. **Ambientes diferentes**: Você pode ter variáveis diferentes para Production, Preview e Development.

4. **Segurança**: Nunca commite o arquivo `.env` no Git! Ele deve estar no `.gitignore`.

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda não funcionar:

1. Compartilhe o log do Console (F12 → Console)
2. Compartilhe os erros da aba Network (F12 → Network)
3. Verifique se o Baserow está acessível em: https://api.baserow.io/api/database/rows/table/689319/
4. Teste fazer uma requisição manual com o token no Postman/Insomnia

## 📧 Informações do Baserow

- **API Token:** wT4NNP5hwTaVuzixirWycVT4D4xDRorE
- **Database ID:** 296836
- **Clients Table ID:** 689319
- **Scripts Table ID:** 689333
- **Base URL:** https://api.baserow.io

## 🔗 Links Úteis

- [Documentação Vercel - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Documentação Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Baserow API Docs](https://baserow.io/api-docs)
