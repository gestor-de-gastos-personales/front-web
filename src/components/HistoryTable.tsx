import type { Gasto, PaginaGastos } from '../services/gastos.service.js';
import { formatearFecha, formatearMonto } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';
import { Widget } from './Widget.js';

interface HistoryTableProps {
  pagina: PaginaGastos;
  onEditar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
  onPagina: (pagina: number) => void;
}

export function HistoryTable({ pagina, onEditar, onEliminar, onPagina }: HistoryTableProps) {
  const { data, meta } = pagina;

  return (
    <Widget titulo="Historial" tag={`${meta.total} gastos`} className="span-8">
      {data.length === 0 ? (
        <EmptyState titulo="No hay gastos en este período" />
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th className="num">Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((gasto) => (
              <tr key={gasto.id}>
                <td className="mono">{formatearFecha(gasto.fecha)}</td>
                <td>{gasto.descripcion}</td>
                <td className="mono">{gasto.categoria?.nombre ?? '—'}</td>
                <td className="num">{formatearMonto(gasto.monto)}</td>
                <td>
                  <button
                    type="button"
                    className="boton boton--chico"
                    onClick={() => onEditar(gasto)}
                    aria-label={`Editar ${gasto.descripcion}`}
                  >
                    Editar
                  </button>{' '}
                  <button
                    type="button"
                    className="boton boton--chico boton--peligro"
                    onClick={() => onEliminar(gasto)}
                    aria-label={`Eliminar ${gasto.descripcion}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="fila" style={{ marginTop: 14, justifyContent: 'space-between' }}>
        <span className="mono">
          Página {meta.page} de {Math.max(1, meta.totalPages)}
        </span>
        <span className="fila">
          <button
            type="button"
            className="boton boton--chico"
            disabled={meta.page <= 1}
            onClick={() => onPagina(meta.page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="boton boton--chico"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPagina(meta.page + 1)}
          >
            Siguiente
          </button>
        </span>
      </div>
    </Widget>
  );
}
