import { Modal } from './Modal.js';
import type { TipoWidget, WidgetMeta } from '../widgets/tipos.js';

interface WidgetDisponible extends WidgetMeta {
  tipo: TipoWidget;
}

interface AddWidgetModalProps {
  disponibles: WidgetDisponible[];
  onAgregar: (tipo: TipoWidget) => void;
  onCerrar: () => void;
}

export function AddWidgetModal({ disponibles, onAgregar, onCerrar }: AddWidgetModalProps) {
  return (
    <Modal titulo="Agregar widget" onCerrar={onCerrar}>
      {disponibles.length === 0 ? (
        <p className="estado estado--vacio">
          Ya tenés todos los widgets en el tablero.
        </p>
      ) : (
        <div className="widget-picker">
          {disponibles.map((widget) => (
            <div className="widget-picker__item" key={widget.tipo}>
              <div>
                <h3>{widget.titulo}</h3>
                <p>{widget.descripcion}</p>
              </div>
              <button
                type="button"
                className="boton boton--primario boton--chico"
                onClick={() => onAgregar(widget.tipo)}
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
