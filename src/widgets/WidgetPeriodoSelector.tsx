import type { ModoPeriodoWidget } from './tipos.js';

interface WidgetPeriodoSelectorProps {
  valor: ModoPeriodoWidget;
  onCambiar: (modo: ModoPeriodoWidget) => void;
  etiqueta?: string;
}

const OPCIONES: Array<{ valor: ModoPeriodoWidget; texto: string }> = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: 'semana', texto: 'Esta semana' },
  { valor: 'mes', texto: 'Este mes' },
  { valor: 'mes-anterior', texto: 'Mes anterior' },
  { valor: '15-dias', texto: 'Últimos 15 días' },
  { valor: '3-meses', texto: 'Últimos 3 meses' },
  { valor: 'anio', texto: 'Este año' },
];

/** Selector compacto de período que vive en el encabezado de cada widget. */
export function WidgetPeriodoSelector({
  valor,
  onCambiar,
  etiqueta = 'Período del widget',
}: WidgetPeriodoSelectorProps) {
  return (
    <label className="widget__periodo">
      <span className="sr-only">{etiqueta}</span>
      <select
        value={valor}
        aria-label={etiqueta}
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
