# 🔧 Guia: Configurar API do Vercel para Domínios Automáticos

## 📋 Visão Geral

Este guia ensina a configurar a API do Vercel para que, ao criar um cliente, o sistema **adicione automaticamente o subdomínio** ao projeto Vercel.

**Resultado:** Criar cliente "Empresa ABC" → `empresa-abc.converseia.com` é adicionado ao Vercel automaticamente!

---

## 🔑 Passo 1: Criar Token de API do Vercel

### 1.1 Acessar Configurações de Token

1. Login em: https://vercel.com
2. Clique no **ícone do perfil** (canto superior direito)
3. Vá em **Settings** → **Tokens**
4. Ou acesse direto: https://vercel.com/account/tokens

### 1.2 Criar Novo Token

1. Clique em **Create Token**
2. **Nome do Token:** `converseia-auto-domains`
3. **Scope:** Full Account (ou selecione o projeto específico)
4. **Expiration:** Never (ou defina validade)
5. Clique em **Create**

### 1.3 Copiar Token

⚠️ **IMPORTANTE:** O token aparece **apenas uma vez**!

```
vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copie e guarde em local seguro!**

---

## 🆔 Passo 2: Obter ID do Projeto

### 2.1 Acessar Projeto

1. Dashboard do Vercel
2. Selecione o projeto: **converseia-testechat**
3. Vá em **Settings** → **General**

### 2.2 Copiar Project ID

Procure por **Project ID** na página:

```
prj_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Copie este ID!**

---

## 👥 Passo 3: Obter Team ID (Se Aplicável)

### 3.1 Verificar se Usa Team

1. No canto superior esquerdo do Vercel
2. Veja se tem nome de organização/team
3. Se tiver (ex: "Converseia Team"), você precisa do Team ID

### 3.2 Obter Team ID

1. Clique no nome do Team
2. Vá em **Settings**
3. Procure por **Team ID**:

```
team_xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Se você usa conta pessoal (não team), pule este passo!**

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### 4.1 Desenvolvimento Local

Crie/edite o arquivo `.env` na raiz do projeto:

```bash
# Vercel API
VITE_VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_VERCEL_TEAM_ID=team_xxxxxxxxxxxxxxxxxxxxxxxx  # Opcional
```

### 4.2 Produção (Vercel)

1. No projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione **uma por uma**:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_VERCEL_API_TOKEN` | `vercel_xxx...` | Production, Preview, Development |
| `VITE_VERCEL_PROJECT_ID` | `prj_xxx...` | Production, Preview, Development |
| `VITE_VERCEL_TEAM_ID` | `team_xxx...` | Production, Preview, Development (se aplicável) |

4. Clique em **Save**
5. **Redeploy** o projeto para aplicar

---

## ✅ Passo 5: Testar

### 5.1 Verificar Configuração

Abra o console do navegador (F12) e veja os logs:

```
🔧 Vercel Config: { hasToken: true, hasProjectId: true, hasTeamId: true }
```

### 5.2 Criar Cliente de Teste

1. Acesse: `https://chat-teste.converseia.com`
2. Crie cliente: **"Teste API"**
3. Slug gerado: `teste-api`
4. Veja no console:

```
🚀 Adicionando domínio teste-api.converseia.com ao Vercel...
✅ Domínio adicionado ao Vercel: teste-api.converseia.com
```

5. Toast aparece: **"Domínio configurado!"**

### 5.3 Verificar no Vercel

1. Vá em **Settings** → **Domains** no Vercel
2. Deve aparecer: `teste-api.converseia.com` ✅

---

## 🎯 Como Funciona

### Fluxo Completo

```
1. Usuário cria cliente "Empresa ABC"
   ↓
2. Sistema gera slug: empresa-abc
   ↓
3. Sistema chama API do Vercel
   POST /v9/projects/{id}/domains
   Body: { name: "empresa-abc.converseia.com" }
   ↓
4. Vercel adiciona domínio ao projeto ✅
   ↓
5. Cloudflare já tem wildcard CNAME *
   ↓
6. DNS resolve: empresa-abc.converseia.com → Vercel
   ↓
7. Cliente acessa URL e chat carrega! 🎉
```

### Código Implementado

**Arquivo:** `src/lib/vercel.ts`

```typescript
export const addDomainToVercel = async (subdomain: string) => {
  // Chama API do Vercel
  // POST /v9/projects/{projectId}/domains
  // Adiciona {subdomain}.converseia.com
};
```

**Integração:** `src/components/ScriptInput.tsx`

```typescript
// Após criar cliente
const vercelResult = await addDomainToVercel(finalClientSlug);

if (vercelResult.success) {
  // Domínio adicionado com sucesso!
}
```

---

## 🔐 Segurança

### ⚠️ NUNCA Compartilhe o Token!

O token de API do Vercel tem **acesso total** à sua conta:
- ❌ Não commite no Git
- ❌ Não compartilhe publicamente
- ✅ Use apenas em `.env`
- ✅ Configure no Vercel dashboard

### Permissões do Token

O token permite:
- ✅ Adicionar domínios
- ✅ Remover domínios
- ✅ Ver configurações
- ⚠️ Gerenciar projetos (dependendo do scope)

---

## 🐛 Solução de Problemas

### Problema 1: "Vercel API não configurada"

**Causa:** Variáveis de ambiente não foram configuradas

**Solução:**
1. Verifique se `.env` existe
2. Confirme que variáveis começam com `VITE_`
3. Reinicie o servidor de desenvolvimento

### Problema 2: "401 Unauthorized"

**Causa:** Token inválido ou expirado

**Solução:**
1. Gere novo token no Vercel
2. Atualize `VITE_VERCEL_API_TOKEN`
3. Redeploy no Vercel

### Problema 3: "Domain already in use"

**Causa:** Domínio já foi adicionado antes

**Solução:**
- ✅ Isso é normal! Sistema trata como sucesso
- O domínio já está configurado corretamente

### Problema 4: "Project not found"

**Causa:** `VITE_VERCEL_PROJECT_ID` incorreto

**Solução:**
1. Verifique Settings → General no Vercel
2. Copie o Project ID correto
3. Atualize variável de ambiente

### Problema 5: Toast não aparece

**Causa:** API pode estar falhando silenciosamente

**Solução:**
1. Abra console (F12)
2. Veja logs da API do Vercel
3. Verifique mensagens de erro
4. Confirme que token tem permissão

---

## 📊 Monitoramento

### Ver Logs no Console

Ao criar cliente, veja:

```javascript
🔧 Vercel Config: { hasToken: true, ... }
🚀 Adicionando domínio cliente.converseia.com ao Vercel...
✅ Domínio adicionado ao Vercel: cliente.converseia.com
```

### Listar Domínios via API

Use a função utilitária:

```typescript
import { listVercelDomains } from '@/lib/vercel';

const domains = await listVercelDomains();
console.log('Domínios configurados:', domains);
```

---

## 🎓 Resumo

### Antes (Manual)
```
1. Criar cliente
2. Ir no Vercel
3. Settings → Domains
4. Adicionar cliente.converseia.com
5. Aguardar propagação
```

### Agora (Automático)
```
1. Criar cliente ✅
   ↓
2. Sistema adiciona domínio automaticamente! 🎉
```

---

## 💡 Dicas

1. **Teste primeiro em desenvolvimento local**
2. **Monitore logs no console para debugging**
3. **Mantenha token seguro**
4. **Redeploy após configurar variáveis**
5. **Wildcard ainda é melhor!** (se conseguir resolver)

---

## 🔗 Links Úteis

- Criar Token: https://vercel.com/account/tokens
- API Docs: https://vercel.com/docs/rest-api
- Domínios API: https://vercel.com/docs/rest-api#endpoints/projects/add-a-domain-to-a-project

---

**Configuração completa! 🎉**

Agora ao criar um cliente, o domínio é adicionado automaticamente ao Vercel!
