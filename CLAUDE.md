# Diretrizes do projeto front-fretesja

## Stack CSS — regra principal

Este projeto usa **Tailwind CSS v4** + **Spartan UI**. Sempre prefira as utilitárias dessas bibliotecas.
Nunca escreva CSS manual para o que já existe nelas.

## O que NUNCA fazer

- Não escreva CSS manual em arquivos `.scss` ou no `styles` do componente para layout, espaçamento, cores ou tipografia
- Não use `display: flex`, `margin`, `padding`, `gap`, `font-size`, `color`, `border-radius` etc. manualmente — use as classes do Tailwind
- Não crie classes CSS customizadas para grids ou layouts — use `grid`, `flex`, `gap-*`, `col-span-*` do Tailwind
- Não use `ngStyle` ou style bindings inline para estilização — use classes condicionais do Tailwind
- Não repita `@apply` no SCSS para montar componentes simples — use as classes diretamente no HTML

## O que SEMPRE fazer

### Layout e espaçamento → Tailwind
```html
<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Flex -->
<div class="flex items-center justify-between gap-4">

<!-- Padding / margin -->
<section class="px-4 py-8 md:px-8">

<!-- Largura máxima com centralização -->
<div class="max-w-screen-xl mx-auto">
```

### Tipografia → Tailwind
```html
<h1 class="text-3xl font-bold tracking-tight text-foreground">
<p class="text-sm text-muted-foreground leading-relaxed">
```

### Cores → variáveis do tema Spartan (via Tailwind)
```html
<!-- Usar as cores semânticas do tema, não cores hardcoded -->
<div class="bg-background text-foreground">
<div class="bg-card text-card-foreground border border-border rounded-lg">
<span class="text-muted-foreground">
<div class="bg-primary text-primary-foreground">
```

### Componentes → Spartan UI (hlm*)
```html
<!-- Botões -->
<button hlmBtn>Padrão</button>
<button hlmBtn variant="outline">Outline</button>
<button hlmBtn variant="ghost">Ghost</button>
<button hlmBtn variant="destructive">Deletar</button>
<button hlmBtn size="sm">Pequeno</button>

<!-- Input -->
<input hlmInput type="text" placeholder="Digite aqui" />

<!-- Badge -->
<span hlmBadge>Ativo</span>
<span hlmBadge variant="secondary">Pendente</span>
<span hlmBadge variant="destructive">Erro</span>

<!-- Card -->
<div hlmCard>
  <div hlmCardHeader>
    <h3 hlmCardTitle>Título</h3>
    <p hlmCardDescription>Descrição</p>
  </div>
  <div hlmCardContent>Conteúdo</div>
  <div hlmCardFooter>Rodapé</div>
</div>

<!-- Separator -->
<hlm-separator />
```

### Responsividade → breakpoints do Tailwind
```html
<!-- Mobile-first sempre -->
<div class="flex flex-col md:flex-row">
<div class="text-sm md:text-base lg:text-lg">
<div class="hidden md:block">
```

### Dark mode → automático via tema
O dark mode é controlado pela classe `.dark` no `<html>`. As variáveis CSS do tema trocam automaticamente.
Não crie estilos alternativos manuais — use `dark:` prefix do Tailwind se necessário:
```html
<div class="bg-white dark:bg-gray-900">
```

## Quando CSS manual é permitido

Apenas para casos que o Tailwind não cobre nativamente:
- Animações complexas com keyframes específicos do domínio
- Pseudo-elementos (`::before`, `::after`) com lógica não expressável em classes
- Scroll customizado com vendor-prefixes
- Nesse caso: usar `@layer components` ou `@layer utilities` no `styles.scss`

## Componentes Spartan UI disponíveis

Instalados em `src/libs/ui/`, importados via alias `@spartan-ng/helm/*`:
- `button` — `HlmButtonDirective`
- `input` — `HlmInputDirective`
- `card` — `HlmCardDirective` e variantes
- `badge` — `HlmBadgeDirective`
- `separator` — `HlmSeparatorComponent`

Para adicionar novos:
```bash
printf '\n' | npx ng g @spartan-ng/cli:ui <nome> --directory src/libs/ui --defaults
```

## Fontes de referência

- Tailwind v4 utilities: https://tailwindcss.com/docs
- Spartan UI components: https://spartan.ng/documentation
