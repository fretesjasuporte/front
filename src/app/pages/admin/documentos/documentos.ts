import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TruckerProfile, TruckerDocument } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';


@Component({
  selector: 'app-admin-documentos',
  standalone: true,
  imports: [FormsModule, DatePipe, HlmButton, HlmBadge],
  templateUrl: './documentos.html',
})
export class AdminDocumentosComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly truckers = signal<TruckerProfile[]>([]);
  readonly total = signal(0);
  readonly error = signal<string | null>(null);

  readonly expandedId = signal<string | null>(null);
  readonly loadingDocs = signal(false);
  readonly truckerDocs = signal<TruckerDocument[]>([]);
  readonly docsError = signal<string | null>(null);

  readonly processingDocId = signal<string | null>(null);
  readonly docModal = signal<{
    docId: string;
    action: 'approved' | 'rejected';
  } | null>(null);
  rejectionReason = '';
  readonly docActionError = signal<string | null>(null);

  readonly docTypeLabels: Record<string, string> = {
    driver_license: 'CNH',
    vehicle_registration: 'CRLV',
    proof_of_address: 'Comprovante de residência',
    profile_photo: 'Foto de perfil',
    other: 'Outro',
  };

  ngOnInit(): void {
    this.loadTruckers();
  }

  loadTruckers(): void {
    this.loading.set(true);
    this.api.getPaginated<TruckerProfile>('admin/truckers/pending', { limit: 100 }).subscribe({
      next: (res) => {
        this.truckers.set(res.data);
        this.total.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar caminhoneiros.');
        this.loading.set(false);
      },
    });
  }

  toggleExpand(truckerId: string): void {
    if (this.expandedId() === truckerId) {
      this.expandedId.set(null);
      return;
    }

    this.expandedId.set(truckerId);
    this.loadingDocs.set(true);
    this.docsError.set(null);
    this.truckerDocs.set([]);

    this.api
      .getPaginated<TruckerDocument>(`admin/truckers/${truckerId}/documents`, { limit: 100 })
      .subscribe({
        next: (res) => {
          this.truckerDocs.set(res.data);
          this.loadingDocs.set(false);
        },
        error: () => {
          this.docsError.set(
            'Não foi possível carregar os documentos deste caminhoneiro.',
          );
          this.loadingDocs.set(false);
        },
      });
  }

  openDocModal(docId: string, action: 'approved' | 'rejected'): void {
    this.rejectionReason = '';
    this.docActionError.set(null);
    this.docModal.set({ docId, action });
  }

  confirmarDocAcao(): void {
    const modal = this.docModal();
    if (!modal) return;

    if (modal.action === 'rejected' && !this.rejectionReason.trim()) {
      this.docActionError.set('Informe o motivo da reprovação.');
      return;
    }

    this.processingDocId.set(modal.docId);
    const body: Record<string, string> = { status: modal.action };
    if (modal.action === 'rejected') body['rejection_reason'] = this.rejectionReason.trim();

    this.api.patch<TruckerDocument>(`admin/documents/${modal.docId}/status`, body).subscribe({
      next: (res) => {
        this.truckerDocs.update((docs) =>
          docs.map((d) => (d.id === modal.docId ? { ...d, status: res.data.status } : d)),
        );
        this.processingDocId.set(null);
        this.docModal.set(null);
      },
      error: () => {
        this.processingDocId.set(null);
        this.docModal.set(null);
      },
    });
  }

  docStatusClass(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      expired: 'outline',
    };
    return map[status] ?? 'outline';
  }

  docStatusLabel(status: string): string {
    const map: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Em análise',
      rejected: 'Reprovado',
      expired: 'Expirado',
    };
    return map[status] ?? status;
  }
}
