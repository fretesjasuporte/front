import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/services/auth.service';

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
  selector: 'app-nova-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './nova-senha.html',
})
export class NovaSenhaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private token = '';

  readonly form = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly success = signal(false);
  readonly invalidToken = signal(false);

  ngOnInit(): void {
    // Token vem como query param: /auth/nova-senha?token=xxx
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.invalidToken.set(true);
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  passwordStrengthLabel(): string {
    const pw = this.form.get('new_password')?.value ?? '';
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

    const { new_password } = this.form.value;

    this.auth.resetPassword(this.token, new_password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const code = err?.error?.error?.code;
        if (code === 'TOKEN_INVALIDO' || code === 'TOKEN_EXPIRADO') {
          this.errorMessage.set('Link inválido ou expirado. Solicite um novo link de recuperação.');
        } else {
          this.errorMessage.set('Ocorreu um erro. Tente novamente.');
        }
      },
    });
  }
}
