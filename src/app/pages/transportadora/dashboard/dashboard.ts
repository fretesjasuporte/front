import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Stats {
  draft: number;
  published: number;
  in_progress: number;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-carrier-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class CarrierDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly stats = signal<Stats>({ draft: 0, published: 0, in_progress: 0, completed: 0, total: 0 });

  ngOnInit(): void {
    forkJoin({
      draft: this.api.getPaginated('loads', { status: 'draft', limit: 1 }),
      published: this.api.getPaginated('loads', { status: 'published', limit: 1 }),
      in_progress: this.api.getPaginated('loads', { status: 'in_progress', limit: 1 }),
      completed: this.api.getPaginated('loads', { status: 'completed', limit: 1 }),
    }).subscribe({
      next: ({ draft, published, in_progress, completed }) => {
        this.stats.set({
          draft: draft.pagination.total,
          published: published.pagination.total,
          in_progress: in_progress.pagination.total,
          completed: completed.pagination.total,
          total: draft.pagination.total + published.pagination.total + in_progress.pagination.total + completed.pagination.total,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
