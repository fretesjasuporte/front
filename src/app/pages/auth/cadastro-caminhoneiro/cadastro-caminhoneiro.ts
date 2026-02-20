import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/services/auth.service';
import { MaskDirective } from '../../../core/directives/mask.directive';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const strong = hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
  return strong ? null : { weakPassword: true };
}

@Component({
  selector: 'app-cadastro-caminhoneiro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput, MaskDirective],
  templateUrl: './cadastro-caminhoneiro.html',
})
export class CadastroCaminhoneiroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
    phone: ['', Validators.required],
    cpf: ['', Validators.required],
    birth_date: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly success = signal(false);

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  passwordStrengthLabel(): string {
    const pw = this.form.get('password')?.value ?? '';
    if (pw.length === 0) return '';
    const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const score = checks.filter(r => r.test(pw)).length + (pw.length >= 8 ? 1 : 0);
    if (score <= 2) return 'Fraca';
    if (score <= 3) return 'Média';
    return 'Forte';
  }

  passwordStrengthColor(): string {
    const label = this.passwordStrengthLabel();
    if (label === 'Fraca') return 'bg-red-500';
    if (label === 'Média') return 'bg-amber-500';
    return 'bg-green-500';
  }

  passwordStrengthWidth(): string {
    const label = this.passwordStrengthLabel();
    if (label === 'Fraca') return 'w-1/3';
    if (label === 'Média') return 'w-2/3';
    return 'w-full';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { name, email, password, phone, cpf, birth_date } = this.form.value;

    this.auth.registerTrucker({ name: name!, email: email!, password: password!, phone: phone!, cpf: cpf!, birth_date: birth_date! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.redirectAfterLogin();
      },
      error: (err) => {
        console.log("error: ", err)
        this.loading.set(false);
        const code = err?.error?.error?.code ?? err?.error?.code;
        const msg = err?.error?.error?.message ?? err?.error?.message;
        if (code === 'EMAIL_JA_CADASTRADO') {
          this.errorMessage.set('Este e-mail já está cadastrado. Faça login ou recupere sua senha.');
        } else if (code === 'CPF_JA_CADASTRADO') {
          this.errorMessage.set('Este CPF já está cadastrado.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao criar sua conta.' + (msg ? ' ' + msg : ' Tente novamente.'));
        }
      },
    });
  }
}
