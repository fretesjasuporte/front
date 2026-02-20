import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TruckerDocument } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-documentos-trucker',
  standalone: true,
  imports: [FormsModule, DatePipe, HlmButton, HlmBadge, HlmInput],
  templateUrl: './documentos.html',
})
export class DocumentosTruckerComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly documents = signal<TruckerDocument[]>([]);
  readonly error = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly uploadSuccess = signal(false);
  readonly confirmDeleteId = signal<string | null>(null);

  uploadType = 'driver_license';
  uploadExpiry = '';
  uploadNotes = '';
  selectedFiles: File[] = [];

  readonly docTypeLabels: Record<string, string> = {
    driver_license: 'CNH',
    vehicle_registration: 'CRLV',
    proof_of_address: 'Comprovante de residência',
    profile_photo: 'Foto de perfil',
    other: 'Outro documento',
  };

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getPaginated<TruckerDocument>('truckers/me/documents', { limit: 100 }).subscribe({
      next: (res) => {
        this.documents.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar documentos.');
        this.loading.set(false);
      },
    });
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onUpload(): void {
    if (!this.selectedFiles.length) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(false);

    const formData = new FormData();
    formData.append('type', this.uploadType);
    if (this.uploadExpiry) formData.append('expiry_date', this.uploadExpiry);
    if (this.uploadNotes) formData.append('notes', this.uploadNotes);
    this.selectedFiles.forEach((f) => formData.append('documents', f));

    this.api.postFormData<TruckerDocument[]>('truckers/me/documents', formData).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.uploadSuccess.set(true);
        this.selectedFiles = [];
        this.uploadExpiry = '';
        this.uploadNotes = '';
        this.documents.update((docs) => [...(res.data ?? []), ...docs]);
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.error?.message || 'Erro ao enviar documento.');
      },
    });
  }

  confirmarDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  deleteDocument(): void {
    const id = this.confirmDeleteId();
    if (!id) return;

    this.deletingId.set(id);
    this.api.delete(`documents/${id}`).subscribe({
      next: () => {
        this.documents.update((docs) => docs.filter((d) => d.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
    });
  }

  statusClass(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      expired: 'outline',
    };
    return map[status] ?? 'outline';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Em análise',
      rejected: 'Reprovado',
      expired: 'Expirado',
    };
    return map[status] ?? status;
  }
}
