import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, TruckType, BodyType } from '../../../core/services/api.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-admin-catalogo',
  standalone: true,
  imports: [FormsModule, HlmButton, HlmBadge, HlmInput],
  templateUrl: './catalogo.html',
})
export class AdminCatalogoComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly truckTypes = signal<TruckType[]>([]);
  readonly bodyTypes = signal<BodyType[]>([]);
  readonly error = signal<string | null>(null);

  readonly activeTab = signal<'truck' | 'body'>('truck');

  newTruckName = '';
  newTruckDesc = '';
  newBodyName = '';
  newBodyDesc = '';
  readonly savingTruck = signal(false);
  readonly savingBody = signal(false);
  readonly truckError = signal<string | null>(null);
  readonly bodyError = signal<string | null>(null);

  readonly editModal = signal<{ type: 'truck' | 'body'; item: TruckType | BodyType } | null>(null);
  editName = '';
  editDesc = '';
  editActive = true;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly deleteModal = signal<{ type: 'truck' | 'body'; item: TruckType | BodyType } | null>(
    null,
  );
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      trucks: this.api.get<TruckType[]>('admin/truck-types'),
      bodies: this.api.get<BodyType[]>('admin/body-types'),
    }).subscribe({
      next: ({ trucks, bodies }) => {
        this.truckTypes.set(trucks.data);
        this.bodyTypes.set(bodies.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar catálogo.');
        this.loading.set(false);
      },
    });
  }

  addTruckType(): void {
    if (!this.newTruckName.trim()) return;
    this.savingTruck.set(true);
    this.truckError.set(null);

    this.api
      .post<TruckType>('admin/truck-types', {
        name: this.newTruckName.trim(),
        description: this.newTruckDesc.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.truckTypes.update((t) => [...t, res.data]);
          this.newTruckName = '';
          this.newTruckDesc = '';
          this.savingTruck.set(false);
        },
        error: (err) => {
          const code = err?.error?.error?.code;
          this.truckError.set(
            code === 'TIPO_CAMINHAO_JA_EXISTE'
              ? 'Já existe um tipo com este nome.'
              : 'Erro ao criar tipo de caminhão.',
          );
          this.savingTruck.set(false);
        },
      });
  }

  addBodyType(): void {
    if (!this.newBodyName.trim()) return;
    this.savingBody.set(true);
    this.bodyError.set(null);

    this.api
      .post<BodyType>('admin/body-types', {
        name: this.newBodyName.trim(),
        description: this.newBodyDesc.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.bodyTypes.update((b) => [...b, res.data]);
          this.newBodyName = '';
          this.newBodyDesc = '';
          this.savingBody.set(false);
        },
        error: () => {
          this.bodyError.set('Erro ao criar tipo de carroceria.');
          this.savingBody.set(false);
        },
      });
  }

  openEdit(type: 'truck' | 'body', item: TruckType | BodyType): void {
    this.editName = item.name;
    this.editDesc = item.description ?? '';
    this.editActive = item.active;
    this.saveError.set(null);
    this.editModal.set({ type, item });
  }

  saveEdit(): void {
    const modal = this.editModal();
    if (!modal) return;

    this.saving.set(true);
    this.saveError.set(null);

    const path =
      modal.type === 'truck'
        ? `admin/truck-types/${modal.item.id}`
        : `admin/body-types/${modal.item.id}`;
    const body = {
      name: this.editName.trim(),
      description: this.editDesc.trim() || undefined,
      active: this.editActive,
    };

    this.api.put<TruckType | BodyType>(path, body).subscribe({
      next: (res) => {
        if (modal.type === 'truck') {
          this.truckTypes.update((t) =>
            t.map((i) => (i.id === modal.item.id ? (res.data as TruckType) : i)),
          );
        } else {
          this.bodyTypes.update((b) =>
            b.map((i) => (i.id === modal.item.id ? (res.data as BodyType) : i)),
          );
        }
        this.saving.set(false);
        this.editModal.set(null);
      },
      error: (err) => {
        this.saveError.set(err?.error?.error?.message || 'Erro ao salvar alterações.');
        this.saving.set(false);
      },
    });
  }

  openDelete(type: 'truck' | 'body', item: TruckType | BodyType): void {
    this.deleteError.set(null);
    this.deleteModal.set({ type, item });
  }

  confirmDelete(): void {
    const modal = this.deleteModal();
    if (!modal) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    const path =
      modal.type === 'truck'
        ? `admin/truck-types/${modal.item.id}`
        : `admin/body-types/${modal.item.id}`;

    this.api.delete(path).subscribe({
      next: () => {
        if (modal.type === 'truck') {
          this.truckTypes.update((t) => t.filter((i) => i.id !== modal.item.id));
        } else {
          this.bodyTypes.update((b) => b.filter((i) => i.id !== modal.item.id));
        }
        this.deleting.set(false);
        this.deleteModal.set(null);
      },
      error: (err) => {
        const code = err?.error?.error?.code;
        this.deleteError.set(
          code === 'TIPO_EM_USO'
            ? 'Este tipo está em uso e não pode ser removido.'
            : 'Erro ao remover.',
        );
        this.deleting.set(false);
      },
    });
  }
}
