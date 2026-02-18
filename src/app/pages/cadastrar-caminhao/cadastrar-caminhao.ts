import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-cadastrar-caminhao',
  imports: [ReactiveFormsModule, HlmButton, HlmInput],
  templateUrl: './cadastrar-caminhao.html',
})
export class CadastrarCaminhaoComponent {
  private readonly fb = inject(FormBuilder);

  readonly submitted = signal(false);
  readonly loading = signal(false);

  readonly tiposVeiculo = [
    'Moto / Motoboy',
    'Carro / Passeio',
    'Fiorino / Utilitário',
    'Van / Sprinter',
    'Caminhão 3/4',
    'Caminhão Toco (2 eixos)',
    'Caminhão Truck (3 eixos)',
    'Caminhão Baú',
    'Caminhão Graneleiro',
    'Carreta / Semirreboque',
    'Bitrem',
  ];

  readonly form = this.fb.group({
    nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i)]],
    tipoVeiculo: ['', Validators.required],
    cidadeBase: ['', Validators.required],
    rotas: ['', [Validators.required, Validators.minLength(5)]],
    aceitaOfertas: [false, Validators.requiredTrue],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
    }, 1200);
  }

  resetForm() {
    this.form.reset();
    this.submitted.set(false);
  }
}
