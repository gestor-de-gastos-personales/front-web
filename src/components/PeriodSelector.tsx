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

type Modo = 'mes' | 'mes-anterior' | '3-meses' | 'anio' | 'custom';

const OPCIONES: Array<{ valor: Modo; texto: string }> = [
  { valor: 'mes', texto: 'Este mes' },
  { valor: 'mes-anterior', texto: 'Mes anterior' },
  { valor: '3-meses', texto: 'Últimos 3 meses' },
  { valor: 'anio', texto: 'Este año' },
  { valor: 'custom', texto: 'Personalizado' },
];

const ETIQUETA_AGRUPACION = {
  dia: 'por día',
  semana: 'por semana',
  mes: 'por mes',
} as const;

function periodoDe(modo: Modo): Periodo | null {
  if (modo === 'mes') return mesActual();
  if (modo === 'mes-anterior') return mesAnterior();
  if (modo === '3-meses') return ultimosMeses(3);
  if (modo === 'anio') return anioActual();
  return null;
}

/** Cabecera del dashboard: folio del período y selector global. */
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
    <>
      <header className="page-head span-12">
        <div>
          <h1 className="page-title">Resumen</h1>
          <div className="fila" style={{ alignItems: 'baseline', marginTop: 6 }}>
            <p className="periodo__folio">{periodo.etiqueta}</p>
            <span className="widget__tag widget__tag--blue">
              {ETIQUETA_AGRUPACION[periodo.agrupacion]}
            </span>
          </div>
        </div>

        <div className="fila">
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
      </header>

      {error ? (
        <p className="alerta span-12" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
