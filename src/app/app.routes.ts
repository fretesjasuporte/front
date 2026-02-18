import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'cadastrar-caminhao',
    loadComponent: () =>
      import('./pages/cadastrar-caminhao/cadastrar-caminhao').then(
        (m) => m.CadastrarCaminhaoComponent,
      ),
  },
  {
    path: 'cargas-disponiveis',
    loadComponent: () =>
      import('./pages/cargas-disponiveis/cargas-disponiveis').then(
        (m) => m.CargasDisponiveisComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
