import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { ApiService, Load } from '../../../core/services/api.service';

interface TruckType { id: string; name: string; }
interface BodyType { id: string; name: string; }

const ESTADOS = [
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

@Component({
  selector: 'app-detalhe-carga',
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './detalhe-carga.html',
})
export class DetalheCargaComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly estados = ESTADOS;
  readonly carga = signal<Load | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly togglingStatus = signal(false);
  readonly error = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly confirmDelete = signal(false);
  readonly truckTypes = signal<TruckType[]>([]);
  readonly bodyTypes = signal<BodyType[]>([]);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    origin_city: ['', Validators.required],
    origin_state: ['', Validators.required],
    origin_zip_code: [''],
    origin_street: [''],
    origin_number: [''],
    origin_neighborhood: [''],
    destination_city: ['', Validators.required],
    destination_state: ['', Validators.required],
    destination_zip_code: [''],
    cargo_type: ['', Validators.required],
    weight_kg: [null as number | null, [Validators.required, Validators.min(1)]],
    freight_value: [null as number | null, [Validators.required, Validators.min(1)]],
    truck_type_id: [''],
    body_type_id: [''],
    pickup_date: [''],
    estimated_delivery_date: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/transportadora/cargas']);
      return;
    }

    this.api.get<Load>(`loads/${id}`).subscribe({
      next: (res) => {
        this.carga.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        if (code === 'CARGA_NAO_ENCONTRADA' || code === 'ACESSO_NEGADO') {
          this.router.navigate(['/transportadora/cargas']);
        } else {
          this.error.set('Erro ao carregar a carga. Tente novamente.');
          this.loading.set(false);
        }
      },
    });

    this.api.get<TruckType[]>('catalog/truck-types').subscribe({
      next: (res) => this.truckTypes.set(res.data ?? []),
      error: () => {},
    });
  }

  toggleEdit(): void {
    const c = this.carga();
    if (!c) return;
    if (!this.editMode()) {
      this.form.patchValue({
        title: c.title,
        origin_city: c.origin.city,
        origin_state: c.origin.state,
        origin_zip_code: c.origin.zip_code ?? '',
        origin_street: c.origin.street ?? '',
        origin_number: c.origin.number ?? '',
        origin_neighborhood: c.origin.neighborhood ?? '',
        destination_city: c.destination.city,
        destination_state: c.destination.state,
        destination_zip_code: c.destination.zip_code ?? '',
        cargo_type: c.cargo_type,
        weight_kg: c.weight_kg,
        freight_value: c.freight_value,
        truck_type_id: c.truck_type?.id ?? '',
        body_type_id: c.body_type?.id ?? '',
        pickup_date: c.pickup_date ?? '',
        estimated_delivery_date: c.estimated_delivery_date ?? '',
        notes: c.notes ?? '',
      });
      if (c.truck_type?.id) {
        this.api.get<BodyType[]>(`catalog/truck-types/${c.truck_type.id}/body-types`).subscribe({
          next: (res) => this.bodyTypes.set(res.data ?? []),
          error: () => {},
        });
      }
    }
    this.editMode.set(!this.editMode());
    this.saveError.set(null);
  }

  onTruckTypeChange(id: string | null): void {
    this.form.patchValue({ body_type_id: '' });
    this.bodyTypes.set([]);
    if (id) {
      this.api.get<BodyType[]>(`catalog/truck-types/${id}/body-types`).subscribe({
        next: (res) => this.bodyTypes.set(res.data ?? []),
        error: () => {},
      });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  saveEdit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const id = this.carga()?.id;
    if (!id) return;

    this.saving.set(true);
    this.saveError.set(null);

    const v = this.form.value;
    const payload: Record<string, unknown> = {
      title: v.title,
      origin: {
        city: v.origin_city,
        state: v.origin_state,
        ...(v.origin_zip_code && { zip_code: v.origin_zip_code }),
        ...(v.origin_street && { street: v.origin_street }),
        ...(v.origin_number && { number: v.origin_number }),
        ...(v.origin_neighborhood && { neighborhood: v.origin_neighborhood }),
      },
      destination: {
        city: v.destination_city,
        state: v.destination_state,
        ...(v.destination_zip_code && { zip_code: v.destination_zip_code }),
      },
      cargo_type: v.cargo_type,
      weight_kg: v.weight_kg,
      freight_value: v.freight_value,
    };
    if (v.truck_type_id) payload['truck_type_id'] = v.truck_type_id;
    if (v.body_type_id) payload['body_type_id'] = v.body_type_id;
    if (v.pickup_date) payload['pickup_date'] = v.pickup_date;
    if (v.estimated_delivery_date) payload['estimated_delivery_date'] = v.estimated_delivery_date;
    payload['notes'] = v.notes ?? '';

    this.api.put<Load>(`loads/${id}`, payload).subscribe({
      next: (res) => {
        this.carga.set(res.data);
        this.saving.set(false);
        this.editMode.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        const code = err?.error?.error?.code;
        if (code === 'STATUS_INVALIDO') {
          this.saveError.set('Esta carga não pode mais ser editada no status atual.');
        } else if (code === 'COMBINACAO_INCOMPATIVEL') {
          this.saveError.set('A carroceria selecionada não é compatível com esse tipo de caminhão.');
        } else {
          this.saveError.set('Erro ao salvar as alterações. Tente novamente.');
        }
      },
    });
  }

  toggleStatus(): void {
    const c = this.carga();
    if (!c) return;
    const newStatus = c.status === 'draft' ? 'published' : 'draft';
    this.togglingStatus.set(true);

    this.api.put<Load>(`loads/${c.id}`, { status: newStatus }).subscribe({
      next: (res) => {
        this.carga.set(res.data);
        this.togglingStatus.set(false);
      },
      error: () => {
        this.togglingStatus.set(false);
      },
    });
  }

  confirmDeleteCarga(): void {
    this.confirmDelete.set(true);
  }

  cancelDeleteCarga(): void {
    this.confirmDelete.set(false);
  }

  deleteCarga(): void {
    const c = this.carga();
    if (!c) return;
    this.deleting.set(true);
    this.confirmDelete.set(false);

    this.api.delete(`loads/${c.id}`).subscribe({
      next: () => {
        this.router.navigate(['/transportadora/cargas']);
      },
      error: () => {
        this.deleting.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Rascunho', published: 'Publicada',
      in_progress: 'Em andamento', completed: 'Concluída', cancelled: 'Cancelada',
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

  canEdit(status: string): boolean {
    return status === 'draft' || status === 'published';
  }

  canToggleStatus(status: string): boolean {
    return status === 'draft' || status === 'published';
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
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
}
