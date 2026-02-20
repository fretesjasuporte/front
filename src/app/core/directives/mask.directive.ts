import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMask]',
  standalone: true,
})
export class MaskDirective {
  @Input('appMask') maskType: 'phone' | 'cpf' | 'cnpj' = 'phone';

  private formatting = false;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    if (this.formatting) return;
    this.formatting = true;

    const input = this.el.nativeElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = this.applyMask(raw);

    if (input.value !== formatted) {
      input.value = formatted;
      // Notify Angular forms/ngModel about the new value
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.formatting = false;
  }

  private applyMask(raw: string): string {
    switch (this.maskType) {
      case 'phone': return this.maskPhone(raw);
      case 'cpf':   return this.maskCpf(raw);
      case 'cnpj':  return this.maskCnpj(raw);
      default:      return raw;
    }
  }

  /** (XX) XXXXX-XXXX para celular, (XX) XXXX-XXXX para fixo */
  private maskPhone(raw: string): string {
    raw = raw.slice(0, 11);
    if (raw.length === 0) return '';
    if (raw.length <= 2) return `(${raw}`;
    if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  }

  /** XXX.XXX.XXX-XX */
  private maskCpf(raw: string): string {
    raw = raw.slice(0, 11);
    if (raw.length === 0) return '';
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
  }

  /** XX.XXX.XXX/XXXX-XX */
  private maskCnpj(raw: string): string {
    raw = raw.slice(0, 14);
    if (raw.length === 0) return '';
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
  }
}
