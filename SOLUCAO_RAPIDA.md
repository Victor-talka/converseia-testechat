# 🚨 SOLUÇÃO RÁPIDA - Vercel não Funciona

## Problema
- ✅ Funciona no `npm run dev` (local)
- ❌ Não funciona no Vercel (nuvem)
- ❌ "Gerenciar Clientes" está vazio no Vercel
- ❌ Chat não abre no Vercel

## Causa
**Variáveis de ambiente não configuradas no Vercel!**

O arquivo `.env` local não é enviado para o Vercel. Você precisa configurar manualmente.

## Solução em 5 Passos

### 1. Acesse o Vercel
- Entre em [vercel.com](https://vercel.com)
- Selecione seu projeto `converseia-testechat`

### 2. Vá em Settings
- Menu lateral → **Settings**
- Clique em **Environment Variables**

### 3. Adicione as Variáveis
Adicione cada uma destas variáveis (uma por uma):

```
Nome: VITE_BASEROW_API_TOKEN
Valor: wT4NNP5hwTaVuzixirWycVT4D4xDRorE
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```
Nome: VITE_BASEROW_BASE_URL
Valor: https://api.baserow.io
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```
Nome: VITE_BASEROW_DATABASE_ID
Valor: 296836
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```
Nome: VITE_BASEROW_CLIENTS_TABLE_ID
Valor: 689319
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```
Nome: VITE_BASEROW_SCRIPTS_TABLE_ID
Valor: 689333
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

### 4. Fazer Redeploy
- Vá em **Deployments**
- Clique nos 3 pontinhos (...) do último deploy
- Clique em **Redeploy**

### 5. Verificar
- Abra seu site no Vercel
- Abra o Console (F12)
- Procure: `🔧 Baserow Config:`
- Deve mostrar: `VITE_BASEROW_API_TOKEN: "definido"`

## Chat Ainda Não Abre?

Se "Gerenciar Clientes" funciona mas o chat não abre:

### Problema: Restrição de Domínio

O chatbot (Dify/outro) precisa autorizar o domínio do Vercel:

1. Acesse o painel do seu chatbot
2. Vá em Settings → Security ou Embed
3. Adicione na lista de domínios permitidos:
   - `https://seu-projeto.vercel.app`
   - ou `*.vercel.app`
4. Salve e teste novamente

## 📖 Documentação Completa

- **Setup Vercel:** [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **Problemas Chat:** [CHAT_TROUBLESHOOTING.md](./CHAT_TROUBLESHOOTING.md)

## 💡 Dica

Para ver se as variáveis estão corretas, abra o Console (F12) e procure:

```
🔧 Baserow Config: {
  envVars: {
    VITE_BASEROW_API_TOKEN: "definido"  ← Deve estar "definido"
  }
}
```

Se mostrar "não definido", você não configurou as variáveis ou não fez redeploy!
