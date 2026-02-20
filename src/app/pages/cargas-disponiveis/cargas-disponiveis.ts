import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

export interface Load {
  id: string;
  title: string;
  status: string;
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  cargo_type: string;
  weight_kg: number;
  freight_value: number;
  featured: boolean;
  truck_type?: { id: string; name: string };
  body_type?: { id: string; name: string };
  pickup_date?: string;
  carrier: { legal_name: string; trade_name?: string };
  created_at: string;
}

export interface TruckType {
  id: string;
  name: string;
}

@Component({
  selector: 'app-cargas-disponiveis',
  imports: [FormsModule, RouterLink, HlmButton, HlmBadge, HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader, HlmInput],
  templateUrl: './cargas-disponiveis.html',
})
export class CargasDisponiveisComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  // Estado principal
  readonly cargas = signal<Load[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly hasMore = signal(false);
  private currentPage = 1;

  // Catálogo
  readonly truckTypes = signal<TruckType[]>([]);

  // Filtros
  readonly filterOrigemEstado = signal('');
  readonly filterDestinoEstado = signal('');
  readonly filterTipoCarga = signal('');
  readonly filterTruckTypeId = signal('');

  // Modal
  readonly cargaSelecionada = signal<Load | null>(null);
  readonly modalMessage = signal('');
  readonly modalValue = signal<number | ''>('');
  readonly submitting = signal(false);
  readonly modalError = signal<string | null>(null);
  readonly modalSuccess = signal(false);

  readonly estados = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' },
    { uf: 'AP', nome: 'Amapá' }, { uf: 'AM', nome: 'Amazonas' },
    { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' },
    { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' },
    { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' },
    { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
    { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' },
    { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' },
  ];

  ngOnInit(): void {
    this.api.get<TruckType[]>('catalog/truck-types').subscribe({
      next: (res) => this.truckTypes.set(res.data),
      error: () => {},
    });

    if (this.auth.isAuthenticated()) {
      this.loadCargas(true);
    }
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
      status: 'published',
      page: this.currentPage,
      limit: 20,
    };

    if (this.filterOrigemEstado()) params['origin_state'] = this.filterOrigemEstado();
    if (this.filterDestinoEstado()) params['destination_state'] = this.filterDestinoEstado();
    if (this.filterTipoCarga()) params['cargo_type'] = this.filterTipoCarga();
    if (this.filterTruckTypeId()) params['truck_type_id'] = this.filterTruckTypeId();

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

  clearFilters(): void {
    this.filterOrigemEstado.set('');
    this.filterDestinoEstado.set('');
    this.filterTipoCarga.set('');
    this.filterTruckTypeId.set('');
    this.loadCargas(true);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filterOrigemEstado() ||
      this.filterDestinoEstado() ||
      this.filterTipoCarga() ||
      this.filterTruckTypeId()
    );
  }

  abrirModal(carga: Load): void {
    this.cargaSelecionada.set(carga);
    this.modalMessage.set('');
    this.modalValue.set('');
    this.modalError.set(null);
    this.modalSuccess.set(false);
  }

  fecharModal(): void {
    this.cargaSelecionada.set(null);
  }

  confirmarInteresse(): void {
    const carga = this.cargaSelecionada();
    if (!carga) return;

    this.submitting.set(true);
    this.modalError.set(null);

    const body: Record<string, string | number> = {};
    if (this.modalMessage()) body['trucker_message'] = this.modalMessage();
    if (this.modalValue() !== '') body['agreed_value'] = Number(this.modalValue());

    this.api.post(`loads/${carga.id}/request`, body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.modalSuccess.set(true);
        setTimeout(() => this.fecharModal(), 2500);
      },
      error: (err) => {
        this.submitting.set(false);
        const code = err?.code;
        if (code === 'JA_SOLICITADO') {
          this.modalError.set('Você já demonstrou interesse nessa carga.');
        } else if (code === 'CAMINHONEIRO_NAO_APROVADO') {
          this.modalError.set('Seu cadastro ainda está em análise. Aguarde a aprovação para solicitar cargas.');
        } else if (code === 'CAMINHAO_NAO_CADASTRADO') {
          this.modalError.set('Você precisa cadastrar seu caminhão antes de solicitar cargas.');
        } else {
          this.modalError.set('Ocorreu um erro.' + + err?.error.message);
        }
      },
    });
  }

  formatValue(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return `${diff} dias atrás`;
  }
}
