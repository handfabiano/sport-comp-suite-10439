# Design System - SportManager

## 📐 Visão Geral

Este documento define o sistema de design completo do SportManager, incluindo cores, tipografia, espaçamentos, componentes e padrões de uso.

## 🎨 Paleta de Cores

### Cores Primárias
Definidas em `src/index.css` usando formato HSL:

```css
--primary: hsl(222, 47%, 11%)        /* Azul escuro principal */
--primary-foreground: hsl(210, 40%, 98%)

--secondary: hsl(210, 40%, 96.1%)    /* Cinza claro */
--secondary-foreground: hsl(222.2, 47.4%, 11.2%)

--accent: hsl(210, 40%, 96.1%)       /* Destaque */
--accent-foreground: hsl(222.2, 47.4%, 11.2%)
```

### Cores Semânticas

```css
--success: hsl(142, 71%, 45%)        /* Verde - sucesso */
--warning: hsl(38, 92%, 50%)         /* Amarelo - avisos */
--destructive: hsl(0, 84%, 60%)      /* Vermelho - erros */
--info: hsl(199, 89%, 48%)           /* Azul - informações */
```

### Cores de Fundo e Texto

```css
--background: hsl(0, 0%, 100%)       /* Fundo principal */
--foreground: hsl(222.2, 84%, 4.9%)  /* Texto principal */

--muted: hsl(210, 40%, 96.1%)        /* Fundo secundário */
--muted-foreground: hsl(215.4, 16.3%, 46.9%)  /* Texto secundário */

--card: hsl(0, 0%, 100%)             /* Fundo de cards */
--card-foreground: hsl(222.2, 84%, 4.9%)
```

### Uso de Cores

✅ **CORRETO:**
```tsx
<div className="bg-primary text-primary-foreground">
<Button variant="destructive">Excluir</Button>
<Badge className="bg-success">Ativo</Badge>
```

❌ **EVITAR:**
```tsx
<div className="bg-blue-500 text-white">  /* Não usar cores diretas */
<div style={{ color: '#ff0000' }}>       /* Não usar inline styles */
```

## 📝 Tipografia

### Família de Fontes

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial
```

### Escala de Tamanhos

```css
text-xs      /* 12px - Notas e labels secundários */
text-sm      /* 14px - Texto secundário */
text-base    /* 16px - Texto principal */
text-lg      /* 18px - Subtítulos */
text-xl      /* 20px - Títulos de cards */
text-2xl     /* 24px - Títulos de seções */
text-3xl     /* 30px - Títulos de páginas */
text-4xl     /* 36px - Títulos hero */
```

### Pesos

```css
font-normal   /* 400 - Texto padrão */
font-medium   /* 500 - Ênfase leve */
font-semibold /* 600 - Títulos e botões */
font-bold     /* 700 - Destaques importantes */
```

### Exemplo de Uso

```tsx
<h1 className="text-3xl font-bold text-foreground">Título da Página</h1>
<h2 className="text-2xl font-semibold">Seção</h2>
<p className="text-base text-muted-foreground">Texto descritivo</p>
<span className="text-sm font-medium">Label</span>
```

## 📏 Espaçamentos

### Escala de Spacing (baseada em 4px)

```css
space-0     /* 0px */
space-1     /* 4px */
space-2     /* 8px */
space-3     /* 12px */
space-4     /* 16px */
space-6     /* 24px */
space-8     /* 32px */
space-12    /* 48px */
space-16    /* 64px */
```

### Padding de Containers

```tsx
<div className="p-4">      {/* Mobile: 16px */}
<div className="p-6">      {/* Desktop: 24px */}
<div className="px-4 py-6"> {/* Horizontal 16px, Vertical 24px */}
```

### Gaps em Grids e Flex

```tsx
<div className="flex gap-4">       {/* 16px entre itens */}
<div className="grid gap-6">       {/* 24px entre itens */}
<div className="space-y-4">        {/* 16px vertical entre filhos */}
```

## 🧩 Componentes Base

### Button

```tsx
// Variantes
<Button variant="default">Principal</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destruir</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal
  </CardContent>
  <CardFooter>
    Ações ou informações adicionais
  </CardFooter>
</Card>
```

### Badge

```tsx
<Badge variant="default">Padrão</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Erro</Badge>
```

## 🎭 Componentes Reutilizáveis

### DataTable

Tabela genérica com suporte a loading, mensagens vazias e ações.

```tsx
import DataTable, { Column } from "@/components/shared/DataTable";

const columns: Column<Evento>[] = [
  { header: "Nome", accessor: "nome" },
  { header: "Data", accessor: "data_inicio", cell: (value) => formatDate(value) },
];

<DataTable
  data={eventos}
  columns={columns}
  loading={loading}
  emptyMessage="Nenhum evento encontrado"
  onRowClick={(evento) => navigate(`/eventos/${evento.id}`)}
/>
```

### EntityCard

Card reutilizável para exibir entidades (atletas, equipes, eventos).

```tsx
import EntityCard from "@/components/shared/EntityCard";

<EntityCard
  title={atleta.nome}
  subtitle={atleta.posicao}
  imageUrl={atleta.foto_url}
  badges={[
    { label: atleta.categoria, variant: "default" },
    { label: `#${atleta.numero_uniforme}`, variant: "secondary" }
  ]}
  onClick={() => navigate(`/atletas/${atleta.id}`)}
/>
```

### FilterBar

Barra de filtros com busca e filtros customizáveis.

```tsx
import FilterBar from "@/components/shared/FilterBar";

<FilterBar
  searchValue={busca}
  onSearchChange={setBusca}
  searchPlaceholder="Buscar eventos..."
  filters={[
    {
      key: "status",
      label: "Status",
      options: [
        { value: "inscricoes_abertas", label: "Inscrições Abertas" },
        { value: "em_andamento", label: "Em Andamento" }
      ]
    }
  ]}
  onFilterChange={(key, value) => setFiltros({ ...filtros, [key]: value })}
  actions={<Button>Novo Evento</Button>}
/>
```

## 🪝 Custom Hooks

### useEvento

```tsx
import { useEvento } from "@/hooks/useEvento";

// Listar todos
const { eventos, loading, fetchEventos } = useEvento();

// Buscar um específico
const { evento, loading } = useEvento(eventoId);

// Criar, atualizar, deletar
const { createEvento, updateEvento, deleteEvento } = useEvento();
```

### useAtleta

```tsx
import { useAtleta } from "@/hooks/useAtleta";

const { atletas, loading, fetchAtletas } = useAtleta();

// Com filtros
fetchAtletas({ categoria: "Sub-15", equipeId: "abc123" });
```

### usePartida

```tsx
import { usePartida } from "@/hooks/usePartida";

const { partidas, updatePlacar, finalizarPartida } = usePartida();
```

## 🎬 Animações

### Classes Disponíveis

```tsx
// Fade
<div className="animate-fade-in">     {/* Fade in com slide */}
<div className="animate-fade-out">    {/* Fade out */}

// Scale
<div className="animate-scale-in">    {/* Scale in */}
<div className="hover-scale">         {/* Hover scale effect */}

// Slide
<div className="animate-slide-in-right">  {/* Slide from right */}

// Combined
<div className="animate-enter">       {/* Fade + Scale in */}
```

### Uso em Componentes

```tsx
<Card className="animate-fade-in hover-scale">
  <CardContent>...</CardContent>
</Card>
```

## 🛡️ Error Boundaries

Sempre envolva rotas principais com ErrorBoundary:

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";

<ErrorBoundary>
  <MinhaRota />
</ErrorBoundary>
```

## 📱 Responsividade

### Breakpoints

```css
sm: 640px   /* Tablet pequeno */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Grid Responsivo

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

### Hide/Show por Breakpoint

```tsx
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## ✅ Melhores Práticas

1. **Sempre use classes semânticas** do design system
2. **Não use cores ou tamanhos inline** - use classes do Tailwind
3. **Componentes reutilizáveis** para evitar duplicação
4. **Custom hooks** para lógica de negócio
5. **Error Boundaries** em rotas principais
6. **Animações suaves** para melhor UX
7. **Design responsivo** em todos os componentes
8. **Acessibilidade** - use labels, aria-labels e navegação por teclado

## 📦 Estrutura de Arquivos

```
src/
├── components/
│   ├── shared/           # Componentes reutilizáveis
│   │   ├── DataTable.tsx
│   │   ├── EntityCard.tsx
│   │   └── FilterBar.tsx
│   ├── ErrorBoundary.tsx
│   └── ui/               # Componentes shadcn/ui
├── hooks/
│   ├── useEvento.tsx
│   ├── useAtleta.tsx
│   └── usePartida.tsx
├── pages/                # Páginas da aplicação
└── lib/
    └── utils.ts          # Utilitários
```

---

**Versão:** 1.0.0  
**Última atualização:** 2024
