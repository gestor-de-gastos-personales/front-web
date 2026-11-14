import type { Gasto } from '../services/gastos.service.js';
import { formatearFecha, formatearMonto } from '../utils/format.js';
import type { MensajeChat } from './tipos.js';

type HistorialMensaje = Extract<MensajeChat, { tipo: 'historial' }>;

export function HistorialCard({
  mensaje,
  onPagina,
  onEditar,
  onEliminar,
}: {
  mensaje: HistorialMensaje;
  onPagina: (
    id: string,
    pagina: number,
    periodo: HistorialMensaje['periodo'],
  ) => Promise<void>;
  onEditar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
}) {
  const { pagina } = mensaje;
  const totalPaginas = Math.max(1, pagina.meta.totalPages);

  return (
    <div className="chat-card">
      <p className="chat-card__title">Historial · {mensaje.periodo.etiqueta}</p>
      {pagina.data.length === 0 ? (
        <p className="meta">Sin gastos en el período.</p>
      ) : (
        <ul className="chat-gastos">
          {pagina.data.map((gasto) => (
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
                <button
                  type="button"
                  className="boton boton--chico"
                  onClick={() => onEditar(gasto)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="boton boton--chico boton--peligro"
                  onClick={() => onEliminar(gasto)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="chat-paginacion">
        <button
          type="button"
          className="boton boton--chico"
          disabled={pagina.meta.page <= 1}
          onClick={() => void onPagina(mensaje.id, pagina.meta.page - 1, mensaje.periodo)}
        >
          Anterior
        </button>
        <span className="meta">
          Página {pagina.meta.page} de {totalPaginas}
        </span>
        <button
          type="button"
          className="boton boton--chico"
          disabled={pagina.meta.page >= totalPaginas}
          onClick={() => void onPagina(mensaje.id, pagina.meta.page + 1, mensaje.periodo)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
