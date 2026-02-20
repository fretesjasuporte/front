import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HlmButton, HlmInput],
  templateUrl: './esqueci-senha.html',
})
export class EsqueciSenhaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly success = signal(false);

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

    const { email } = this.form.value;

    this.auth.forgotPassword(email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Não revelamos se o e-mail existe ou não por segurança
        this.success.set(true);
      },
    });
  }
}
