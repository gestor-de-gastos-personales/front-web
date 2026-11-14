import { WidgetPeriodoSelector } from '../widgets/WidgetPeriodoSelector.js';
import type { ModoPeriodoWidget } from '../widgets/tipos.js';
import { IconoCerrar } from './ChatBurbujas.js';

/** Encabezado del asistente: período, limpiar y cerrar (en modo drawer). */
export function ChatHeader({
  modo,
  cargando,
  modoPeriodo,
  onCambiarPeriodo,
  onLimpiar,
  onCerrar,
}: {
  modo: 'drawer' | 'pagina';
  cargando: boolean;
  modoPeriodo: ModoPeriodoWidget;
  onCambiarPeriodo: (modo: ModoPeriodoWidget) => void;
  onLimpiar: () => void;
  onCerrar?: () => void;
}) {
  return (
    <header className="chat-head">
      <div>
        <h2 className="chat-head__titulo">Asistente</h2>
        <p className="meta">
          {cargando ? 'Analizando…' : 'Gastos en lenguaje natural'}
        </p>
      </div>
      <div className="chat-head__acciones">
        <WidgetPeriodoSelector
          valor={modoPeriodo}
          onCambiar={onCambiarPeriodo}
          etiqueta="Período del asistente"
        />
        <button
          type="button"
          className="boton boton--fantasma boton--chico"
          onClick={onLimpiar}
        >
          Limpiar
        </button>
        {modo === 'drawer' && onCerrar ? (
          <button
            type="button"
            className="chat-cerrar"
            aria-label="Cerrar asistente"
            onClick={onCerrar}
          >
            <IconoCerrar />
          </button>
        ) : null}
      </div>
    </header>
  );
}
