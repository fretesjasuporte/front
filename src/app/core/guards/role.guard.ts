import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const role = auth.userRole();
    if (role && allowedRoles.includes(role)) return true;

    // Redireciona para a área correta do usuário
    if (role === 'trucker') return router.createUrlTree(['/motorista/dashboard']);
    if (role === 'carrier') return router.createUrlTree(['/transportadora/dashboard']);
    if (role === 'admin' || role === 'operator') return router.createUrlTree(['/admin/caminhoneiros']);

    return router.createUrlTree(['/']);
  };
}
