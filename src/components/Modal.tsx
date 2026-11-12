import type { ReactNode } from 'react';

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  /** Muestra el botón “Cerrar” del encabezado (por defecto sí). */
  mostrarCerrar?: boolean;
  children: ReactNode;
}

export function Modal({
  titulo,
  onCerrar,
  mostrarCerrar = true,
  children,
}: ModalProps) {
  return (
    <div
      className="modal__fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="widget__head">
          <h2 className="widget__title">{titulo}</h2>
          {mostrarCerrar ? (
            <button type="button" className="boton boton--chico" onClick={onCerrar}>
              Cerrar
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
