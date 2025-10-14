# Sistema de Slugs - URLs Personalizadas

## 📋 Visão Geral

Implementamos um sistema de slugs que permite URLs personalizadas para cada cliente, facilitando a organização e compartilhamento dos links de chat.

### Formato das URLs
- **Antes:** `https://chat-teste.converseia.com/preview/12345`
- **Agora:** `https://chat-teste.converseia.com/nomecliente55`

## 🗄️ Estrutura do Banco de Dados

### Tabela: Clients
- **Campo:** `field_5701042` → `slug`
- **Tipo:** string (obrigatório)
- **Formato:** lowercase, sem acentos, hifens no lugar de espaços/caracteres especiais
- **Exemplo:** "Empresa ABC" → "empresa-abc"

### Tabela: Chat Scripts  
- **Campo:** `field_5701043` → `clientSlug`
- **Tipo:** string (obrigatório)
- **Descrição:** Referência ao slug do cliente associado

## 🔧 Configuração do Baserow

Para usar este sistema, adicione os seguintes campos no Baserow:

1. **Na tabela de Clientes:**
   - Nome do campo: `slug`
   - Tipo: Text
   - Field ID: `field_5701042`

2. **Na tabela de Chat Scripts:**
   - Nome do campo: `clientSlug`
   - Tipo: Text
   - Field ID: `field_5701043`

## 🚀 Funcionalidades Implementadas

### 1. Criação Automática de Slugs
- Ao digitar o nome do cliente, o slug é gerado automaticamente
- Normalização: remove acentos, converte para minúsculas, substitui espaços por hífens
- Exemplo: "José Silva & Cia." → "jose-silva-cia"

### 2. Validação de Slugs Únicos
- Antes de criar um cliente, verifica se o slug já existe
- Previne URLs duplicadas
- Exibe toast de erro se slug já estiver em uso

### 3. Edição Manual de Slugs
- Usuário pode editar o slug gerado automaticamente
- Botão para regenerar slug baseado no nome
- Preview da URL em tempo real

### 4. Rotas Dinâmicas

#### Nova Rota Principal
```typescript
<Route path="/:clientSlug" element={<Preview />} />
```

#### Rota Legada (Retrocompatibilidade)
```typescript
<Route path="/preview/:id" element={<Preview />} />
```

### 5. Detecção Inteligente
O componente `Preview.tsx` detecta automaticamente se o parâmetro é um slug ou ID:

```typescript
const param = id || clientSlug;
const isSlug = isNaN(Number(param)); // Se não é número, é slug

if (isSlug) {
  scriptData = await scriptService.getByClientSlug(param);
} else {
  scriptData = await scriptService.getById(param);
}
```

## 📱 Interface do Usuário

### ScriptInput.tsx (Criação)
- ✅ Campo de nome com auto-geração de slug
- ✅ Campo de slug editável
- ✅ Botão de regenerar slug (ícone Sparkles)
- ✅ Preview da URL completa
- ✅ Validação de slug único antes de criar

### ClientsManager.tsx (Gerenciamento)
- ✅ Exibição do slug em cada card de cliente
- ✅ URL completa visível com ícone de link
- ✅ Botão de copiar URL
- ✅ Edição de slug no dialog de editar cliente
- ✅ Preview da URL ao editar

## 🔄 Fluxo de Uso

### Criar Novo Cliente
1. Usuário digita "Empresa Exemplo"
2. Slug gerado automaticamente: "empresa-exemplo"
3. Preview mostra: `https://chat-teste.converseia.com/empresa-exemplo`
4. Usuário pode editar o slug se desejar
5. Ao criar, sistema valida se slug já existe
6. Link gerado usa o slug: `/{clientSlug}`

### Acessar Chat
1. Cliente acessa: `https://chat-teste.converseia.com/empresa-exemplo`
2. Sistema detecta que "empresa-exemplo" não é número
3. Busca script via `getByClientSlug("empresa-exemplo")`
4. Carrega chat widget do cliente

### Editar Cliente Existente
1. Abrir "Gerenciar Clientes"
2. Clicar em "Editar Cliente"
3. Ver/editar slug no formulário
4. Preview da URL atualiza em tempo real
5. Salvar alterações

## 🛡️ Retrocompatibilidade

Links antigos continuam funcionando:
- `/preview/12345` → Funciona normalmente
- `/{slug}` → Nova forma preferencial

## 📦 Arquivos Modificados

### Types
- `src/types/database.ts`: Adicionado `slug` em Client, `clientSlug` em ChatScript

### Services
- `src/services/database.ts`:
  - `clientService.getBySlug()`
  - `scriptService.getByClientSlug()`
  - Mapeamento de campos Baserow

### Routing
- `src/App.tsx`: Nova rota `/:clientSlug`

### Components
- `src/pages/Preview.tsx`: Detecção slug vs ID
- `src/components/ScriptInput.tsx`: Auto-geração e validação
- `src/pages/ClientsManager.tsx`: Exibição e edição de slugs

## 🔍 Funções Principais

### generateSlug()
```typescript
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
```

### getBySlug() - Client Service
```typescript
async getBySlug(slug: string): Promise<Client | null> {
  // Busca no Baserow via field_5701042
  // Fallback para localStorage
}
```

### getByClientSlug() - Script Service
```typescript
async getByClientSlug(clientSlug: string): Promise<ChatScript | null> {
  // Busca script ativo do cliente via field_5701043
  // Retorna apenas scripts ativos
}
```

## ⚠️ Importante

1. **Slugs devem ser únicos** - Sistema valida antes de criar
2. **Case insensitive** - Todos slugs são minúsculos
3. **Sem acentos** - Normalização remove acentuação
4. **URL-safe** - Apenas letras, números e hífens
5. **Baserow obrigatório** - Para produção, configure os campos no Baserow

## 🧪 Testes Recomendados

- [ ] Criar cliente com nome acentuado
- [ ] Tentar criar slug duplicado
- [ ] Editar slug de cliente existente
- [ ] Acessar via slug novo
- [ ] Acessar via ID antigo (retrocompatibilidade)
- [ ] Copiar link do cliente
- [ ] Regenerar slug automaticamente

## 📝 Próximos Passos

1. Atualizar clientes existentes sem slug (migração)
2. Adicionar validação de formato de slug (regex)
3. Histórico de slugs (se cliente mudar slug, redirecionar antigo)
4. Analytics por slug
5. Slug customizado via URL query param
