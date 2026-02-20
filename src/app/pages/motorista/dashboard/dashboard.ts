import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HlmButton } from '@spartan-ng/helm/button';
import { ApiService, FreightRequest } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface TruckerProfile {
  id: string;
  cpf: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  profile: { name: string; phone: string; active: boolean };
}

interface FreightStats {
  requested: number;
  approved: number;
  completed: number;
  cancelled: number;
}

@Component({
  selector: 'app-trucker-dashboard',
  imports: [RouterLink, HlmButton],
  templateUrl: './dashboard.html',
})
export class TruckerDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly truckerProfile = signal<TruckerProfile | null>(null);
  readonly stats = signal<FreightStats>({ requested: 0, approved: 0, completed: 0, cancelled: 0 });
  readonly freightAprovado = signal<FreightRequest | null>(null);

  ngOnInit(): void {
    forkJoin({
      profile: this.api.get<TruckerProfile>('truckers/me'),
      fretes: this.api.getPaginated<FreightRequest>('freight/mine', { limit: 100 }),
    }).subscribe({
      next: ({ profile, fretes }) => {
        this.truckerProfile.set(profile.data);

        const data = fretes.data ?? [];
        const counts: FreightStats = { requested: 0, approved: 0, completed: 0, cancelled: 0 };
        data.forEach((f) => {
          if (f.status === 'requested') counts.requested++;
          else if (f.status === 'approved' || f.status === 'scheduled' || f.status === 'in_transit') counts.approved++;
          else if (f.status === 'completed') counts.completed++;
          else if (f.status === 'cancelled') counts.cancelled++;
        });
        this.stats.set(counts);

        const ativo = data.find((f) => f.status === 'approved' || f.status === 'scheduled' || f.status === 'in_transit');
        if (ativo) this.freightAprovado.set(ativo);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
