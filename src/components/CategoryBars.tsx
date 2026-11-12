import type { ReactNode } from 'react';
import type { GrupoResumen } from '../services/resumen.service.js';
import { formatearMonto, formatearPorcentaje } from '../utils/format.js';
import { colorGrafico } from '../utils/colores.js';
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
          {grupos.map((grupo, indice) => {
            const color = colorGrafico(indice);

            return (
              <div className="barra__fila" key={grupo.categoriaId}>
                <span className="meta barra__nombre">
                  <span
                    className="barra__punto"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="barra__nombre-texto">
                    {grupo.categoriaNombre}
                  </span>
                </span>
                <div
                  className="barra__pista"
                  role="img"
                  aria-label={`${grupo.categoriaNombre}: ${formatearMonto(grupo.total)} (${formatearPorcentaje(grupo.porcentaje)})`}
                >
                  <div
                    className="barra__relleno"
                    style={{
                      width: `${Math.min(100, grupo.porcentaje)}%`,
                      background: color,
                      animationDelay: `${indice * 55}ms`,
                    }}
                  />
                </div>
                <span className="meta" style={{ textAlign: 'right' }}>
                  {formatearMonto(grupo.total)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
