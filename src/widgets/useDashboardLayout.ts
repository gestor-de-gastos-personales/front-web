import { useCallback, useEffect, useState } from 'react';
import {
  COLUMNAS,
  H_MAX,
  H_MIN,
  LAYOUT_POR_DEFECTO,
  WIDGETS,
  W_MAX,
  W_MIN,
  esEntero,
  esTipoWidget,
  nuevoId,
} from './tipos.js';
import type { NodoGrilla, TipoWidget, WidgetLayoutItem } from './tipos.js';

const CLAVE = (usuarioId?: number | null) =>
  `mangos.dashboard.${usuarioId ?? 'anon'}`;

const copiaPorDefecto = () => LAYOUT_POR_DEFECTO.map((item) => ({ ...item }));

/**
 * Acomoda los widgets en filas de 12 columnas conservando su orden.
 * Es la base de la migración del formato anterior (que solo tenía `span`)
 * y del reordenamiento con los botones ←/→.
 */
export function empaquetar(items: WidgetLayoutItem[]): WidgetLayoutItem[] {
  let x = 0;
  let y = 0;
  let altoFila = 0;

  return items.map((item) => {
    const w = Math.max(1, Math.min(COLUMNAS, item.w));

    if (x > 0 && x + w > COLUMNAS) {
      x = 0;
      y += altoFila;
      altoFila = 0;
    }

    const colocado: WidgetLayoutItem = { ...item, x, y, w };
    x += w;
    altoFila = Math.max(altoFila, item.h);

    if (x >= COLUMNAS) {
      x = 0;
      y += altoFila;
      altoFila = 0;
    }

    return colocado;
  });
}

/** Primer hueco libre de `w`×`h` celdas, reutilizando espacios entre widgets. */
export function buscarHueco(
  items: WidgetLayoutItem[],
  w: number,
  h: number,
): { x: number; y: number } {
  const ocupado = new Set<string>();

  for (const item of items) {
    for (let dx = 0; dx < item.w; dx += 1) {
      for (let dy = 0; dy < item.h; dy += 1) {
        ocupado.add(`${item.x + dx},${item.y + dy}`);
      }
    }
  }

  const maxY = items.reduce(
    (maximo, item) => Math.max(maximo, item.y + item.h),
    0,
  );

  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= COLUMNAS - w; x += 1) {
      let libre = true;

      for (let dx = 0; dx < w && libre; dx += 1) {
        for (let dy = 0; dy < h; dy += 1) {
          if (ocupado.has(`${x + dx},${y + dy}`)) {
            libre = false;
            break;
          }
        }
      }

      if (libre) return { x, y };
    }
  }

  return { x: 0, y: maxY };
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

/**
 * Acepta el formato nuevo (`x,y,w,h`) y migra el anterior (`span`).
 * Si falta la posición de algún widget, se recalcula el tablero completo.
 */
function normalizar(valor: unknown): WidgetLayoutItem[] | null {
  if (!Array.isArray(valor)) return null;

  const ids = new Set<string>();
  const items: WidgetLayoutItem[] = [];
  let faltanPosiciones = false;

  for (const crudo of valor) {
    if (!crudo || typeof crudo !== 'object') return null;

    const { id, tipo, span, x, y, w, h } = crudo as {
      id?: unknown;
      tipo?: unknown;
      span?: unknown;
      x?: unknown;
      y?: unknown;
      w?: unknown;
      h?: unknown;
    };

    if (!esTipoWidget(tipo)) return null;

    const ancho = w ?? span;
    if (!esEntero(ancho, W_MIN, W_MAX)) return null;

    const alto = h ?? WIDGETS[tipo].hPorDefecto;
    if (!esEntero(alto, H_MIN, H_MAX)) return null;

    const xValida = esEntero(x, 0, COLUMNAS - 1);
    const yValida = esEntero(y, 0, 10_000);
    if (!xValida || !yValida) faltanPosiciones = true;

    // Migración del formato anterior (sin id) y protección ante ids repetidos.
    const idFinal =
      typeof id === 'string' && id && !ids.has(id) ? id : nuevoId(tipo);
    ids.add(idFinal);

    items.push({
      id: idFinal,
      tipo,
      x: xValida ? x : 0,
      y: yValida ? y : 0,
      w: ancho,
      h: alto,
    });
  }

  return faltanPosiciones ? empaquetar(items) : items;
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
 * Layout del tablero: posición y tamaño de cada instancia.
 * Se persiste en localStorage por usuario y se sincroniza con GridStack.
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

  /** Aplica la geometría que devuelve GridStack tras mover, redimensionar o quitar. */
  const actualizarDesdeGrilla = useCallback((nodos: NodoGrilla[]) => {
    if (nodos.length === 0) return;

    const porId = new Map(nodos.map((nodo) => [nodo.id, nodo]));

    setItems((previo) => {
      let cambio = false;

      const siguiente = previo.map((item) => {
        const nodo = porId.get(item.id);
        if (!nodo) return item;
        if (
          item.x === nodo.x &&
          item.y === nodo.y &&
          item.w === nodo.w &&
          item.h === nodo.h
        ) {
          return item;
        }

        cambio = true;
        return {
          ...item,
          x: nodo.x,
          y: nodo.y,
          w: nodo.w,
          h: nodo.h,
        };
      });

      if (!cambio) return previo;

      // El orden del arreglo acompaña la lectura visual (arriba→abajo, izq→der).
      return [...siguiente].sort((a, b) => a.y - b.y || a.x - b.x);
    });
  }, []);

  const mover = useCallback((desde: number, hasta: number) => {
    setItems((previo) => empaquetar(reordenar(previo, desde, hasta)));
  }, []);

  const moverIzquierda = useCallback(
    (indice: number) => mover(indice, indice - 1),
    [mover],
  );

  const moverDerecha = useCallback(
    (indice: number) => mover(indice, indice + 1),
    [mover],
  );

  const quitar = useCallback((id: string) => {
    setItems((previo) => previo.filter((item) => item.id !== id));
  }, []);

  /** Agrega una instancia nueva en el primer hueco libre; el tipo puede repetirse. */
  const agregar = useCallback((tipo: TipoWidget) => {
    setItems((previo) => {
      const meta = WIDGETS[tipo];
      const hueco = buscarHueco(previo, meta.wPorDefecto, meta.hPorDefecto);

      return [
        ...previo,
        {
          id: nuevoId(tipo),
          tipo,
          x: hueco.x,
          y: hueco.y,
          w: meta.wPorDefecto,
          h: meta.hPorDefecto,
        },
      ];
    });
  }, []);

  const resetear = useCallback(() => setItems(copiaPorDefecto()), []);

  return {
    items,
    actualizarDesdeGrilla,
    mover,
    moverIzquierda,
    moverDerecha,
    quitar,
    agregar,
    resetear,
  };
}
