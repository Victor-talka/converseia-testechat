# 🌐 Guia: Configurar Subdomínios Dinâmicos (Wildcard)

## 📋 Visão Geral

Este guia ensina a configurar **subdomínios dinâmicos** para que cada cliente tenha seu próprio domínio:
- `cliente1.converseia.com`
- `cliente2.converseia.com`
- `cliente3.converseia.com`

**Importante:** Esta configuração permite que cada cliente tenha um domínio único para configurar no gerador de script do chatbot.

---

## 🔧 PASSO 1: Configurar Cloudflare (DNS Wildcard)

### 1.1 Acessar o Painel do Cloudflare

1. Login em: https://dash.cloudflare.com
2. Selecione o domínio: `converseia.com`
3. Vá em **DNS** → **Records**

### 1.2 Criar Registro DNS Wildcard

Adicione um novo registro DNS:

```
Type: CNAME
Name: *
Target: cname.vercel-dns.com
Proxy status: 🟠 Proxied (laranja - ATIVADO)
TTL: Auto
```

**O que isso faz:**
- `*` = Qualquer subdomínio (`cliente1`, `cliente2`, etc.)
- Todos os subdomínios apontam para o Vercel
- Proxy ativo = SSL automático pelo Cloudflare

### 1.3 Verificar Configuração

Após criar, você verá algo assim:

```
* → CNAME → cname.vercel-dns.com (Proxied)
```

⏳ **Aguarde 2-5 minutos** para propagação do DNS.

---

## 🚀 PASSO 2: Configurar Vercel (Domínio Wildcard)

### 2.1 Abrir Configurações do Projeto

1. Acesse: https://vercel.com
2. Selecione seu projeto: `converseia-testechat`
3. Vá em **Settings** → **Domains**

### 2.2 Adicionar Domínio Wildcard

1. Clique em **Add Domain**
2. Digite: `*.converseia.com`
3. Clique em **Add**

### 2.3 Verificação Automática

O Vercel irá:
- ✅ Detectar o CNAME no Cloudflare
- ✅ Verificar propriedade do domínio
- ✅ Configurar SSL automaticamente

**Status esperado:**
```
✅ *.converseia.com - Valid Configuration
```

### 2.4 Aguardar Propagação

⏳ Pode levar **até 24 horas** para propagação completa, mas geralmente funciona em **5-30 minutos**.

---

## ✅ PASSO 3: Testar a Configuração

### 3.1 Criar Cliente de Teste

1. Acesse: `https://chat-teste.converseia.com`
2. Crie um novo cliente com nome: "Teste"
3. Slug gerado automaticamente: `teste`
4. URL gerada: `https://teste.converseia.com`

### 3.2 Verificar Funcionamento

1. **Copie** a URL: `https://teste.converseia.com`
2. **Cole** em uma nova aba do navegador
3. **Verifique** se o chat carrega corretamente

### 3.3 Verificar DNS (Opcional)

Use uma ferramenta online:
- https://dnschecker.org
- Digite: `teste.converseia.com`
- Deve apontar para o Vercel

---

## 🎯 Como Funciona

### Fluxo Completo

1. **Usuário cria cliente** com nome "Empresa ABC"
2. **Sistema gera slug**: `empresa-abc`
3. **URL criada**: `https://empresa-abc.converseia.com`
4. **Você configura** essa URL no gerador do script
5. **Cliente acessa** `empresa-abc.converseia.com`
6. **Sistema detecta** o subdomínio e carrega o cliente correto

### Código - Detecção de Subdomínio

```typescript
// Preview.tsx detecta automaticamente
const detectarSubdominio = (): string | null => {
  const hostname = window.location.hostname;
  // Ex: empresa-abc.converseia.com
  
  if (hostname.endsWith('converseia.com') && hostname !== 'converseia.com') {
    // Extrai: empresa-abc
    const slug = hostname.replace('.converseia.com', '');
    return slug; // Busca cliente no banco por esse slug
  }
  
  return null; // Não é subdomínio
};
```

---

## 🔐 SSL/HTTPS Automático

**Cloudflare + Vercel** fornecem SSL gratuito:
- ✅ Todos os subdomínios terão HTTPS
- ✅ Certificado wildcard automático
- ✅ Renovação automática

**Configuração SSL no Cloudflare:**
1. Vá em **SSL/TLS** → **Overview**
2. Selecione: **Full (strict)** ← Recomendado
3. Isso garante HTTPS end-to-end

---

## 📊 Estrutura Final

```
converseia.com (domínio raiz)
├── chat-teste.converseia.com (aplicação principal - Vercel)
├── cliente1.converseia.com (cliente 1)
├── cliente2.converseia.com (cliente 2)
├── empresa-abc.converseia.com (cliente 3)
└── *.converseia.com (wildcard - qualquer outro)
```

**Todos** os subdomínios apontam para o mesmo código no Vercel, mas o sistema detecta o slug e carrega o cliente específico.

---

## ⚠️ Limitações e Considerações

### ✅ O Que Funciona
- Subdomínios infinitos automaticamente
- SSL em todos os subdomínios
- Sem custo adicional (Cloudflare + Vercel gratuito)
- URLs limpas e profissionais

### ⚠️ Atenção
- **Propagação DNS:** Pode levar até 24h
- **Cache:** Limpe cache do navegador ao testar
- **Subdomínios reservados:** `www`, `api`, `mail` não devem ser usados como slug
- **Caso especial:** `chat-teste` é ignorado (é o domínio principal)

### 🚫 O Que NÃO Funciona
- Não cria subdomínios reais no DNS (é wildcard)
- Não funciona sem a configuração do Cloudflare
- Local (localhost) continuará usando `/slug` ao invés de subdomínio

---

## 🐛 Solução de Problemas

### Problema 1: "Site não encontrado" ao acessar subdomínio

**Causa:** DNS não propagado ou configuração incorreta

**Solução:**
1. Verifique se o CNAME `*` existe no Cloudflare
2. Verifique se `*.converseia.com` está no Vercel
3. Aguarde 30 minutos para propagação
4. Limpe cache do navegador (Ctrl+Shift+Del)

### Problema 2: SSL/HTTPS não funciona

**Causa:** Configuração SSL incorreta

**Solução:**
1. Cloudflare → **SSL/TLS** → **Full (strict)**
2. Aguarde 5-10 minutos
3. Force HTTPS no Cloudflare: **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS** (ON)

### Problema 3: Subdomínio retorna 404

**Causa:** Aplicação não detecta o subdomínio

**Solução:**
1. Abra console do navegador (F12)
2. Veja logs: `🌐 Hostname detectado: ...`
3. Verifique se slug existe no banco de dados
4. Teste com slug que você SABE que existe

### Problema 4: Funciona em um subdomínio mas não em outro

**Causa:** Slug não cadastrado no banco

**Solução:**
1. Vá em **Gerenciar Clientes**
2. Verifique se o cliente tem slug configurado
3. Se não tiver, edite e adicione o slug
4. Slug deve ser exatamente o mesmo do subdomínio

---

## 📝 Checklist de Configuração

Use este checklist para garantir que tudo está configurado:

### Cloudflare
- [ ] Login no Cloudflare
- [ ] Domínio `converseia.com` selecionado
- [ ] Registro CNAME `*` criado
- [ ] Target: `cname.vercel-dns.com`
- [ ] Proxy: 🟠 Ativado (laranja)
- [ ] SSL/TLS: Full (strict)
- [ ] Always Use HTTPS: ON

### Vercel
- [ ] Projeto selecionado
- [ ] Settings → Domains aberto
- [ ] `*.converseia.com` adicionado
- [ ] Status: ✅ Valid Configuration
- [ ] Deploy mais recente concluído

### Aplicação
- [ ] Código atualizado (commit recente)
- [ ] Cliente de teste criado
- [ ] Slug configurado
- [ ] URL testada em nova aba
- [ ] Console sem erros (F12)

### Teste Final
- [ ] Criar cliente novo
- [ ] Copiar URL gerada
- [ ] Abrir em navegador anônimo
- [ ] Chat carrega corretamente
- [ ] Configurar domínio no gerador do script
- [ ] Testar chatbot funcionando

---

## 🎓 Resumo para Uso Diário

### Criar Cliente
1. Acesse: `https://chat-teste.converseia.com`
2. Preencha nome do cliente
3. Slug gerado automaticamente
4. **Copie a URL gerada**: `https://{slug}.converseia.com`
5. **Use essa URL no gerador do script do chatbot**

### Cada Cliente Recebe
- ✅ Subdomínio único: `cliente123.converseia.com`
- ✅ SSL automático (HTTPS)
- ✅ Chat isolado e independente
- ✅ URL profissional para compartilhar

---

## 💡 Dica Extra: Ambiente de Desenvolvimento

**Localhost não suporta subdomínios**, então durante desenvolvimento:

- **Produção:** `https://cliente1.converseia.com` ✅
- **Local:** `http://localhost:5173/cliente1` ✅

O código detecta automaticamente e usa o modo apropriado!

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do console (F12)
2. Confirme DNS propagado: https://dnschecker.org
3. Teste em navegador anônimo (sem cache)
4. Aguarde até 24h para propagação completa

---

**Configuração completa! 🎉**

Agora cada cliente pode ter seu próprio domínio para configurar no gerador de scripts!
