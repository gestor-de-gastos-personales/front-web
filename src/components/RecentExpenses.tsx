import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Gasto } from '../services/gastos.service.js';
import { formatearFecha, formatearMonto } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';
import { Widget } from './Widget.js';

export function RecentExpenses({ gastos, acciones }: { gastos: Gasto[]; acciones?: ReactNode }) {
  return (
    <Widget titulo="Últimos gastos" tag={`${gastos.length}`} acento="coral" acciones={acciones}>
      {gastos.length === 0 ? (
        <EmptyState titulo="Sin gastos cargados" />
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {gastos.map((gasto) => (
            <li
              key={gasto.id}
              style={{
                borderBottom: '1px solid var(--line-soft)',
                padding: '10px 0',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
              }}
            >
              <span>
                <strong>{gasto.descripcion}</strong>
                <br />
                <span className="meta">
                  {formatearFecha(gasto.fecha)} · {gasto.categoria?.nombre ?? 'Sin categoría'}
                </span>
              </span>
              <span className="num" style={{ fontSize: 18 }}>
                {formatearMonto(gasto.monto)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 12 }}>
        <Link to="/gastos" className="meta">
          Ver historial completo →
        </Link>
      </p>
    </Widget>
  );
}
