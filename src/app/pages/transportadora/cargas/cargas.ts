import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader } from '@spartan-ng/helm/card';
import { ApiService, Load } from '../../../core/services/api.service';
import { TRUCK_SVG_MAP, BODY_SVG_MAP } from '../../../core/utils/vehicle-icons';

@Component({
  selector: 'app-minhas-cargas',
  imports: [FormsModule, RouterLink, HlmButton, HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader],
  templateUrl: './cargas.html',
})
export class MinhasCargasComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly cargas = signal<Load[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterStatus = signal('');
  readonly hasMore = signal(false);
  readonly total = signal(0);
  private currentPage = 1;

  readonly confirmDeleteId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly publishingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCargas(true);
  }

  loadCargas(reset: boolean): void {
    if (reset) {
      this.currentPage = 1;
      this.cargas.set([]);
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

    this.api.getPaginated<Load>('loads', params).subscribe({
      next: (res) => {
        this.cargas.update((prev) => reset ? res.data : [...prev, ...res.data]);
        this.total.set(res.pagination.total);
        this.hasMore.set(res.pagination.hasNext);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar as cargas. Tente novamente.');
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadCargas(true);
  }

  loadMore(): void {
    this.currentPage++;
    this.loadCargas(false);
  }

  publicarCarga(id: string): void {
    this.publishingId.set(id);
    this.api.put<Load>(`loads/${id}`, { status: 'published' }).subscribe({
      next: (res) => {
        this.cargas.update((prev) =>
          prev.map((c) => (c.id === id ? res.data : c))
        );
        this.publishingId.set(null);
      },
      error: () => {
        this.publishingId.set(null);
      },
    });
  }

  confirmarDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  cancelarDelete(): void {
    this.confirmDeleteId.set(null);
  }

  deleteCarga(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.deletingId.set(id);
    this.confirmDeleteId.set(null);
    this.api.delete(`loads/${id}`).subscribe({
      next: () => {
        this.cargas.update((prev) => prev.filter((c) => c.id !== id));
        this.total.update((t) => t - 1);
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Rascunho',
      published: 'Publicada',
      in_progress: 'Em andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
      published: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-primary/10 text-primary border-primary/20',
      cancelled: 'bg-red-100 text-red-600 border-red-200',
    };
    return map[status] ?? '';
  }

  canPublish(status: string): boolean {
    return status === 'draft';
  }

  canDelete(status: string): boolean {
    return status !== 'completed';
  }

  canViewRequests(status: string): boolean {
    return status === 'published' || status === 'in_progress';
  }

  formatValue(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  truckSvgFor(name: string): SafeHtml | null {
    const data = TRUCK_SVG_MAP[name];
    return data ? this.sanitizer.bypassSecurityTrustHtml(data.svgStr) : null;
  }

  truckCapacityFor(name: string): string {
    return TRUCK_SVG_MAP[name]?.capacity ?? '';
  }

  bodySvgFor(name: string): SafeHtml | null {
    const data = BODY_SVG_MAP[name];
    return data ? this.sanitizer.bypassSecurityTrustHtml(data.svgStr) : null;
  }
}
