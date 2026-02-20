import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, TruckerProfile, TruckData, TruckType, BodyType } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { MaskDirective } from '../../../core/directives/mask.directive';

@Component({
  selector: 'app-perfil-trucker',
  standalone: true,
  imports: [FormsModule, DecimalPipe, HlmButton, HlmInput, HlmBadge, MaskDirective],
  templateUrl: './perfil.html',
})
export class PerfilTruckerComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly profile = signal<TruckerProfile | null>(null);
  readonly truck = signal<TruckData | null>(null);
  readonly truckTypes = signal<TruckType[]>([]);
  readonly error = signal<string | null>(null);

  // Personal edit
  readonly editPersonal = signal(false);
  readonly savingPersonal = signal(false);
  readonly savePersonalError = signal<string | null>(null);
  readonly savePersonalSuccess = signal(false);

  editName = '';
  editPhone = '';
  editBirthDate = '';
  editLicenseNumber = '';
  editLicenseCategory = '';
  editLicenseExpiry = '';

  // Truck edit
  readonly editTruck = signal(false);
  readonly savingTruck = signal(false);
  readonly saveTruckError = signal<string | null>(null);
  readonly saveTruckSuccess = signal(false);
  readonly bodyTypes = signal<BodyType[]>([]);

  editPlate = '';
  editYear = '';
  editBrand = '';
  editModel = '';
  editCapacity = '';
  editRenavam = '';
  editTruckTypeId = '';
  editBodyTypeId = '';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      profile: this.api.get<TruckerProfile>('truckers/me'),
      truck: this.api.get<TruckData | null>('truckers/me/truck'),
      types: this.api.get<TruckType[]>('catalog/truck-types'),
    }).subscribe({
      next: ({ profile, truck, types }) => {
        this.profile.set(profile.data);
        this.truck.set(truck.data);
        this.truckTypes.set(types.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar perfil.');
        this.loading.set(false);
      },
    });
  }

  startEditPersonal(): void {
    const p = this.profile();
    if (!p) return;
    this.editName = p.profile.name;
    this.editPhone = p.profile.phone;
    this.editBirthDate = p.birth_date ?? '';
    this.editLicenseNumber = p.driver_license_number;
    this.editLicenseCategory = p.driver_license_category;
    this.editLicenseExpiry = p.driver_license_expiry;
    this.savePersonalError.set(null);
    this.savePersonalSuccess.set(false);
    this.editPersonal.set(true);
  }

  cancelEditPersonal(): void {
    this.editPersonal.set(false);
  }

  savePersonal(): void {
    this.savingPersonal.set(true);
    this.savePersonalError.set(null);

    this.api
      .put<TruckerProfile>('truckers/me', {
        name: this.editName,
        phone: this.editPhone,
        birth_date: this.editBirthDate || undefined,
        driver_license_number: this.editLicenseNumber,
        driver_license_category: this.editLicenseCategory,
        driver_license_expiry: this.editLicenseExpiry,
      })
      .subscribe({
        next: (res) => {
          this.profile.set(res.data);
          this.savingPersonal.set(false);
          this.savePersonalSuccess.set(true);
          this.editPersonal.set(false);
        },
        error: () => {
          this.savePersonalError.set('Erro ao salvar dados pessoais.');
          this.savingPersonal.set(false);
        },
      });
  }

  startEditTruck(): void {
    const t = this.truck();
    this.editPlate = t?.license_plate ?? '';
    this.editYear = t?.manufacture_year ? String(t.manufacture_year) : '';
    this.editBrand = t?.brand ?? '';
    this.editModel = t?.model ?? '';
    this.editCapacity = t?.capacity_kg ? String(t.capacity_kg) : '';
    this.editRenavam = t?.renavam ?? '';
    this.editTruckTypeId = t?.truck_type?.id ?? '';
    this.editBodyTypeId = t?.body_type?.id ?? '';
    if (this.editTruckTypeId) {
      this.loadBodyTypes(this.editTruckTypeId);
    }
    this.saveTruckError.set(null);
    this.saveTruckSuccess.set(false);
    this.editTruck.set(true);
  }

  cancelEditTruck(): void {
    this.editTruck.set(false);
  }

  onTruckTypeChange(): void {
    this.editBodyTypeId = '';
    this.bodyTypes.set([]);
    if (this.editTruckTypeId) {
      this.loadBodyTypes(this.editTruckTypeId);
    }
  }

  private loadBodyTypes(truckTypeId: string): void {
    this.api.get<BodyType[]>(`catalog/truck-types/${truckTypeId}/body-types`).subscribe({
      next: (res) => this.bodyTypes.set(res.data),
    });
  }

  saveTruck(): void {
    if (!this.editPlate.trim()) return;
    this.savingTruck.set(true);
    this.saveTruckError.set(null);

    const body: Record<string, unknown> = {
      license_plate: this.editPlate.trim().toUpperCase(),
    };
    if (this.editYear) body['manufacture_year'] = Number(this.editYear);
    if (this.editBrand) body['brand'] = this.editBrand;
    if (this.editModel) body['model'] = this.editModel;
    if (this.editCapacity) body['capacity_kg'] = Number(this.editCapacity);
    if (this.editRenavam) body['renavam'] = this.editRenavam;
    if (this.editTruckTypeId) body['truck_type_id'] = this.editTruckTypeId;
    if (this.editBodyTypeId) body['body_type_id'] = this.editBodyTypeId;

    this.api.put<TruckData>('truckers/me/truck', body).subscribe({
      next: (res) => {
        this.truck.set(res.data);
        this.savingTruck.set(false);
        this.saveTruckSuccess.set(true);
        this.editTruck.set(false);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        const msgs: Record<string, string> = {
          PLACA_JA_CADASTRADA: 'Esta placa já está cadastrada por outro motorista.',
          COMBINACAO_INCOMPATIVEL: 'Tipo de caminhão e carroceria incompatíveis.',
          VALIDATION_ERROR: 'Placa em formato inválido.',
        };
        this.saveTruckError.set(msgs[code] ?? 'Erro ao salvar dados do caminhão.');
        this.savingTruck.set(false);
      },
    });
  }

  approvalClass(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };
    return map[status] ?? 'outline';
  }

  approvalLabel(status: string): string {
    const map: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Aguardando aprovação',
      rejected: 'Reprovado',
    };
    return map[status] ?? status;
  }
}
