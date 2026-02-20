import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface TruckType { id: string; name: string; }
interface BodyType { id: string; name: string; }
interface ExistingTruck {
  id: string;
  license_plate: string;
  manufacture_year?: number;
  brand?: string;
  model?: string;
  capacity_kg?: number;
  renavam?: string;
  truck_type?: TruckType;
  body_type?: BodyType;
}

@Component({
  selector: 'app-cadastrar-caminhao',
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './cadastrar-caminhao.html',
})
export class CadastrarCaminhaoComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loadingCatalog = signal(true);
  readonly truckTypes = signal<TruckType[]>([]);
  readonly bodyTypes = signal<BodyType[]>([]);
  readonly existingTruck = signal<ExistingTruck | null>(null);
  readonly isUpdate = signal(false);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    license_plate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i)]],
    manufacture_year: [null as number | null],
    brand: [''],
    model: [''],
    capacity_kg: [null as number | null],
    renavam: [''],
    truck_type_id: [''],
    body_type_id: [''],
  });

  ngOnInit(): void {
    const role = this.auth.userRole();

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/cadastro/caminhoneiro']);
      return;
    }
    if (role === 'carrier') {
      this.router.navigate(['/transportadora/dashboard']);
      return;
    }
    if (role === 'admin' || role === 'operator') {
      this.router.navigate(['/admin/caminhoneiros']);
      return;
    }

    // É trucker — carrega catálogo e caminhão existente em paralelo
    forkJoin({
      types: this.api.get<TruckType[]>('catalog/truck-types'),
      truck: this.api.get<ExistingTruck | null>('truckers/me/truck'),
    }).subscribe({
      next: ({ types, truck }) => {
        this.truckTypes.set(types.data ?? []);

        if (truck.data) {
          this.existingTruck.set(truck.data);
          this.isUpdate.set(true);

          // Pré-preenche o formulário
          const t = truck.data;
          this.form.patchValue({
            license_plate: t.license_plate,
            manufacture_year: t.manufacture_year ?? null,
            brand: t.brand ?? '',
            model: t.model ?? '',
            capacity_kg: t.capacity_kg ?? null,
            renavam: t.renavam ?? '',
            truck_type_id: t.truck_type?.id ?? '',
            body_type_id: t.body_type?.id ?? '',
          });

          // Carrega carrocerias do tipo atual
          if (t.truck_type?.id) {
            this.loadBodyTypes(t.truck_type.id);
          }
        }

        this.loadingCatalog.set(false);
      },
      error: () => {
        // Se não tiver caminhão, a API retorna 404 ou null — tudo bem
        this.api.get<TruckType[]>('catalog/truck-types').subscribe({
          next: (res) => {
            this.truckTypes.set(res.data ?? []);
            this.loadingCatalog.set(false);
          },
          error: () => this.loadingCatalog.set(false),
        });
      },
    });
  }

  onTruckTypeChange(id: string | null): void {
    this.form.patchValue({ body_type_id: '' });
    this.bodyTypes.set([]);
    if (id) this.loadBodyTypes(id);
  }

  private loadBodyTypes(truckTypeId: string): void {
    this.api.get<BodyType[]>(`catalog/truck-types/${truckTypeId}/body-types`).subscribe({
      next: (res) => this.bodyTypes.set(res.data ?? []),
      error: () => this.bodyTypes.set([]),
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const raw = this.form.value;
    const payload: Record<string, string | number> = {
      license_plate: raw.license_plate!,
    };
    if (raw.manufacture_year) payload['manufacture_year'] = raw.manufacture_year;
    if (raw.brand) payload['brand'] = raw.brand;
    if (raw.model) payload['model'] = raw.model;
    if (raw.capacity_kg) payload['capacity_kg'] = raw.capacity_kg;
    if (raw.renavam) payload['renavam'] = raw.renavam;
    if (raw.truck_type_id) payload['truck_type_id'] = raw.truck_type_id;
    if (raw.body_type_id) payload['body_type_id'] = raw.body_type_id;

    this.api.put('truckers/me/truck', payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const code = err?.error?.error?.code;
        if (code === 'PLACA_JA_CADASTRADA') {
          this.errorMessage.set('Esta placa já está cadastrada em outro perfil.');
        } else if (code === 'COMBINACAO_INCOMPATIVEL') {
          this.errorMessage.set('A carroceria selecionada não é compatível com esse tipo de caminhão.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao salvar. Tente novamente.');
        }
      },
    });
  }
}
