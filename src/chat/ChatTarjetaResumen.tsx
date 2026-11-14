import { EvolutionChart } from '../components/EvolutionChart.js';
import { formatearMonto } from '../utils/format.js';
import { colorGrafico } from '../utils/colores.js';
import type { MensajeChat } from './tipos.js';

type ResumenMensaje = Extract<MensajeChat, { tipo: 'resumen' }>;
type GraficoMensaje = Extract<MensajeChat, { tipo: 'grafico' }>;

export function ResumenCard({ mensaje }: { mensaje: ResumenMensaje }) {
  return (
    <div className="chat-card">
      <p className="chat-card__title">Resumen · {mensaje.periodo.etiqueta}</p>
      <p className="chat-card__total">
        {formatearMonto(mensaje.resumen.totalGeneral)}
      </p>
      <p className="meta">
        {mensaje.resumen.cantidad} gastos ·{' '}
        {mensaje.resumen.porCategoria.length} categorías
      </p>

      {mensaje.resumen.porCategoria.length ? (
        <ul className="chat-resumen">
          {mensaje.resumen.porCategoria.map((grupo, indice) => (
            <li key={grupo.categoriaId}>
              <span className="chat-resumen__nombre">
                <span
                  className="barra__punto"
                  style={{ background: colorGrafico(indice) }}
                  aria-hidden="true"
                />
                {grupo.categoriaNombre}
              </span>
              <span className="chat-resumen__barra">
                <span
                  style={{
                    width: `${Math.min(100, grupo.porcentaje)}%`,
                    background: colorGrafico(indice),
                  }}
                />
              </span>
              <span className="num">{formatearMonto(grupo.total)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="meta">Sin gastos en el período.</p>
      )}
    </div>
  );
}

export function GraficoCard({ mensaje }: { mensaje: GraficoMensaje }) {
  return (
    <div className="chat-card chat-card--grafico">
      <EvolutionChart
        puntos={mensaje.puntos}
        agrupacion={mensaje.agrupacion}
      />
    </div>
  );
}
