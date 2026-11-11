import type { PuntoSerie } from '../services/serie.service.js';
import type { Agrupacion } from '../utils/periodo.js';
import { formatearMonto } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';
import { Widget } from './Widget.js';

interface EvolutionChartProps {
  puntos: PuntoSerie[];
  agrupacion: Agrupacion;
}

const ETIQUETA_AGRUPACION: Record<Agrupacion, string> = {
  dia: 'por día',
  semana: 'por semana',
  mes: 'por mes',
};

/** Gráfico de barras en SVG puro: sin librerías, escala al máximo del período. */
export function EvolutionChart({ puntos, agrupacion }: EvolutionChartProps) {
  const total = puntos.reduce((acumulado, punto) => acumulado + punto.total, 0);

  if (puntos.length === 0 || total === 0) {
    return (
      <Widget titulo="Evolución del gasto" tag={ETIQUETA_AGRUPACION[agrupacion]} className="span-8">
        <EmptyState
          titulo="Sin gastos en el período"
          detalle="Cambiá el rango o registrá un gasto para ver la evolución."
        />
      </Widget>
    );
  }

  const ancho = 640;
  const alto = 240;
  const margen = 30;
  const base = alto - 34;
  const maximo = Math.max(...puntos.map((punto) => punto.total), 1);
  const pasoAncho = (ancho - margen * 2) / puntos.length;
  const cadaEtiqueta = Math.max(1, Math.ceil(puntos.length / 8));

  return (
    <Widget titulo="Evolución del gasto" tag={ETIQUETA_AGRUPACION[agrupacion]} className="span-8">
      <svg
        className="grafico"
        viewBox={`0 0 ${ancho} ${alto}`}
        role="img"
        aria-label={`Evolución de gastos en ${puntos.length} puntos`}
      >
        <line x1={margen} y1={base} x2={ancho - margen} y2={base} stroke="var(--ink)" strokeWidth="2" />
        {puntos.map((punto, indice) => {
          const barraAlto = (punto.total / maximo) * (base - 24);
          const x = margen + indice * pasoAncho + pasoAncho * 0.15;
          const anchoBarra = Math.max(2, pasoAncho * 0.7);

          return (
            <g key={punto.clave}>
              <rect
                x={x}
                y={base - barraAlto}
                width={anchoBarra}
                height={Math.max(barraAlto, punto.total > 0 ? 2 : 0)}
                fill="var(--mango)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              >
                <title>{`${punto.etiqueta}: ${formatearMonto(punto.total)}`}</title>
              </rect>
              {indice % cadaEtiqueta === 0 ? (
                <text
                  x={x + anchoBarra / 2}
                  y={alto - 14}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--ink)"
                >
                  {punto.etiqueta}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="mono" style={{ marginTop: 8 }}>
        Total del período: {formatearMonto(total)}
      </p>
    </Widget>
  );
}
