import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TruckerProfile } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';


@Component({
  selector: 'app-admin-caminhoneiros',
  standalone: true,
  imports: [FormsModule, DatePipe, HlmButton],
  templateUrl: './caminhoneiros.html',
})
export class AdminCaminhoneirosComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly caminhoneiros = signal<TruckerProfile[]>([]);
  readonly hasMore = signal(false);
  readonly total = signal(0);
  readonly error = signal<string | null>(null);
  readonly processingId = signal<string | null>(null);

  readonly confirmModal = signal<{
    id: string;
    action: 'approved' | 'rejected';
    name: string;
  } | null>(null);
  rejectionReason = '';
  readonly actionError = signal<string | null>(null);

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

    this.api
      .getPaginated<TruckerProfile>('admin/truckers/pending', {
        page: this.currentPage,
        limit: 20,
      })
      .subscribe({
        next: (res) => {
          if (reset) {
            this.caminhoneiros.set(res.data);
          } else {
            this.caminhoneiros.update((c) => [...c, ...res.data]);
          }
          this.total.set(res.pagination.total);
          this.hasMore.set(res.pagination.hasNext);
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: () => {
          this.error.set('Erro ao carregar caminhoneiros pendentes.');
          this.loading.set(false);
          this.loadingMore.set(false);
        },
      });
  }

  loadMore(): void {
    this.currentPage++;
    this.load(false);
  }

  openModal(id: string, name: string, action: 'approved' | 'rejected'): void {
    this.rejectionReason = '';
    this.actionError.set(null);
    this.confirmModal.set({ id, action, name });
  }

  confirmarAcao(): void {
    const modal = this.confirmModal();
    if (!modal) return;

    if (modal.action === 'rejected' && !this.rejectionReason.trim()) {
      this.actionError.set('Informe o motivo da reprovação.');
      return;
    }

    this.processingId.set(modal.id);
    const body: Record<string, string> = { status: modal.action };
    if (modal.action === 'rejected') body['reason'] = this.rejectionReason.trim();

    this.api.patch<TruckerProfile>(`admin/truckers/${modal.id}/approval`, body).subscribe({
      next: () => {
        this.caminhoneiros.update((c) => c.filter((t) => t.id !== modal.id));
        this.total.update((t) => t - 1);
        this.processingId.set(null);
        this.confirmModal.set(null);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        if (code === 'CAMINHONEIRO_JA_PROCESSADO') {
          this.caminhoneiros.update((c) => c.filter((t) => t.id !== modal.id));
        }
        this.processingId.set(null);
        this.confirmModal.set(null);
      },
    });
  }
}
