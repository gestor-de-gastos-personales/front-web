import type { Categoria, Gasto } from '../services/gastos.service.js';
import { categoriaSugerida, fechaHoyISO } from './chatPeriodo.js';
import type { Frecuencia, MensajeChat } from './tipos.js';

export type Borrador = Extract<MensajeChat, { tipo: 'borrador' }>;

export function normalizarFrecuencia(valor?: string | null): Frecuencia {
  const texto = (valor ?? '').toLowerCase();
  if (texto.includes('diar')) return 'DIARIA';
  if (texto.includes('semanal')) return 'SEMANAL';
  if (texto.includes('anual')) return 'ANUAL';
  return 'MENSUAL';
}

export function gastoInicial(mensaje: Borrador, categorias: Categoria[]): Gasto {
  if (mensaje.gasto) return mensaje.gasto;

  const sugerida = mensaje.categoriaId
    ? categorias.find((categoria) => categoria.id === mensaje.categoriaId)
    : categoriaSugerida(mensaje.analisis, categorias);

  return {
    id: 0,
    descripcion:
      mensaje.analisis.descripcion ?? mensaje.analisis.comercio ?? '',
    monto: mensaje.analisis.monto ?? '',
    fecha: mensaje.analisis.fecha ?? fechaHoyISO(),
    categoriaId: sugerida?.id ?? 0,
    categoria: sugerida ?? null,
  };
}
