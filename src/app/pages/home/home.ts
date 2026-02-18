import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HlmButton, HlmCard, HlmCardContent],
  templateUrl: './home.html',
})
export class HomeComponent {
  readonly benefits = [
    {
      icon: 'payment',
      title: 'Pagamento rápido',
      description: 'Receba pelo seu trabalho em até 48 horas após confirmação da entrega.',
    },
    {
      icon: 'cargo',
      title: 'Cargas frequentes',
      description: 'Amplo volume de cargas disponíveis diariamente em todas as regiões do Brasil.',
    },
    {
      icon: 'contact',
      title: 'Contato direto',
      description: 'Comunicação direta entre motorista e embarcador, sem intermediários desnecessários.',
    },
    {
      icon: 'partner',
      title: 'Parcerias recorrentes',
      description: 'Construa relacionamentos de longo prazo com embarcadores e garanta renda estável.',
    },
  ];

  readonly steps = [
    {
      number: '01',
      title: 'Faça seu cadastro',
      description: 'Preencha seus dados, informações do veículo e as rotas que você aceita trabalhar.',
    },
    {
      number: '02',
      title: 'Visualize cargas',
      description: 'Acesse nossa lista de cargas disponíveis filtrada por origem, destino e tipo de veículo.',
    },
    {
      number: '03',
      title: 'Entre em contato',
      description: 'Demonstre interesse na carga e entre em contato diretamente com o embarcador.',
    },
  ];
}
