import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader } from '@spartan-ng/helm/card';
import { ApiService, FreightRequest } from '../../../core/services/api.service';

@Component({
  selector: 'app-meus-fretes-trucker',
  imports: [FormsModule, RouterLink, HlmButton, HlmBadge, HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader],
  templateUrl: './fretes.html',
})
export class MeusFretesTruckerComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly fretes = signal<FreightRequest[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterStatus = signal('');
  readonly hasMore = signal(false);
  readonly total = signal(0);
  private currentPage = 1;

  readonly confirmCancelId = signal<string | null>(null);
  readonly cancelingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFretes(true);
  }

  loadFretes(reset: boolean): void {
    if (reset) {
      this.currentPage = 1;
      this.fretes.set([]);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }
    this.error.set(null);

    const params: Record<string, string | number | boolean> = {
      page: this.currentPage,
      limit: 20,
    };
    if (this.filterStatus()) params['status'] = this.filterStatus();

    this.api.getPaginated<FreightRequest>('freight/mine', params).subscribe({
      next: (res) => {
        this.fretes.update((prev) => reset ? res.data : [...prev, ...res.data]);
        this.total.set(res.pagination.total);
        this.hasMore.set(res.pagination.hasNext);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar seus fretes. Tente novamente.');
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadFretes(true);
  }

  loadMore(): void {
    this.currentPage++;
    this.loadFretes(false);
  }

  abrirConfirmCancel(id: string): void {
    this.confirmCancelId.set(id);
  }

  fecharConfirmCancel(): void {
    this.confirmCancelId.set(null);
  }

  cancelarFrete(): void {
    const id = this.confirmCancelId();
    if (!id) return;
    this.cancelingId.set(id);
    this.confirmCancelId.set(null);

    this.api.delete(`freight/${id}`).subscribe({
      next: () => {
        this.fretes.update((prev) => prev.filter((f) => f.id !== id));
        this.total.update((t) => t - 1);
        this.cancelingId.set(null);
      },
      error: () => {
        this.cancelingId.set(null);
      },
    });
  }

  canCancel(status: string): boolean {
    return status === 'requested' || status === 'approved';
  }

  freightStatusLabel(status: string): string {
    const map: Record<string, string> = {
      requested: 'Aguardando', approved: 'Aprovado',
      scheduled: 'Agendado', in_transit: 'Em trânsito',
      completed: 'Concluído', cancelled: 'Cancelado',
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
