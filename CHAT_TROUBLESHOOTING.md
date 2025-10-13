# 🔧 Troubleshooting - Chat Widget não Abre

## Problema: Chat não abre quando hospedado no Vercel

### Causas Possíveis e Soluções

## 1️⃣ Restrição de Domínio no Chatbot (MAIS COMUM)

### Problema
O script do chatbot (Dify, Typebot, etc.) tem uma lista de domínios autorizados. Se o domínio do Vercel não estiver na lista, o chat não abre.

### Solução

**Se estiver usando Dify:**
1. Acesse o painel do Dify: https://cloud.dify.ai
2. Vá no seu aplicativo → Settings → Web App → Embed
3. Adicione seu domínio do Vercel na lista de domínios permitidos:
   ```
   https://seu-projeto.vercel.app
   *.vercel.app
   ```
4. Salve as alterações

**Se estiver usando outro chatbot:**
- Procure por configurações de "Allowed Domains", "CORS", "Whitelist" ou "Security"
- Adicione o domínio do Vercel

## 2️⃣ Script não Está Carregando

### Como Verificar
1. Abra o Console (F12 → Console)
2. Procure por erros relacionados ao script do chat
3. Vá em Network (F12 → Network) e procure pela requisição do script

### Possíveis Erros

**Erro 404:**
```
Failed to load resource: the server responded with a status of 404
```
**Solução:** O script não está mais disponível ou a URL mudou. Gere um novo script.

**Erro de CORS:**
```
Access to script at 'https://...' from origin 'https://seu-projeto.vercel.app' 
has been blocked by CORS policy
```
**Solução:** Configure o domínio no painel do chatbot (veja seção 1).

**Erro CSP (Content Security Policy):**
```
Refused to load the script because it violates the following 
Content Security Policy directive
```
**Solução:** Adicione configurações de CSP no `vercel.json` (veja seção 4).

## 3️⃣ Variáveis de Ambiente não Configuradas

Se "Gerenciar Clientes" está vazio, o problema é este!

### Solução
Siga o arquivo `VERCEL_SETUP.md` para configurar as variáveis de ambiente no Vercel.

## 4️⃣ Problemas de CORS/CSP

### Adicionar Headers no vercel.json

Se o chat ainda não funcionar, adicione headers mais permissivos:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Requested-With"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; frame-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;"
        }
      ]
    }
  ]
}
```

## 5️⃣ Iframe está Bloqueado

Alguns chatbots usam iframes. Verifique se não há bloqueio.

### Como Verificar
1. Inspecione a página (F12)
2. Procure por elementos `<iframe>`
3. Veja se há erros relacionados

### Solução
Adicione no `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        }
      ]
    }
  ]
}
```

## 🎯 Checklist de Diagnóstico

Execute estes passos em ordem:

### Passo 1: Verificar Console
- [ ] Abra F12 → Console
- [ ] Procure por erros em vermelho
- [ ] Copie os erros para análise

### Passo 2: Verificar Network
- [ ] Abra F12 → Network
- [ ] Recarregue a página
- [ ] Procure por requisições falhando (vermelho)
- [ ] Verifique status code (404, 403, etc.)

### Passo 3: Verificar Domínio
- [ ] Confirme que o domínio do Vercel está autorizado no chatbot
- [ ] Teste com `*.vercel.app` se não funcionar com domínio específico

### Passo 4: Verificar Variáveis
- [ ] Veja se o log `🔧 Baserow Config:` mostra tudo correto
- [ ] Confirme que clientes aparecem em "Gerenciar Clientes"

### Passo 5: Testar Localmente
- [ ] Rode `npm run dev`
- [ ] Veja se funciona localmente
- [ ] Se funcionar local mas não no Vercel = problema de configuração

## 🧪 Teste Manual do Script

Para testar se o script funciona, cole no Console (F12):

```javascript
// Teste 1: Verificar se script carrega
console.log('Testando script...');
const scriptUrl = 'URL_DO_SEU_SCRIPT_AQUI';
fetch(scriptUrl)
  .then(r => {
    console.log('Script Status:', r.status);
    return r.text();
  })
  .then(text => console.log('Script conteúdo:', text.substring(0, 200)))
  .catch(e => console.error('Erro ao carregar script:', e));

// Teste 2: Verificar CORS
fetch('https://api.baserow.io/api/database/rows/table/689319/', {
  headers: {
    'Authorization': 'Token wT4NNP5hwTaVuzixirWycVT4D4xDRorE'
  }
})
  .then(r => r.json())
  .then(data => console.log('Baserow OK:', data))
  .catch(e => console.error('Erro Baserow:', e));
```

## 📝 Exemplos de Erros Comuns

### Erro 1: "chatbot_conversation_id is not defined"
**Causa:** Script não inicializou corretamente
**Solução:** Verifique se o script está completo e correto

### Erro 2: "Failed to execute 'postMessage'"
**Causa:** Problema de comunicação entre iframe e página
**Solução:** Configure CORS corretamente no chatbot

### Erro 3: "net::ERR_BLOCKED_BY_CLIENT"
**Causa:** Extensão de navegador bloqueando (AdBlock, etc.)
**Solução:** Desative extensões ou teste em modo anônimo

### Erro 4: Script carrega mas chat não abre
**Causa:** Restrição de domínio no chatbot
**Solução:** Adicione domínio do Vercel no painel do chatbot

## 🆘 Ainda não Resolveu?

### Informações para Debug

Copie e envie estas informações:

```javascript
// Cole no Console (F12) e copie o resultado
console.log({
  url: window.location.href,
  userAgent: navigator.userAgent,
  localStorage: {
    scripts: localStorage.getItem('widget-converser-scripts'),
    conversation: localStorage.getItem('chatbot_conversation_id')
  },
  baserowConfig: {
    // Veja o log 🔧 Baserow Config no console
  },
  errors: 'Cole os erros do console aqui'
});
```

### Teste com Curl

Teste o Baserow via terminal:

```bash
curl -H "Authorization: Token wT4NNP5hwTaVuzixirWycVT4D4xDRorE" \
  https://api.baserow.io/api/database/rows/table/689319/
```

Deve retornar JSON com os clientes. Se retornar erro, o problema é no Baserow.

## 🔗 Links Úteis

- [Dify - Configurar Domínios](https://docs.dify.ai/)
- [Vercel - Headers](https://vercel.com/docs/projects/project-configuration#headers)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
