import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { ApiService, FreightRequest, Load } from '../../../core/services/api.service';

@Component({
  selector: 'app-solicitacoes',
  imports: [FormsModule, RouterLink, HlmButton, HlmBadge],
  templateUrl: './solicitacoes.html',
})
export class SolicitacoesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loadId = signal('');
  readonly carga = signal<Load | null>(null);
  readonly solicitacoes = signal<FreightRequest[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly processingId = signal<string | null>(null);

  readonly confirmModal = signal<{ id: string; action: 'approved' | 'cancelled' } | null>(null);
  readonly rejectionReason = signal('');
  readonly actionError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/transportadora/cargas']);
      return;
    }
    this.loadId.set(id);

    forkJoin({
      carga: this.api.get<Load>(`loads/${id}`),
      solicitacoes: this.api.get<FreightRequest[]>(`loads/${id}/freight`),
    }).subscribe({
      next: ({ carga, solicitacoes }) => {
        this.carga.set(carga.data);
        this.solicitacoes.set(solicitacoes.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        if (code === 'CARGA_NAO_ENCONTRADA' || code === 'ACESSO_NEGADO') {
          this.router.navigate(['/transportadora/cargas']);
        } else {
          this.error.set('Erro ao carregar as solicitações. Tente novamente.');
          this.loading.set(false);
        }
      },
    });
  }

  openConfirm(freightId: string, action: 'approved' | 'cancelled'): void {
    this.rejectionReason.set('');
    this.actionError.set(null);
    this.confirmModal.set({ id: freightId, action });
  }

  closeModal(): void {
    this.confirmModal.set(null);
    this.actionError.set(null);
  }

  confirmarAcao(): void {
    const modal = this.confirmModal();
    if (!modal) return;

    if (modal.action === 'cancelled' && !this.rejectionReason().trim()) {
      this.actionError.set('Informe o motivo da recusa.');
      return;
    }

    this.processingId.set(modal.id);
    this.actionError.set(null);

    const payload: Record<string, string> = { status: modal.action };
    if (modal.action === 'cancelled') {
      payload['cancellation_reason'] = this.rejectionReason().trim();
    }

    this.api.patch<FreightRequest>(`freight/${modal.id}/status`, payload).subscribe({
      next: (res) => {
        this.solicitacoes.update((prev) =>
          prev.map((s) => (s.id === modal.id ? res.data : s))
        );
        this.processingId.set(null);
        this.confirmModal.set(null);
      },
      error: (err) => {
        this.processingId.set(null);
        const code = err?.error?.error?.code;
        if (code === 'STATUS_INVALIDO') {
          this.actionError.set('Esta solicitação não pode mais ser alterada.');
        } else if (code === 'ACESSO_NEGADO') {
          this.actionError.set('Você não tem permissão para alterar esta solicitação.');
        } else {
          this.actionError.set('Erro ao processar. Tente novamente.');
        }
      },
    });
  }

  freightStatusLabel(status: string): string {
    const map: Record<string, string> = {
      requested: 'Aguardando', approved: 'Aprovado',
      scheduled: 'Agendado', in_transit: 'Em trânsito',
      completed: 'Concluído', cancelled: 'Recusado',
    };
    return map[status] ?? status;
  }

  freightStatusClass(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      requested: 'secondary',
      approved: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return map[status] ?? 'outline';
  }

  formatValue(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
}
