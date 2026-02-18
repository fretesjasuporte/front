import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';

export interface Carga {
  id: number;
  origem: string;
  destino: string;
  tipoCarga: string;
  tipoVeiculo: string;
  valor: string;
  urgente: boolean;
  dataPublicacao: string;
}

@Component({
  selector: 'app-cargas-disponiveis',
  imports: [FormsModule, HlmButton, HlmBadge, HlmCard, HlmCardContent, HlmCardFooter, HlmCardHeader, HlmInput],
  templateUrl: './cargas-disponiveis.html',
})
export class CargasDisponiveisComponent {
  readonly filterOrigem = signal('');
  readonly filterDestino = signal('');
  readonly filterVeiculo = signal('');

  readonly tiposVeiculo = [
    'Todos',
    'Van / Sprinter',
    'Caminhão 3/4',
    'Caminhão Toco',
    'Caminhão Truck',
    'Caminhão Baú',
    'Caminhão Graneleiro',
    'Carreta',
  ];

  readonly cargas: Carga[] = [
    { id: 1, origem: 'São Paulo, SP', destino: 'Rio de Janeiro, RJ', tipoCarga: 'Eletrônicos', tipoVeiculo: 'Van / Sprinter', valor: 'R$ 1.200', urgente: true, dataPublicacao: 'Hoje' },
    { id: 2, origem: 'Curitiba, PR', destino: 'Florianópolis, SC', tipoCarga: 'Alimentos refrigerados', tipoVeiculo: 'Caminhão Toco', valor: 'R$ 2.800', urgente: false, dataPublicacao: 'Hoje' },
    { id: 3, origem: 'Belo Horizonte, MG', destino: 'Brasília, DF', tipoCarga: 'Móveis e decoração', tipoVeiculo: 'Caminhão Baú', valor: 'Sob consulta', urgente: false, dataPublicacao: 'Ontem' },
    { id: 4, origem: 'Salvador, BA', destino: 'Recife, PE', tipoCarga: 'Produtos industriais', tipoVeiculo: 'Carreta', valor: 'R$ 4.500', urgente: true, dataPublicacao: 'Hoje' },
    { id: 5, origem: 'Porto Alegre, RS', destino: 'São Paulo, SP', tipoCarga: 'Grãos (soja)', tipoVeiculo: 'Caminhão Graneleiro', valor: 'R$ 8.200', urgente: false, dataPublicacao: 'Ontem' },
    { id: 6, origem: 'Fortaleza, CE', destino: 'São Paulo, SP', tipoCarga: 'Têxteis e confecções', tipoVeiculo: 'Caminhão 3/4', valor: 'R$ 5.100', urgente: false, dataPublicacao: '3 dias' },
    { id: 7, origem: 'Goiânia, GO', destino: 'Belo Horizonte, MG', tipoCarga: 'Material de construção', tipoVeiculo: 'Caminhão Truck', valor: 'R$ 1.800', urgente: true, dataPublicacao: 'Hoje' },
    { id: 8, origem: 'Manaus, AM', destino: 'Belém, PA', tipoCarga: 'Eletrodomésticos', tipoVeiculo: 'Van / Sprinter', valor: 'Sob consulta', urgente: false, dataPublicacao: '2 dias' },
    { id: 9, origem: 'Campo Grande, MS', destino: 'São Paulo, SP', tipoCarga: 'Carne bovina', tipoVeiculo: 'Carreta', valor: 'R$ 6.700', urgente: true, dataPublicacao: 'Hoje' },
    { id: 10, origem: 'Natal, RN', destino: 'Fortaleza, CE', tipoCarga: 'Frutas e vegetais', tipoVeiculo: 'Caminhão 3/4', valor: 'R$ 980', urgente: false, dataPublicacao: 'Ontem' },
  ];

  readonly cargasFiltradas = computed(() => {
    const origem = this.filterOrigem().toLowerCase().trim();
    const destino = this.filterDestino().toLowerCase().trim();
    const veiculo = this.filterVeiculo();

    return this.cargas.filter((c) => {
      const matchOrigem = !origem || c.origem.toLowerCase().includes(origem);
      const matchDestino = !destino || c.destino.toLowerCase().includes(destino);
      const matchVeiculo = !veiculo || veiculo === 'Todos' || c.tipoVeiculo === veiculo;
      return matchOrigem && matchDestino && matchVeiculo;
    });
  });

  clearFilters() {
    this.filterOrigem.set('');
    this.filterDestino.set('');
    this.filterVeiculo.set('');
  }

  mostrarInteresse(carga: Carga) {
    const msg = encodeURIComponent(
      `Olá! Tenho interesse na carga:\n📍 ${carga.origem} → ${carga.destino}\n📦 ${carga.tipoCarga}\n🚛 ${carga.tipoVeiculo}\nCod.: #${carga.id}`,
    );
    window.open(`https://wa.me/5500000000000?text=${msg}`, '_blank');
  }
}
