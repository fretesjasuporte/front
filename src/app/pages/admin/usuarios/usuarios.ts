import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AdminUser } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmInput } from '@spartan-ng/helm/input';
import { MaskDirective } from '../../../core/directives/mask.directive';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [FormsModule, DatePipe, HlmButton, HlmBadge, HlmInput, MaskDirective],
  templateUrl: './usuarios.html',
})
export class AdminUsuariosComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly users = signal<AdminUser[]>([]);
  readonly hasMore = signal(false);
  readonly total = signal(0);
  readonly error = signal<string | null>(null);

  filterRole = '';
  readonly showCreateForm = signal(false);

  newName = '';
  newEmail = '';
  newPassword = '';
  newRole: 'admin' | 'operator' = 'operator';
  newPhone = '';
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  readonly deactivateModal = signal<AdminUser | null>(null);
  readonly deactivating = signal(false);

  private currentPage = 1;

  ngOnInit(): void {
    this.load(true);
  }

  load(reset: boolean): void {
    if (reset) {
      this.currentPage = 1;
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const params: Record<string, string | number> = {
      page: this.currentPage,
      limit: 20,
    };
    if (this.filterRole) params['role'] = this.filterRole;

    this.api.getPaginated<AdminUser>('admin/users', params).subscribe({
      next: (res) => {
        if (reset) {
          this.users.set(res.data);
        } else {
          this.users.update((u) => [...u, ...res.data]);
        }
        this.total.set(res.pagination.total);
        this.hasMore.set(res.pagination.hasNext);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar usuários.');
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  applyFilter(): void {
    this.load(true);
  }

  loadMore(): void {
    this.currentPage++;
    this.load(false);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    this.createError.set(null);
  }

  createUser(): void {
    if (!this.newName.trim() || !this.newEmail.trim() || !this.newPassword.trim()) return;

    this.creating.set(true);
    this.createError.set(null);

    const body: Record<string, string> = {
      name: this.newName.trim(),
      email: this.newEmail.trim(),
      password: this.newPassword,
      role: this.newRole,
    };
    if (this.newPhone.trim()) body['phone'] = this.newPhone.trim();

    this.api.post<AdminUser>('admin/users', body).subscribe({
      next: (res) => {
        this.users.update((u) => [res.data, ...u]);
        this.total.update((t) => t + 1);
        this.newName = '';
        this.newEmail = '';
        this.newPassword = '';
        this.newRole = 'operator';
        this.newPhone = '';
        this.showCreateForm.set(false);
        this.creating.set(false);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        this.createError.set(
          code === 'EMAIL_JA_CADASTRADO'
            ? 'Este e-mail já está cadastrado.'
            : 'Erro ao criar usuário.',
        );
        this.creating.set(false);
      },
    });
  }

  openDeactivate(user: AdminUser): void {
    this.deactivateModal.set(user);
  }

  confirmDeactivate(): void {
    const user = this.deactivateModal();
    if (!user) return;

    this.deactivating.set(true);
    this.api.delete(`admin/users/${user.id}`).subscribe({
      next: () => {
        this.users.update((u) => u.filter((i) => i.id !== user.id));
        this.total.update((t) => t - 1);
        this.deactivating.set(false);
        this.deactivateModal.set(null);
      },
      error: () => {
        this.deactivating.set(false);
        this.deactivateModal.set(null);
      },
    });
  }

  roleLabel(role: string): string {
    return role === 'admin' ? 'Admin' : 'Operador';
  }

  roleClass(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    return role === 'admin' ? 'default' : 'secondary';
  }
}
