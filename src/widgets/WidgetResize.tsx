import { useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { TAMANOS } from './tipos.js';
import type { SpanWidget } from './tipos.js';

interface WidgetResizeProps {
  span: SpanWidget;
  onCambiar: (span: SpanWidget) => void;
}

const GAP = 16;

/** Ajusta el ancho al valor permitido más cercano (4/6/8/12). */
function snap(valor: number): SpanWidget {
  return TAMANOS.reduce(
    (mejor, actual) =>
      Math.abs(actual - valor) < Math.abs(mejor - valor) ? actual : mejor,
    TAMANOS[0] as SpanWidget,
  );
}

/**
 * Handle de la esquina inferior derecha para redimensionar arrastrando.
 * También acepta flechas del teclado. Detiene la propagación para que
 * dnd-kit no inicie un arrastre de la tarjeta.
 */
export function WidgetResize({ span, onCambiar }: WidgetResizeProps) {
  const [inicio, setInicio] = useState<{ x: number; span: SpanWidget } | null>(
    null,
  );

  const bajar = (evento: PointerEvent<HTMLButtonElement>) => {
    evento.stopPropagation();
    evento.preventDefault();
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setInicio({ x: evento.clientX, span });
  };

  const mover = (evento: PointerEvent<HTMLButtonElement>) => {
    if (!inicio) return;

    const slot = evento.currentTarget.closest('.widget-slot');
    const grid = slot?.closest('.grid');
    if (!grid) return;

    const anchoGrid = grid.getBoundingClientRect().width;
    if (anchoGrid <= 0) return;

    const anchoColumna = (anchoGrid - GAP * 11) / 12;
    const paso = anchoColumna + GAP;
    if (paso <= 0) return;

    const columnas = Math.round((evento.clientX - inicio.x) / paso);
    const objetivo = Math.max(4, Math.min(12, inicio.span + columnas));
    const nuevo = snap(objetivo);
    if (nuevo !== span) onCambiar(nuevo);
  };

  const subir = (evento: PointerEvent<HTMLButtonElement>) => {
    setInicio(null);
    try {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    } catch {
      // El puntero ya se liberó.
    }
  };

  const tecla = (evento: KeyboardEvent<HTMLButtonElement>) => {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();

    const indice = TAMANOS.indexOf(span);
    const destino = Math.max(
      0,
      Math.min(TAMANOS.length - 1, indice + (evento.key === 'ArrowRight' ? 1 : -1)),
    );
    const siguiente = TAMANOS[destino];
    if (siguiente && siguiente !== span) onCambiar(siguiente);
  };

  return (
    <button
      type="button"
      className="widget-resize"
      aria-label={`Redimensionar widget (ancho ${span} de 12)`}
      title="Arrastrá para redimensionar"
      onPointerDown={bajar}
      onPointerMove={mover}
      onPointerUp={subir}
      onPointerCancel={subir}
      onMouseDown={(evento) => evento.stopPropagation()}
      onTouchStart={(evento) => evento.stopPropagation()}
      onKeyDown={tecla}
      onClick={(evento) => evento.stopPropagation()}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M11 1 1 11M11 5 5 11M11 9 9 11" />
      </svg>
    </button>
  );
}
