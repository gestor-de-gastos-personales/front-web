import type { ReactNode } from 'react';

interface WidgetAccionesProps {
  indice: number;
  total: number;
  onIzquierda: () => void;
  onDerecha: () => void;
  onQuitar: () => void;
}

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Controles de un widget: arrastrar, mover y quitar. */
export function WidgetAcciones({
  indice,
  total,
  onIzquierda,
  onDerecha,
  onQuitar,
}: WidgetAccionesProps) {
  return (
    <div
      className="widget__actions"
      onPointerDown={(evento) => evento.stopPropagation()}
      onMouseDown={(evento) => evento.stopPropagation()}
      onTouchStart={(evento) => evento.stopPropagation()}
    >
      <span className="widget__drag" aria-hidden="true" title="Arrastrá para mover">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </span>

      <button
        type="button"
        className="widget__accion"
        aria-label="Mover a la izquierda"
        title="Mover a la izquierda"
        disabled={indice === 0}
        onClick={onIzquierda}
      >
        <Icono>
          <path d="m15 18-6-6 6-6" />
        </Icono>
      </button>

      <button
        type="button"
        className="widget__accion"
        aria-label="Mover a la derecha"
        title="Mover a la derecha"
        disabled={indice === total - 1}
        onClick={onDerecha}
      >
        <Icono>
          <path d="m9 18 6-6-6-6" />
        </Icono>
      </button>

      <button
        type="button"
        className="widget__accion"
        aria-label="Quitar widget"
        title="Quitar widget"
        onClick={onQuitar}
      >
        <Icono>
          <path d="M18 6 6 18M6 6l12 12" />
        </Icono>
      </button>
    </div>
  );
}
