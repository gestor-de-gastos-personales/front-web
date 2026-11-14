import { useState } from 'react';
import type { Gasto } from '../services/gastos.service.js';
import { formatearFecha, formatearMonto, mensajeDeError } from '../utils/format.js';
import type { MensajeChat } from './tipos.js';

type CandidatosMensaje = Extract<MensajeChat, { tipo: 'candidatos' }>;

export function CandidatosCard({
  mensaje,
  onEditar,
  onEliminar,
  onCancelar,
}: {
  mensaje: CandidatosMensaje;
  onEditar: (id: string, gasto: Gasto) => void;
  onEliminar: (id: string, gasto: Gasto) => Promise<void>;
  onCancelar: (id: string) => void;
}) {
  const [borrando, setBorrando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async (gasto: Gasto) => {
    setBorrando(gasto.id);
    setError(null);
    try {
      await onEliminar(mensaje.id, gasto);
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div className="chat-card">
      <p className="chat-card__title">
        {mensaje.accion === 'eliminar'
          ? '¿Cuál querés eliminar?'
          : '¿Cuál querés editar?'}
      </p>

      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="chat-gastos">
        {mensaje.gastos.map((gasto) => (
          <li className="chat-gasto" key={gasto.id}>
            <div className="chat-gasto__info">
              <strong>{gasto.descripcion}</strong>
              <span className="meta">
                {formatearFecha(gasto.fecha)} ·{' '}
                {gasto.categoria?.nombre ?? 'Sin categoría'}
              </span>
            </div>
            <span className="num">{formatearMonto(gasto.monto)}</span>
            <div className="chat-gasto__acciones">
              {mensaje.accion === 'eliminar' ? (
                <button
                  type="button"
                  className="boton boton--chico boton--peligro"
                  disabled={borrando !== null}
                  onClick={() => void eliminar(gasto)}
                >
                  {borrando === gasto.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              ) : (
                <button
                  type="button"
                  className="boton boton--chico"
                  onClick={() => onEditar(mensaje.id, gasto)}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="boton boton--fantasma boton--chico"
        onClick={() => onCancelar(mensaje.id)}
      >
        Cancelar
      </button>
    </div>
  );
}
