import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SupportTicket } from '../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-suporte',
  standalone: true,
  imports: [FormsModule, DatePipe, HlmButton, HlmBadge, HlmInput],
  templateUrl: './suporte.html',
})
export class SuporteComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly tickets = signal<SupportTicket[]>([]);
  readonly hasMore = signal(false);
  readonly total = signal(0);
  readonly error = signal<string | null>(null);

  filterStatus = '';

  readonly showForm = signal(false);
  newSubject = '';
  newMessage = '';
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal(false);

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
    if (this.filterStatus) params['status'] = this.filterStatus;

    this.api.getPaginated<SupportTicket>('support/tickets/mine', params).subscribe({
      next: (res) => {
        if (reset) {
          this.tickets.set(res.data);
        } else {
          this.tickets.update((t) => [...t, ...res.data]);
        }
        this.total.set(res.pagination.total);
        this.hasMore.set(res.pagination.hasNext);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar chamados.');
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

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }

  openTicket(): void {
    if (!this.newSubject.trim() || !this.newMessage.trim()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.api
      .post<SupportTicket>('support/tickets', {
        subject: this.newSubject.trim(),
        message: this.newMessage.trim(),
      })
      .subscribe({
        next: (res) => {
          this.tickets.update((t) => [res.data, ...t]);
          this.total.update((v) => v + 1);
          this.newSubject = '';
          this.newMessage = '';
          this.submitting.set(false);
          this.submitSuccess.set(true);
          this.showForm.set(false);
        },
        error: (err) => {
          this.submitError.set(err?.error?.error?.message || 'Erro ao abrir chamado.');
          this.submitting.set(false);
        },
      });
  }

  statusClass(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'secondary',
      in_progress: 'default',
      closed: 'outline',
    };
    return map[status] ?? 'outline';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      open: 'Aberto',
      in_progress: 'Em atendimento',
      closed: 'Encerrado',
    };
    return map[status] ?? status;
  }
}
