import { useState } from 'react';
import { usePeriodo } from '../state/periodo.store.js';
import {
  anioActual,
  mesActual,
  mesAnterior,
  periodoPersonalizado,
  ultimosMeses,
} from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';
import { Widget } from './Widget.js';

type Modo = 'mes' | 'mes-anterior' | '3-meses' | 'anio' | 'custom';

const OPCIONES: Array<{ valor: Modo; texto: string }> = [
  { valor: 'mes', texto: 'Este mes' },
  { valor: 'mes-anterior', texto: 'Mes anterior' },
  { valor: '3-meses', texto: 'Últimos 3 meses' },
  { valor: 'anio', texto: 'Este año' },
  { valor: 'custom', texto: 'Personalizado' },
];

function periodoDe(modo: Modo): Periodo | null {
  if (modo === 'mes') return mesActual();
  if (modo === 'mes-anterior') return mesAnterior();
  if (modo === '3-meses') return ultimosMeses(3);
  if (modo === 'anio') return anioActual();
  return null;
}

/** Selector global: define el período que alimenta todos los widgets. */
export function PeriodSelector() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const setPeriodo = usePeriodo((estado) => estado.setPeriodo);
  const [modo, setModo] = useState<Modo>('mes');
  const [desde, setDesde] = useState(periodo.desde);
  const [hasta, setHasta] = useState(periodo.hasta);
  const [error, setError] = useState<string | null>(null);

  const cambiarModo = (valor: Modo) => {
    setModo(valor);
    setError(null);
    const nuevo = periodoDe(valor);
    if (nuevo) setPeriodo(nuevo);
  };

  const aplicarCustom = () => {
    const nuevo = periodoPersonalizado(desde, hasta);
    if (!nuevo) {
      setError('Elegí un rango válido: desde no puede ser posterior a hasta.');
      return;
    }
    setError(null);
    setPeriodo(nuevo);
  };

  return (
    <Widget
      titulo="Período"
      tag={periodo.agrupacion === 'dia' ? 'por día' : periodo.agrupacion === 'semana' ? 'por semana' : 'por mes'}
      acento="blue"
      className="span-12"
    >
      <div className="periodo">
        <p className="periodo__folio">{periodo.etiqueta}</p>
        <div style={{ marginLeft: 'auto' }} className="fila">
          <label className="campo">
            <span className="campo__label">Rango</span>
            <select
              value={modo}
              onChange={(evento) => cambiarModo(evento.target.value as Modo)}
            >
              {OPCIONES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
          </label>

          {modo === 'custom' ? (
            <>
              <label className="campo">
                <span className="campo__label">Desde</span>
                <input
                  type="date"
                  value={desde}
                  onChange={(evento) => setDesde(evento.target.value)}
                />
              </label>
              <label className="campo">
                <span className="campo__label">Hasta</span>
                <input
                  type="date"
                  value={hasta}
                  onChange={(evento) => setHasta(evento.target.value)}
                />
              </label>
              <button type="button" className="boton boton--primario" onClick={aplicarCustom}>
                Aplicar
              </button>
            </>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}
    </Widget>
  );
}
