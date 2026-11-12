import { useEffect, useState } from 'react';
import {
  LAYOUT_POR_DEFECTO,
  WIDGETS,
  esSpan,
  esTipoWidget,
  nuevoId,
} from './tipos.js';
import type { SpanWidget, TipoWidget, WidgetLayoutItem } from './tipos.js';

const CLAVE = (usuarioId?: number | null) =>
  `mangos.dashboard.${usuarioId ?? 'anon'}`;

const copiaPorDefecto = () => LAYOUT_POR_DEFECTO.map((item) => ({ ...item }));

/**
 * Empaqueta las filas: recorre los widgets en orden y, cuando uno no entra
 * completo en lo que queda de la fila, lo ajusta exactamente al hueco
 * (si el hueco alcanza el mínimo). Si entra, conserva su tamaño.
 *
 * Ejemplo: [4, 4, 8] -> [4, 4, 4]; [4, 8] -> [4, 8].
 */
export function compactarFilas(
  items: WidgetLayoutItem[],
  minimo = 3,
): WidgetLayoutItem[] {
  let usado = 0;

  return items.map((item) => {
    if (usado + item.span <= 12) {
      usado = (usado + item.span) % 12;
      return item;
    }

    const hueco = 12 - usado;

    if (hueco >= minimo) {
      usado = 0;
      return { ...item, span: hueco };
    }

    usado = item.span % 12;
    return item;
  });
}

function reordenar(
  items: WidgetLayoutItem[],
  desde: number,
  hasta: number,
): WidgetLayoutItem[] {
  if (
    desde === hasta ||
    desde < 0 ||
    hasta < 0 ||
    desde >= items.length ||
    hasta >= items.length
  ) {
    return items;
  }

  const copia = [...items];
  const [item] = copia.splice(desde, 1);
  copia.splice(hasta, 0, item!);
  return copia;
}

function normalizar(valor: unknown): WidgetLayoutItem[] | null {
  if (!Array.isArray(valor)) return null;

  const ids = new Set<string>();
  const items: WidgetLayoutItem[] = [];

  for (const crudo of valor) {
    if (!crudo || typeof crudo !== 'object') return null;
    const { id, tipo, span } = crudo as {
      id?: unknown;
      tipo?: unknown;
      span?: unknown;
    };
    if (!esTipoWidget(tipo) || !esSpan(span)) return null;

    // Migración del formato anterior (sin id) y protección ante ids repetidos.
    const idFinal =
      typeof id === 'string' && id && !ids.has(id) ? id : nuevoId(tipo);
    ids.add(idFinal);
    items.push({ id: idFinal, tipo, span });
  }

  return items;
}

function cargar(usuarioId?: number | null): WidgetLayoutItem[] {
  try {
    const crudo = localStorage.getItem(CLAVE(usuarioId));
    if (!crudo) return copiaPorDefecto();
    return normalizar(JSON.parse(crudo)) ?? copiaPorDefecto();
  } catch {
    return copiaPorDefecto();
  }
}

/**
 * Layout del tablero: instancias, orden y tamaño de cada widget.
 * Se persiste en localStorage por usuario. Un tipo puede repetirse.
 */
export function useDashboardLayout(usuarioId?: number | null) {
  const [items, setItems] = useState<WidgetLayoutItem[]>(() => cargar(usuarioId));

  // Al resolverse el usuario (login), se carga su layout.
  useEffect(() => {
    setItems(cargar(usuarioId));
  }, [usuarioId]);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE(usuarioId), JSON.stringify(items));
    } catch {
      // Sin storage disponible: el layout vive solo en memoria.
    }
  }, [items, usuarioId]);

  const mover = (desde: number, hasta: number) => {
    setItems((previo) => compactarFilas(reordenar(previo, desde, hasta)));
  };

  /** Reordena por id (lo usa el sortable durante el arrastre). */
  const moverPorId = (activo: string, destino: string) => {
    setItems((previo) =>
      compactarFilas(
        reordenar(
          previo,
          previo.findIndex((item) => item.id === activo),
          previo.findIndex((item) => item.id === destino),
        ),
      ),
    );
  };

  const moverIzquierda = (indice: number) => mover(indice, indice - 1);
  const moverDerecha = (indice: number) => mover(indice, indice + 1);

  /** Cambia el ancho a un valor concreto (handle de la esquina). */
  const cambiarSpan = (indice: number, span: SpanWidget) => {
    setItems((previo) =>
      previo.map((item, posicion) =>
        posicion === indice ? { ...item, span } : item,
      ),
    );
  };

  const quitar = (id: string) => {
    setItems((previo) =>
      compactarFilas(previo.filter((item) => item.id !== id)),
    );
  };

  /** Agrega una instancia nueva; se puede repetir el mismo tipo. */
  const agregar = (tipo: TipoWidget) => {
    setItems((previo) =>
      compactarFilas([
        ...previo,
        { id: nuevoId(tipo), tipo, span: WIDGETS[tipo].spanPorDefecto },
      ]),
    );
  };

  const resetear = () => setItems(copiaPorDefecto());

  return {
    items,
    mover,
    moverPorId,
    moverIzquierda,
    moverDerecha,
    cambiarSpan,
    quitar,
    agregar,
    resetear,
  };
}
