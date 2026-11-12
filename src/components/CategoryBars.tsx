import type { ReactNode } from 'react';
import type { GrupoResumen } from '../services/resumen.service.js';
import { formatearMonto, formatearPorcentaje } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';
import { Widget } from './Widget.js';

interface CategoryBarsProps {
  grupos: GrupoResumen[];
  acciones?: ReactNode;
}

export function CategoryBars({ grupos, acciones }: CategoryBarsProps) {
  return (
    <Widget titulo="Gasto por categoría" tag={`${grupos.length} categorías`} acciones={acciones}>
      {grupos.length === 0 ? (
        <EmptyState titulo="Todavía no hay gastos en este período" />
      ) : (
        <div className="barras">
          {grupos.map((grupo) => (
            <div className="barra__fila" key={grupo.categoriaId}>
              <span className="meta">{grupo.categoriaNombre}</span>
              <div
                className="barra__pista"
                role="img"
                aria-label={`${grupo.categoriaNombre}: ${formatearMonto(grupo.total)} (${formatearPorcentaje(grupo.porcentaje)})`}
              >
                <div
                  className="barra__relleno"
                  style={{ width: `${Math.min(100, grupo.porcentaje)}%` }}
                />
              </div>
              <span className="meta" style={{ textAlign: 'right' }}>
                {formatearMonto(grupo.total)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}
