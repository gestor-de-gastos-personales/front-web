import { Modal } from './Modal.js';
import type { TipoWidget, WidgetMeta } from '../widgets/tipos.js';

interface WidgetDisponible extends WidgetMeta {
  tipo: TipoWidget;
}

interface AddWidgetModalProps {
  catalogo: WidgetDisponible[];
  onAgregar: (tipo: TipoWidget) => void;
  onCerrar: () => void;
}

export function AddWidgetModal({ catalogo, onAgregar, onCerrar }: AddWidgetModalProps) {
  return (
    <Modal titulo="Agregar widget" onCerrar={onCerrar}>
      <p className="meta" style={{ marginBottom: 12 }}>
        Podés agregar varios widgets del mismo tipo, por ejemplo dos gráficos.
      </p>
      <div className="widget-picker">
        {catalogo.map((widget) => (
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
    </Modal>
  );
}
