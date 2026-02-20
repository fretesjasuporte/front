# Plano de Desenvolvimento — FretesJá Frontend

> Documento de acompanhamento das fases de integração do frontend com a API REST.
> **API Base URL:** `https://api-fretesja.onrender.com`
> Marcar cada fase como ✅ ao concluir.

---

## Status Geral

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Infraestrutura (ApiService, AuthService, Guards) | ✅ Concluída |
| 2 | Autenticação (Login, Cadastro, Recuperação de senha) | 🔲 Pendente |
| 3 | Integração das telas existentes | 🔲 Pendente |
| 4 | Área do Caminhoneiro | 🔲 Pendente |
| 5 | Área da Transportadora | 🔲 Pendente |
| 6 | Painel Admin | 🔲 Pendente |

---

## Fase 1 — Infraestrutura

> Base para todas as fases seguintes. Nenhuma integração funciona sem essa camada.

### 1.1 ApiService
- [ ] Criar `src/app/core/services/api.service.ts`
- [ ] Configurar `HttpClient` com base URL da API
- [ ] Interceptor de requisição: injeta `Authorization: Bearer {token}`
- [ ] Interceptor de resposta: ao receber `401`, tenta refresh; se falhar, redireciona para `/login`
- [ ] Método genérico de tratamento de erros (`handleApiError`)

### 1.2 AuthService
- [ ] Criar `src/app/core/services/auth.service.ts`
- [ ] Signal `currentUser` (dados do usuário logado)
- [ ] Signal `isAuthenticated` (boolean)
- [ ] Signal `userRole` (`carrier` | `trucker` | `admin` | `operator` | `null`)
- [ ] Método `login(email, password)`
- [ ] Método `logout()`
- [ ] Método `refreshToken()`
- [ ] Persistência de `access_token` e `refresh_token` no `localStorage`
- [ ] Restaurar sessão ao inicializar o app (ler token do localStorage)

### 1.3 Guards de Rota
- [ ] Criar `src/app/core/guards/auth.guard.ts` — redireciona para `/login` se não autenticado
- [ ] Criar `src/app/core/guards/role.guard.ts` — redireciona se role não permitida

### 1.4 Estrutura de Rotas
- [ ] Atualizar `app.routes.ts` com rotas protegidas por guard
- [ ] Criar rota `/login`
- [ ] Criar rota `/cadastro/caminhoneiro`
- [ ] Criar rota `/cadastro/transportadora`
- [ ] Criar rotas `/motorista/*` (protegidas por role `trucker`)
- [ ] Criar rotas `/transportadora/*` (protegidas por role `carrier`)
- [ ] Criar rotas `/admin/*` (protegidas por role `admin` | `operator`)

### 1.5 Configuração do HttpClient
- [ ] Registrar `provideHttpClient(withInterceptors([...]))` no `app.config.ts`

**Status: ✅ Concluída**

---

## Fase 2 — Autenticação

> Login, cadastro e recuperação de senha.

### Telas a criar

| Rota | Componente | Endpoint |
|------|-----------|----------|
| `/login` | `LoginComponent` | `POST /auth/login` |
| `/cadastro/caminhoneiro` | `CadastroCaminhoneiroComponent` | `POST /auth/register/trucker` |
| `/cadastro/transportadora` | `CadastroTransportadoraComponent` | `POST /auth/register/carrier` |
| `/auth/esqueci-senha` | `EsqueciSenhaComponent` | `POST /auth/forgot-password` |
| `/auth/nova-senha` | `NovaSenhaComponent` | `POST /auth/reset-password` |

### Checklist

- [x] Página de Login (`/login`) com form email + senha
- [x] Redirecionar após login conforme role (`/motorista/dashboard` ou `/transportadora/dashboard`)
- [x] Página de Cadastro de Caminhoneiro (`/cadastro/caminhoneiro`)
- [x] Página de Cadastro de Transportadora (`/cadastro/transportadora`)
- [x] Página Esqueci Minha Senha (`/auth/esqueci-senha`)
- [x] Página Nova Senha (`/auth/nova-senha`) — lê token via query param `?token=`
- [x] Navbar: exibir nome do usuário + botão Logout quando autenticado
- [x] Navbar: exibir botões de Login/Cadastro quando não autenticado
- [x] Redirecionar `/cadastrar-caminhao` para `/cadastro/caminhoneiro`

**Status: ✅ Concluída**

---

## Fase 3 — Integração das Telas Existentes

> Substituir dados mockados por dados reais da API.

### 3.1 Cargas Disponíveis (`/cargas-disponiveis`)
- [x] Integrar com `GET /loads` (substituir mock)
- [x] Filtros passados como query params (`origin_state`, `destination_state`, `cargo_type`, `truck_type_id`)
- [x] Paginação com "Carregar mais"
- [x] Botão "Tenho interesse" → `POST /loads/:id/request`
- [x] Modal de confirmação com campo de mensagem e valor proposto
- [x] Tratar erros específicos: `CAMINHONEIRO_NAO_APROVADO`, `CAMINHAO_NAO_CADASTRADO`, `JA_SOLICITADO`
- [x] Login gate para usuários não autenticados

### 3.2 Cadastrar Caminhão
- [x] Redirecionar para `/cadastro/caminhoneiro` se não autenticado
- [x] Se autenticado como trucker → `PUT /truckers/me/truck` (upsert — cria ou atualiza)
- [x] Selects de tipo de caminhão carregados de `GET /catalog/truck-types`
- [x] Selects de carroceria carregados de `GET /catalog/truck-types/:id/body-types`
- [x] Pré-preenchimento com dados existentes (`GET /truckers/me/truck`)

**Status: ✅ Concluída**

---

## Fase 4 — Área do Caminhoneiro (`/motorista/*`)

> Rotas protegidas por `authGuard` + `roleGuard(['trucker'])`.

### Telas a criar

| Rota | Componente | Endpoints |
|------|-----------|-----------|
| `/motorista/dashboard` | `TruckerDashboardComponent` | `GET /truckers/me`, `GET /freight/mine` |
| `/motorista/fretes` | `MeusFretesTruckerComponent` | `GET /freight/mine` |
| `/motorista/perfil` | `PerfilTruckerComponent` | `GET/PUT /truckers/me`, `GET/PUT /truckers/me/truck` |
| `/motorista/documentos` | `DocumentosTruckerComponent` | `GET/POST /truckers/me/documents`, `DELETE /documents/:id` |

### Checklist

- [ ] Dashboard com status do cadastro (`pending` / `approved` / `rejected`)
- [ ] Dashboard com fretes ativos
- [ ] Alerta se não tem caminhão cadastrado
- [ ] Alerta se tem documentos pendentes/reprovados
- [ ] Lista de fretes com filtro por status
- [ ] Cancelar solicitação de frete → `DELETE /freight/:id`
- [ ] Perfil: editar dados pessoais → `PUT /truckers/me`
- [ ] Perfil: editar dados do caminhão → `PUT /truckers/me/truck`
- [ ] Documentos: listar com status e botão de visualização (signed_url)
- [ ] Documentos: upload de novos documentos (multipart/form-data)
- [ ] Documentos: remover documento → `DELETE /documents/:id`

**Status: 🔲 Pendente**

---

## Fase 5 — Área da Transportadora (`/transportadora/*`)

> Rotas protegidas por `authGuard` + `roleGuard(['carrier'])`.

### Telas a criar

| Rota | Componente | Endpoints |
|------|-----------|-----------|
| `/transportadora/dashboard` | `CarrierDashboardComponent` | `GET /loads` |
| `/transportadora/cargas` | `MinhasCargasComponent` | `GET /loads` |
| `/transportadora/cargas/nova` | `NovaCargaComponent` | `POST /loads` |
| `/transportadora/cargas/:id` | `DetalheCargaComponent` | `GET/PUT/DELETE /loads/:id` |
| `/transportadora/cargas/:id/solicitacoes` | `SolicitacoesComponent` | `GET /loads/:id/freight`, `PATCH /freight/:id/status` |
| `/transportadora/perfil` | `PerfilCarrierComponent` | `GET/PUT /carriers/me` |

### Checklist

- [ ] Dashboard com resumo de cargas por status
- [ ] Dashboard com solicitações pendentes de aprovação
- [ ] Listagem de cargas com filtro por status
- [ ] Criar carga (form completo com tipos de caminhão do catálogo)
- [ ] Editar carga (draft ou published)
- [ ] Publicar / despublicar carga → `PUT /loads/:id` com `status`
- [ ] Cancelar carga → `DELETE /loads/:id`
- [ ] Ver solicitações de uma carga
- [ ] Aprovar solicitação → `PATCH /freight/:id/status` com `status: approved`
- [ ] Recusar solicitação → `PATCH /freight/:id/status` com `status: cancelled`
- [ ] Perfil: editar dados da transportadora → `PUT /carriers/me`

**Status: 🔲 Pendente**

---

## Fase 6 — Painel Admin (`/admin/*`)

> Rotas protegidas por `authGuard` + `roleGuard(['admin', 'operator'])`.

### Telas a criar

| Rota | Descrição | Endpoints |
|------|-----------|-----------|
| `/admin/caminhoneiros` | Aprovar/reprovar cadastros | `GET /admin/truckers/pending`, `PATCH /admin/truckers/:id/approval` |
| `/admin/documentos` | Revisar documentos enviados | `PATCH /admin/documents/:id/status` |
| `/admin/catalogo` | Gerenciar tipos de caminhão e carroceria | `/admin/truck-types`, `/admin/body-types` |
| `/admin/suporte` | Gerenciar chamados de suporte | `GET /admin/support/tickets`, `PATCH /admin/support/tickets/:id` |
| `/admin/usuarios` | Gerenciar admins/operadores | `GET /admin/users`, `POST /admin/users`, `DELETE /admin/users/:id` |

### Checklist

- [ ] Layout admin separado (sidebar própria)
- [ ] Lista de caminhoneiros pendentes de aprovação
- [ ] Aprovar / reprovar caminhoneiro com motivo
- [ ] Lista de documentos pendentes de revisão com visualização
- [ ] Aprovar / reprovar documento com motivo
- [ ] CRUD de tipos de caminhão
- [ ] CRUD de tipos de carroceria
- [ ] Vínculo tipo caminhão ↔ carroceria
- [ ] Lista de chamados de suporte
- [ ] Responder e fechar chamados
- [ ] Gerenciar usuários admin/operadores

**Status: 🔲 Pendente**

---

## Componentes Compartilhados

> Criar ao longo das fases conforme necessidade.

- [ ] `ToastService` + componente de notificações (sucesso/erro/aviso)
- [ ] `LoadingSpinnerComponent` — estado de carregamento
- [ ] `PaginationComponent` — paginação reutilizável
- [ ] `StatusBadgeComponent` — badge colorido por status
- [ ] `ConfirmDialogComponent` — modal de confirmação para ações destrutivas
- [ ] `EmptyStateComponent` — estado vazio de listas

---

## Notas Técnicas

- **Tokens:** `access_token` expira em 1h; `refresh_token` em 7 dias
- **Catálogo:** `GET /catalog/truck-types` e `/catalog/body-types` são públicos (sem token)
- **Documentos:** `signed_url` expira em 1h — nunca armazenar, sempre buscar da API
- **Paginação:** padrão `page=1&limit=20`, máx 100 por página
- **Datas:** sempre ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ssZ`)
- **IDs:** sempre UUID v4
