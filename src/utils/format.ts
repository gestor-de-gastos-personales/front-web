const nfMonto = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Monto en pesos argentinos, sin decimales. */
export function formatearMonto(valor: number | string | null | undefined): string {
  const numero = Number(valor ?? 0);
  if (!Number.isFinite(numero)) return nfMonto.format(0);
  return nfMonto.format(numero);
}

const nfFecha = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Fecha ISO a DD/MM/AAAA. */
export function formatearFecha(iso?: string | null): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return nfFecha.format(fecha);
}

/** Porcentaje con un decimal. */
export function formatearPorcentaje(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

/** Mensaje legible para cualquier error. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la operación';
}
