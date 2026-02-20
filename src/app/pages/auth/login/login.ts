import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.redirectAfterLogin();
      },
      error: (err) => {
        this.loading.set(false);
        const code = err?.error?.error?.code;
        if (code === 'CREDENCIAIS_INVALIDAS') {
          this.errorMessage.set('E-mail ou senha incorretos.');
        } else if (code === 'EMAIL_NAO_CONFIRMADO') {
          this.errorMessage.set('Confirme seu e-mail antes de entrar.');
        } else if (code === 'CONTA_INATIVA') {
          this.errorMessage.set('Sua conta está desativada. Entre em contato com o suporte.');
        } else {
          this.errorMessage.set('Ocorreu um erro. Tente novamente.');
        }
      },
    });
  }
}
