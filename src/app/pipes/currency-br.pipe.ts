import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBr'
})
export class CurrencyBrPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    
    // Converter centavos para reais
    const reais = value / 100;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(reais);
  }
}
