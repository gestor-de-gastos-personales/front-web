import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Presupuesto } from '../services/presupuestos.service.js';
import type { Resumen } from '../services/resumen.service.js';
import { formatearMonto } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';
import { Widget } from './Widget.js';

interface BudgetWidgetProps {
  presupuestos: Presupuesto[];
  resumen: Resumen | null;
  acciones?: ReactNode;
}

export function BudgetWidget({ presupuestos, resumen, acciones }: BudgetWidgetProps) {
  const gastadoPorCategoria = new Map(
    (resumen?.porCategoria ?? []).map((grupo) => [grupo.categoriaId, grupo.total]),
  );

  return (
    <Widget titulo="Presupuestos" tag={`${presupuestos.length}`} acento="leaf" acciones={acciones}>
      {presupuestos.length === 0 ? (
        <EmptyState
          titulo="Sin presupuestos para este mes"
          detalle="Definí un tope por categoría para comparar contra el gasto real."
          accion={
            <Link to="/presupuestos" className="boton">
              Crear presupuesto
            </Link>
          }
        />
      ) : (
        <div className="barras">
          {presupuestos.map((presupuesto) => {
            const tope = Number(presupuesto.monto);
            const gastado = gastadoPorCategoria.get(presupuesto.categoriaId) ?? 0;
            const porcentaje = tope > 0 ? Math.min(100, (gastado / tope) * 100) : 0;
            const excedido = gastado > tope;

            return (
              <div key={presupuesto.id}>
                <div className="fila" style={{ justifyContent: 'space-between' }}>
                  <span className="meta">{presupuesto.categoria?.nombre ?? 'Sin categoría'}</span>
                  <span className="meta">
                    {formatearMonto(gastado)} / {formatearMonto(tope)}
                  </span>
                </div>
                <div className="barra__pista" style={{ marginTop: 4 }}>
                  <div
                    className="barra__relleno"
                    style={{
                      width: `${porcentaje}%`,
                      background: excedido ? 'var(--coral)' : 'var(--leaf)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
