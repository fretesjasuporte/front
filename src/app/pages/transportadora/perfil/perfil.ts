import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, CarrierProfile } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { MaskDirective } from '../../../core/directives/mask.directive';

@Component({
  selector: 'app-perfil-carrier',
  standalone: true,
  imports: [FormsModule, HlmButton, HlmInput, MaskDirective],
  templateUrl: './perfil.html',
})
export class PerfilCarrierComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly profile = signal<CarrierProfile | null>(null);
  readonly error = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly editMode = signal(false);

  editName = '';
  editPhone = '';
  editLegalName = '';
  editTradeName = '';
  editBusinessEmail = '';
  editStreet = '';
  editNumber = '';
  editComplement = '';
  editNeighborhood = '';
  editCity = '';
  editState = '';
  editZipCode = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<CarrierProfile>('carriers/me').subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar perfil.');
        this.loading.set(false);
      },
    });
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editName = p.profile.name;
    this.editPhone = p.profile.phone;
    this.editLegalName = p.legal_name;
    this.editTradeName = p.trade_name ?? '';
    this.editBusinessEmail = p.business_email ?? '';
    this.editStreet = p.address?.street ?? '';
    this.editNumber = p.address?.number ?? '';
    this.editComplement = p.address?.complement ?? '';
    this.editNeighborhood = p.address?.neighborhood ?? '';
    this.editCity = p.address?.city ?? '';
    this.editState = p.address?.state ?? '';
    this.editZipCode = p.address?.zip_code ?? '';
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  saveEdit(): void {
    this.saving.set(true);
    this.saveError.set(null);

    this.api
      .put<CarrierProfile>('carriers/me', {
        name: this.editName,
        phone: this.editPhone,
        legal_name: this.editLegalName,
        trade_name: this.editTradeName || undefined,
        business_email: this.editBusinessEmail || undefined,
        address: {
          street: this.editStreet || undefined,
          number: this.editNumber || undefined,
          complement: this.editComplement || undefined,
          neighborhood: this.editNeighborhood || undefined,
          city: this.editCity || undefined,
          state: this.editState || undefined,
          zip_code: this.editZipCode || undefined,
        },
      })
      .subscribe({
        next: (res) => {
          this.profile.set(res.data);
          this.saving.set(false);
          this.saveSuccess.set(true);
          this.editMode.set(false);
        },
        error: (err) => {
          const code = err?.error?.error?.code;
          this.saveError.set(
            code === 'VALIDATION_ERROR' ? 'CEP inválido.' : 'Erro ao salvar perfil.',
          );
          this.saving.set(false);
        },
      });
  }
}
