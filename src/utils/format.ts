export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value);
}

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatFecha(fecha: Date | string | number, formato = 'dd-MM-yyyy'): string {
  return format(new Date(fecha), formato, { locale: es })
}
