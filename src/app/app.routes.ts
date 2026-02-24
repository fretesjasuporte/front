import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ── Públicas ─────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'cargas-disponiveis',
    loadComponent: () =>
      import('./pages/cargas-disponiveis/cargas-disponiveis').then(
        (m) => m.CargasDisponiveisComponent,
      ),
  },

  {
    path: 'contato',
    loadComponent: () => import('./pages/contato/contato').then((m) => m.ContatoComponent),
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro/caminhoneiro',
    loadComponent: () =>
      import('./pages/auth/cadastro-caminhoneiro/cadastro-caminhoneiro').then(
        (m) => m.CadastroCaminhoneiroComponent,
      ),
  },
  {
    path: 'cadastro/transportadora',
    loadComponent: () =>
      import('./pages/auth/cadastro-transportadora/cadastro-transportadora').then(
        (m) => m.CadastroTransportadoraComponent,
      ),
  },
  {
    path: 'auth/esqueci-senha',
    loadComponent: () =>
      import('./pages/auth/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenhaComponent),
  },
  {
    path: 'auth/nova-senha',
    loadComponent: () =>
      import('./pages/auth/nova-senha/nova-senha').then((m) => m.NovaSenhaComponent),
  },

  // ── Suporte (qualquer usuário autenticado) ────────────────────────────────
  {
    path: 'suporte',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/suporte/suporte').then((m) => m.SuporteComponent),
  },

  // ── Cadastrar caminhão (rota inteligente: redireciona por role) ───────────
  {
    path: 'cadastrar-caminhao',
    loadComponent: () =>
      import('./pages/cadastrar-caminhao/cadastrar-caminhao').then(
        (m) => m.CadastrarCaminhaoComponent,
      ),
  },

  // ── Área do Caminhoneiro ──────────────────────────────────────────────────
  {
    path: 'motorista',
    canActivate: [authGuard, roleGuard(['trucker'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/motorista/dashboard/dashboard').then((m) => m.TruckerDashboardComponent),
      },
      {
        path: 'fretes',
        loadComponent: () =>
          import('./pages/motorista/fretes/fretes').then((m) => m.MeusFretesTruckerComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/motorista/perfil/perfil').then((m) => m.PerfilTruckerComponent),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./pages/motorista/documentos/documentos').then(
            (m) => m.DocumentosTruckerComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Área da Transportadora ────────────────────────────────────────────────
  {
    path: 'transportadora',
    canActivate: [authGuard, roleGuard(['carrier'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/transportadora/dashboard/dashboard').then(
            (m) => m.CarrierDashboardComponent,
          ),
      },
      {
        path: 'cargas',
        loadComponent: () =>
          import('./pages/transportadora/cargas/cargas').then((m) => m.MinhasCargasComponent),
      },
      {
        path: 'cargas/nova',
        loadComponent: () =>
          import('./pages/transportadora/nova-carga/nova-carga').then(
            (m) => m.NovaCargaComponent,
          ),
      },
      {
        path: 'cargas/:id',
        loadComponent: () =>
          import('./pages/transportadora/detalhe-carga/detalhe-carga').then(
            (m) => m.DetalheCargaComponent,
          ),
      },
      {
        path: 'cargas/:id/solicitacoes',
        loadComponent: () =>
          import('./pages/transportadora/solicitacoes/solicitacoes').then(
            (m) => m.SolicitacoesComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/transportadora/perfil/perfil').then((m) => m.PerfilCarrierComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin', 'operator'])],
    children: [
      {
        path: 'caminhoneiros',
        loadComponent: () =>
          import('./pages/admin/caminhoneiros/caminhoneiros').then(
            (m) => m.AdminCaminhoneirosComponent,
          ),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./pages/admin/documentos/documentos').then((m) => m.AdminDocumentosComponent),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./pages/admin/catalogo/catalogo').then((m) => m.AdminCatalogoComponent),
      },
      {
        path: 'suporte',
        loadComponent: () =>
          import('./pages/admin/suporte/suporte').then((m) => m.AdminSuporteComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/admin/usuarios/usuarios').then((m) => m.AdminUsuariosComponent),
      },
      { path: '', redirectTo: 'caminhoneiros', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
