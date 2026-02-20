import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selector: 'app-nova-carga',
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './nova-carga.html',
})
export class NovaCargaComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly estados = ESTADOS;
  readonly truckTypes = signal<TruckType[]>([]);
  readonly bodyTypes = signal<BodyType[]>([]);
  readonly loadingCatalog = signal(true);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly createdLoadId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

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
    this.api.get<TruckType[]>('catalog/truck-types').subscribe({
      next: (res) => {
        this.truckTypes.set(res.data ?? []);
        this.loadingCatalog.set(false);
      },
      error: () => this.loadingCatalog.set(false),
    });
  }

  onTruckTypeChange(id: string | null): void {
    this.form.patchValue({ body_type_id: '' });
    this.bodyTypes.set([]);
    if (id) {
      this.api.get<BodyType[]>(`catalog/truck-types/${id}/body-types`).subscribe({
        next: (res) => this.bodyTypes.set(res.data ?? []),
        error: () => this.bodyTypes.set([]),
      });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(publishAfter: boolean): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

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
    if (v.notes) payload['notes'] = v.notes;

    this.api.post<Load>('loads', payload).subscribe({
      next: (res) => {
        const loadId = res.data.id;
        if (publishAfter) {
          this.api.put<Load>(`loads/${loadId}`, { status: 'published' }).subscribe({
            next: () => {
              this.loading.set(false);
              this.createdLoadId.set(loadId);
              this.submitted.set(true);
            },
            error: () => {
              this.loading.set(false);
              this.createdLoadId.set(loadId);
              this.submitted.set(true);
            },
          });
        } else {
          this.loading.set(false);
          this.createdLoadId.set(loadId);
          this.submitted.set(true);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const code = err?.error?.error?.code;
        if (code === 'COMBINACAO_INCOMPATIVEL') {
          this.errorMessage.set('A carroceria selecionada não é compatível com esse tipo de caminhão.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao criar a carga. Tente novamente.');
        }
      },
    });
  }
}
