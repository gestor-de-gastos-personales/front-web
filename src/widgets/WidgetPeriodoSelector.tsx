import type { ModoPeriodoWidget } from './tipos.js';

interface WidgetPeriodoSelectorProps {
  valor: ModoPeriodoWidget;
  onCambiar: (modo: ModoPeriodoWidget) => void;
}

const OPCIONES: Array<{ valor: ModoPeriodoWidget; texto: string }> = [
  { valor: 'global', texto: 'Período global' },
  { valor: 'mes', texto: 'Este mes' },
  { valor: 'mes-anterior', texto: 'Mes anterior' },
  { valor: '3-meses', texto: 'Últimos 3 meses' },
  { valor: 'anio', texto: 'Este año' },
];

/** Selector compacto de período que vive en el encabezado de cada widget. */
export function WidgetPeriodoSelector({
  valor,
  onCambiar,
}: WidgetPeriodoSelectorProps) {
  return (
    <label className="widget__periodo">
      <span className="sr-only">Período del widget</span>
      <select
        value={valor}
        aria-label="Período del widget"
        onChange={(evento) =>
          onCambiar(evento.target.value as ModoPeriodoWidget)
        }
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
