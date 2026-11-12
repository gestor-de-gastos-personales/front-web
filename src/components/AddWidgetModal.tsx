import { useEffect, useRef, useState } from 'react';
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

const DURACION_MENSAJE = 5000;

export function AddWidgetModal({ catalogo, onAgregar, onCerrar }: AddWidgetModalProps) {
  const [agregado, setAgregado] = useState<WidgetDisponible | null>(null);
  const temporizador = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }
    },
    [],
  );

  const agregar = (widget: WidgetDisponible) => {
    onAgregar(widget.tipo);
    setAgregado(widget);

    if (temporizador.current !== null) {
      window.clearTimeout(temporizador.current);
    }

    temporizador.current = window.setTimeout(() => {
      setAgregado(null);
      temporizador.current = null;
    }, DURACION_MENSAJE);
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
