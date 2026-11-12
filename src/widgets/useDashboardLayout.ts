import { useEffect, useState } from 'react';
import {
  LAYOUT_POR_DEFECTO,
  ORDEN_WIDGETS,
  TAMANOS,
  WIDGETS,
  esSpan,
  esTipoWidget,
} from './tipos.js';
import type { SpanWidget, TipoWidget, WidgetLayoutItem } from './tipos.js';

const CLAVE = (usuarioId?: number | null) =>
  `mangos.dashboard.${usuarioId ?? 'anon'}`;

function normalizar(valor: unknown): WidgetLayoutItem[] | null {
  if (!Array.isArray(valor)) return null;

  const vistos = new Set<TipoWidget>();
  const items: WidgetLayoutItem[] = [];

  for (const crudo of valor) {
    if (!crudo || typeof crudo !== 'object') return null;
    const { tipo, span } = crudo as { tipo?: unknown; span?: unknown };
    if (!esTipoWidget(tipo) || !esSpan(span) || vistos.has(tipo)) return null;
    vistos.add(tipo);
    items.push({ tipo, span });
  }

  return items;
}

function cargar(usuarioId?: number | null): WidgetLayoutItem[] {
  try {
    const crudo = localStorage.getItem(CLAVE(usuarioId));
    if (!crudo) return LAYOUT_POR_DEFECTO;
    return normalizar(JSON.parse(crudo)) ?? LAYOUT_POR_DEFECTO;
  } catch {
    return LAYOUT_POR_DEFECTO;
  }
}

/**
 * Layout del tablero: orden, tamaño y widgets visibles.
 * Se persiste en localStorage por usuario.
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
    setItems((previo) => {
      if (
        desde === hasta ||
        desde < 0 ||
        hasta < 0 ||
        desde >= previo.length ||
        hasta >= previo.length
      ) {
        return previo;
      }

      const copia = [...previo];
      const [item] = copia.splice(desde, 1);
      copia.splice(hasta, 0, item!);
      return copia;
    });
  };

  const moverIzquierda = (indice: number) => mover(indice, indice - 1);
  const moverDerecha = (indice: number) => mover(indice, indice + 1);

  const redimensionar = (indice: number) => {
    setItems((previo) =>
      previo.map((item, posicion) => {
        if (posicion !== indice) return item;
        const actual = TAMANOS.indexOf(item.span);
        const siguiente = TAMANOS[(actual + 1) % TAMANOS.length] as SpanWidget;
        return { ...item, span: siguiente };
      }),
    );
  };

  const quitar = (tipo: TipoWidget) => {
    setItems((previo) => previo.filter((item) => item.tipo !== tipo));
  };

  const agregar = (tipo: TipoWidget) => {
    setItems((previo) =>
      previo.some((item) => item.tipo === tipo)
        ? previo
        : [...previo, { tipo, span: WIDGETS[tipo].spanPorDefecto }],
    );
  };

  const resetear = () => setItems(LAYOUT_POR_DEFECTO.map((item) => ({ ...item })));

  const tiposVisibles = new Set(items.map((item) => item.tipo));
  const disponibles = ORDEN_WIDGETS.filter((tipo) => !tiposVisibles.has(tipo));

  return {
    items,
    disponibles,
    mover,
    moverIzquierda,
    moverDerecha,
    redimensionar,
    quitar,
    agregar,
    resetear,
  };
}
