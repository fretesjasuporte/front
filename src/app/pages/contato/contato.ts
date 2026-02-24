import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [ReactiveFormsModule, HlmButton, HlmInput],
  templateUrl: './contato.html',
})
export class ContatoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { title, email, subject } = this.form.value;

    this.api.post('support/contact', { title, email, subject }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.error?.message ?? err?.error?.message;
        this.errorMessage.set(msg || 'Erro ao enviar mensagem. Tente novamente.');
      },
    });
  }
}
