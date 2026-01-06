# 📚 Frontend Documentation - juirid-adm

## 🎯 Visão Geral

O `juirid-adm` é um sistema administrativo construído com **Next.js 15** usando **App Router** que serve como interface de gerenciamento para a plataforma JuridIA. O sistema permite administradores gerenciarem escritórios, advogados, assinaturas, parceiros e faturas.

**Tecnologias Principais:**
- **Framework:** Next.js 15 (React 18)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **UI Components:**  - shadcn/ui (base)
  - Radix UI (Select, Dialog, etc)
  - lucide-react (ícones)
- **HTTP Client:** Axios
- **Forms:** react-hook-form + Zod
- **Estado Global:** React Context API
- **Cookies:** next-client-cookies
- **Notifications:** react-hot-toast

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rotas públicas
│   │   └── auth/          # Páginas de autenticação
│   ├── (private)/         # Rotas protegidas
│   │   ├── clients/       # Gestão de advogados
│   │   ├── offices/       # Gestão de escritórios
│   │   ├── partners/      # Gestão de parceiros
│   │   ├── subscriptions/ # Gestão de assinaturas
│   │   └── fiscal/        # Notas fiscais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial (redirect)
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui + custom)
│   │   ├── button.tsx
│   │   ├── select.tsx    # Radix UI Select
│   │   ├── SortableHeader.tsx
│   │   ├── Pagination.tsx
│   │   └── ...
│   └── [feature]/        # Componentes de features específicas
├── context/              # React Contexts
│   ├── ApiContext.tsx    # HTTP client compartilhado
│   └── ThemeContext.tsx  # Tema dark/light
├── services/             # Camada de serviços (comunicação API)
│   ├── admin/
│   ├── subscription/
│   ├── partner/
│   └── fiscal/
├── @types/               # Definições TypeScript
├── lib/                  # Utilitários
│   └── utils.ts          # cn(), formatDate(), etc
├── middleware.ts         # Middleware de autenticação
└── utils/                # Funções auxiliares
```

### Padrão de Arquitetura

O projeto segue uma arquitetura em camadas:

```
Pages (App Router)
    ↓
Services (Lógica de negócio + API)
    ↓
ApiContext (HTTP Client)
    ↓
Backend API (jurid-api)
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login** (`/auth/signin`):
   - Usuário envia email/password
   - Frontend chama `POST /admin/login`
   - Backend retorna `{ token, user }`
   - Token é salvo em cookie e ApiContext
   - Redirect para `/clients`

2. **Middleware** (`middleware.ts`):
   - Verifica se rota é pública
   - Checa existência do cookie `token`
   - Redireciona para `/auth/signin` se não autenticado

3. **Logout**:
   - Remove cookie `token`
   - Redirect para `/auth/signin`

### ApiContext

O `ApiContext` é o coração da comunicação HTTP:

```typescript
interface ApiContextProps {
  PostAPI: (url: string, data: unknown, auth: boolean) => Promise<Response>;
  GetAPI: (url: string, auth: boolean) => Promise<Response>;
  PutAPI: (url: string, data: unknown, auth: boolean) => Promise<Response>;
  PatchAPI: (url: string, data: unknown, auth: boolean) => Promise<Response>;
  DeleteAPI: (url: string, auth: boolean) => Promise<Response>;
  setToken: (token: string) => void;
}
```

**Características:**
- Axios instance com `baseURL` do ambiente
- Gerenciamento automático de token Bearer
- Header `ngrok-skip-browser-warning` para desenvolvimento
- Tratamento de erros padronizado
- Sincronização token entre state e cookie

**Uso:**
```typescript
const api = useApiContext();

const response = await api.GetAPI('/admin/offices', true); // auth = true
if (response.status === 200) {
  const data = response.body;
}
```

---

## 📦 Camada de Services

### Padrão de Service

Cada feature tem seu próprio service que encapsula chamadas à API:

```typescript
// adminService.ts
export const adminService = {
  listOffices: async (api: ApiContextType, params: PaginationParams) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.GetAPI(`/admin/offices?${query}`, true);
    return handleResponse(res);
  },
  
  createOffice: async (api: ApiContextType, data: CreateOfficeDTO) => {
    const res = await api.PostAPI("/admin/offices", data, true);
    return handleResponse(res);
  },
};
```

**Benefícios:**
- ✅ Separação de responsabilidades
- ✅ Type-safe com TypeScript
- ✅ Reutilização de lógica
- ✅ Fácil manutenção e testes

### Services Disponíveis

1. **adminService** (`services/admin/`)
   - `listOffices()`, `createOffice()`, `updateOffice()`
   - `listLawyers()`, `createLawyer()`, `updateLawyer()`
   - `linkLawyerToOffice()`, `recoverPassword()`

2. **subscriptionService** (`services/subscription/`)
   - `getSubscriptions()`, `createSubscription()`
   - `renewSubscription()`, `cancelSubscription()`
   - `createCharge()`, `generateReceipt()`
   - `listInvoices()`, `createInvoice()`, `cancelInvoice()`

3. **partnerService** (`services/partner/`)
   - `getPartners()`, `createPartner()`, `updatePartner()`, `deletePartner()`

4. **fiscalService** (`services/fiscal/`)
   - `getFiscalNotes()`, `createFiscalNote()`, `cancelFiscalNote()`

---

## 🧩 Componentes de UI

### shadcn/ui + Customizações

O projeto usa componentes base do [shadcn/ui](https://ui.shadcn.com/) com customizações:

**Componentes Base:**
- `Button`, `Input`, `Label`, `Textarea`
- `Dialog`, `Modal`
- `Card`, `Badge`

**Componentes Customizados:**

#### 1. Radix UI Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select value={filter} onValueChange={setFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ALL">Todos</SelectItem>
    <SelectItem value="ACTIVE">Ativo</SelectItem>
  </SelectContent>
</Select>
```

**Características:**
- Dropdown moderno com animações
- Suporte a scroll para muitos items
- Check mark visual
- Totalmente acessível (Radix UI)

#### 2. SortableHeader

```tsx
<SortableHeader 
  label="Nome" 
  sortKey="name" 
  currentSort={sort} 
  onSort={handleSort} 
/>
```

**Características:**
- Header de tabela clicável
- Ícones de ordenação (↑↓↕)
- Feedback visual de coluna ativa
- Alterna asc/desc

#### 3. Pagination

```tsx
<Pagination
  currentPage={meta.page}
  totalPages={meta.totalPages}
  onPageChange={setPage}
  totalItems={meta.total}
/>
```

---

## 📄 Páginas Principais

### 1. Clients (`/clients`)

**Funcionalidades:**
- Listagem paginada de advogados
- Busca por nome/email
- Filtros: Role (ADMIN/USER), Escritório
- Ordenação: Nome, Email, Role
- CRUD completo (Modal)

**Estado:**
```typescript
const [lawyers, setLawyers] = useState<Lawyer[]>([]);
const [page, setPage] = useState(1);
const [search, setSearch] = useState("");
const [roleFilter, setRoleFilter] = useState("ALL");
const [officeFilter, setOfficeFilter] = useState("ALL");
const [sort, setSort] = useState({ by: "name", order: "asc" });
```

---

### 2. Offices (`/offices`)

**Funcionalidades:**
- Listagem paginada de escritórios
- Busca por nome/CPF/CNPJ
- Filtro: Tipo de Pagamento (CPF/CNPJ)
- Ordenação: Nome
- CRUD completo (Modal)
- Display dinâmico de CPF/CNPJ

---

### 3. Subscriptions (`/subscriptions`)

**Funcionalidades:**
- Listagem paginada de assinaturas
- Busca por cliente/plano
- Filtros: Status, Tipo de Pagamento, Período, Parceiro
- Ordenação: Cliente, Parceiro, Status, Validade
- Modal de detalhes com histórico
- Ações: Renovar, Cancelar, Gerar Cobrança, Recibo

---

### 4. Partners (`/partners`)

**Funcionalidades:**
- Listagem paginada de parceiros
- Busca por nome/email/código
- Filtro: Status (Ativo/Inativo)
- Ordenação: Nome, Email, Código
- CRUD completo (Modal)
- Masking de Wallet ID

---

### 5. Fiscal (`/fiscal`)

**Funcionalidades:**
- Listagem de notas fiscais (faturas Asaas)
- Criar nova fatura
- Cancelar fatura
- Detalhes de cada nota

---

## 🎨 Sistema de Design

### Tailwind Config

O projeto usa um design system customizado com cores neutras:

```javascript
colors: {
  n: {
    1: '#FCFCFC',  // Branco
    2: '#F8F9FA',  // Cinza muito claro
    3: '#EEF0F2',  // Cinza claro
    4: '#D1D5DA',  // Cinza médio
    5: '#ACB5BD',  // Cinza
    6: '#6C757D',  // Cinza escuro
    7: '#495057',  // Cinza muito escuro
    8: '#212529',  // Quase preto
  },
  primary: {
    1: '#624DE3',  // Roxo principal
  },
}
```

### Dark Mode

- Usa `next-themes` para gerenciamento
- Toggle no Sidebar
- Classes: `dark:bg-n-8`, `dark:text-n-1`, etc

### Padrões de Estilo

**Cards:**
```tsx
<div className="bg-n-1 dark:bg-n-8 rounded-xl p-6 shadow-sm">
```

**Inputs:**
```tsx
<input className="border border-n-3 dark:border-n-6 bg-transparent rounded-lg" />
```

**Tabelas:**
```tsx
<tr className="hover:bg-n-2/50 dark:hover:bg-n-6/50 transition-colors">
```

---

## 🔄 Fluxo de Dados

### Exemplo: Carregamento de Dados com Filtros

```typescript
// 1. Estados
const [data, setData] = useState([]);
const [filters, setFilters] = useState({ ... });
const [sort, setSort] = useState({ by: "name", order: "asc" });

// 2. useEffect monitora mudanças
useEffect(() => {
  loadData();
}, [page, filters, sort]);

// 3. Função de carregamento
const loadData = async () => {
  const params = {
    page,
    limit: 20,
    ...filters,  // filtros dinâmicos
    sortBy: sort.by,
    sortOrder: sort.order,
  };
  
  const response = await service.list(api, params);
  setData(response.data);
  setMeta(response.meta);
};

// 4. Handlers
const handleFilterChange = (value) => {
  setFilter(value);
  setPage(1); // Reset para primeira página
};

const handleSort = (key) => {
  setSort(prev => ({
    by: key,
    order: prev.by === key && prev.order === 'asc' ? 'desc' : 'asc'
  }));
  setPage(1);
};
```

---

## 📱 Responsividade

O sistema é **mobile-first** com breakpoints:

```javascript
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

**Padrões:**
```tsx
{/* Grid responsivo */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

{/* Heading responsive */}
<h1 className="text-xl md:text-2xl">

{/* Ocultar em mobile */}
<div className="hidden md:block">
```

---

## 🛠️ Utilitários

### `lib/utils.ts`

```typescript
// Merge de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de data
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// Versão curta
export function formatDateShort(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit"
  });
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3333

# Outras configs (se necessário)
NEXT_PUBLIC_ENV=development
```

### Scripts

```json
{
  "dev": "next dev",                    // Desenvolvimento
  "build": "next build",                // Build produção
  "start": "next start",                // Servir produção
  "lint": "next lint"                   // Linter
}
```

---

## 📘 Convenções de Código

### 1. Nomenclatura

- **Componentes:** PascalCase (`ClientModal.tsx`)
- **Services:** camelCase (`adminService.ts`)
- **Utilitários:** camelCase (`formatDate`)
- **Tipos:** PascalCase (`Lawyer`, `Office`)

### 2. Estrutura de Página

```tsx
"use client";

// Imports
import { ... } from "...";

// Component
export default function PageName() {
  // 1. Hooks e contexts
  const api = useApiContext();
  
  // 2. Estados
  const [data, setData] = useState([]);
  
  // 3. Effects
  useEffect(() => { ... }, []);
  
  // 4. Handlers
  const handleAction = () => { ... };
  
  // 5. Render
  return <div>...</div>;
}
```

### 3. Tipos

Sempre tipar props, estados e responses:

```typescript
interface PageProps {
  params: { id: string };
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}
```

---

## 🎯 Padrões de Páginas Administrativas

Todas as páginas administrativas seguem a mesma estrutura:

```tsx
<div className="flex flex-col gap-6">
  {/* Header */}
  <div className="flex justify-between items-center">
    <h1>Título</h1>
    <Button onClick={handleCreate}>+ Novo</Button>
  </div>

  {/* Busca */}
  <div className="relative">
    <Search icon />
    <input placeholder="Buscar..." />
  </div>

  {/* Filtros (Card) */}
  <div className="bg-n-2/30 dark:bg-n-7/30 rounded-xl p-4 border...">
    <div className="flex items-center gap-2 mb-3">
      <Filter icon />
      <span>Filtros</span>
      {hasActiveFilters && <button onClick={clearFilters}>Limpar</button>}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Selects Radix */}
    </div>
  </div>

  {/* Tabela */}
  <div className="bg-n-1 dark:bg-n-8 rounded-xl p-6 shadow-sm">
    <table>
      <thead>
        <SortableHeader ... />
      </thead>
      <tbody>
        {/* Rows */}
      </tbody>
    </table>
    
    <Pagination ... />
  </div>

  {/* Modals */}
  <Modal ... />
</div>
```

---

## 🧪 Fluxo de Desenvolvimento

1. **Criar Service:**
   ```typescript
   // services/feature/featureService.ts
   export const featureService = { ... };
   ```

2. **Criar Tipos:**
   ```typescript
   // @types/feature.ts
   export interface Feature { ... }
   ```

3. **Criar Página:**
   ```tsx
   // app/(private)/feature/page.tsx
   export default function FeaturePage() { ... }
   ```

4. **Criar Modal (se CRUD):**
   ```tsx
   // app/(private)/feature/_components/FeatureModal.tsx
   export default function FeatureModal() { ... }
   ```

---

## 📋 Checklist para Novos Desenvolvedores

- [ ] Ler este documento
- [ ] Clonar repositório: `git clone ...`
- [ ] Instalar dependências: `npm install`
- [ ] Configurar `.env.local` com `NEXT_PUBLIC_API_URL`
- [ ] Verificar que backend está rodando (`localhost:3333`)
- [ ] Iniciar dev server: `npm run dev`
- [ ] Acessar: `http://localhost:3000`
- [ ] Fazer login com credenciais de admin
- [ ] Explorar páginas e código

---

## 🚀 Próximos Passos (Roadmap)

- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes e2e (Playwright/Cypress)
- [ ] Storybook para componentes
- [ ] Internacionalização (i18n)
- [ ] PWA support
- [ ] Analytics integration

---

**Última Atualização:** Janeiro 2026  
**Versão:** 1.0  
**Mantido por:** Equipe JuridIA
