import { useState } from 'react';
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
  const [agregado, setAgregado] = useState<WidgetDisponible | null>(null);

  const agregar = (widget: WidgetDisponible) => {
    onAgregar(widget.tipo);
    setAgregado(widget);
  };

  return (
    <Modal titulo="Agregar widget" onCerrar={onCerrar}>
      <p className="meta" style={{ marginBottom: 12 }}>
        Podés agregar varios widgets del mismo tipo, por ejemplo dos gráficos.
      </p>

      {agregado ? (
        <p className="widget-picker__ok" role="status">
          {agregado.titulo} agregado correctamente.
        </p>
      ) : null}

      <div className="widget-picker">
        {catalogo.map((widget) => {
          const recienAgregado = agregado?.tipo === widget.tipo;

          return (
            <div className="widget-picker__item" key={widget.tipo}>
              <div>
                <h3>{widget.titulo}</h3>
                <p>{widget.descripcion}</p>
              </div>
              <button
                type="button"
                className={`boton boton--chico ${
                  recienAgregado ? 'boton--exito' : 'boton--primario'
                }`}
                onClick={() => agregar(widget)}
              >
                {recienAgregado ? '¡Agregado!' : 'Agregar'}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
