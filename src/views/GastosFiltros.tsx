import type { Categoria } from '../services/gastos.service.js';
import { Widget } from '../components/Widget.js';

export interface GastosFiltrosProps {
  categorias: Categoria[];
  categoriaId?: number;
  desde: string;
  hasta: string;
  montoMin: string;
  montoMax: string;
  error: string | null;
  onCategoria: (categoriaId?: number) => void;
  onDesde: (desde: string) => void;
  onHasta: (hasta: string) => void;
  onMontoMin: (monto: string) => void;
  onMontoMax: (monto: string) => void;
}

/** Filtros del historial de gastos: categoría, fechas y rango de montos. */
export function GastosFiltros({
  categorias,
  categoriaId,
  desde,
  hasta,
  montoMin,
  montoMax,
  error,
  onCategoria,
  onDesde,
  onHasta,
  onMontoMin,
  onMontoMax,
}: GastosFiltrosProps) {
  return (
    <Widget titulo="Filtros" className="span-12">
      <div className="filtros">
        <label className="campo">
          <span className="campo__label">Categoría</span>
          <select
            value={categoriaId ?? ''}
            onChange={(evento) =>
              onCategoria(
                evento.target.value ? Number(evento.target.value) : undefined,
              )
            }
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span className="campo__label">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(evento) => onDesde(evento.target.value)}
          />
        </label>

        <label className="campo">
          <span className="campo__label">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(evento) => onHasta(evento.target.value)}
          />
        </label>

        <label className="campo">
          <span className="campo__label">Monto mínimo</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={montoMin}
            placeholder="0"
            onChange={(evento) => onMontoMin(evento.target.value)}
          />
        </label>

        <label className="campo">
          <span className="campo__label">Monto máximo</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={montoMax}
            placeholder="Sin límite"
            onChange={(evento) => onMontoMax(evento.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}
    </Widget>
  );
}
