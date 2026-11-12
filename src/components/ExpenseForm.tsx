import { useState } from 'react';
import type { Categoria, Gasto, GastoEntrada } from '../services/gastos.service.js';

interface ExpenseFormProps {
  categorias: Categoria[];
  inicial?: Gasto | null;
  guardando?: boolean;
  error?: string | null;
  onGuardar: (datos: GastoEntrada) => void;
  onCancelar: () => void;
}

function hoyLocal(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function ExpenseForm({
  categorias,
  inicial,
  guardando = false,
  error,
  onGuardar,
  onCancelar,
}: ExpenseFormProps) {
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [valor, setValor] = useState(inicial ? String(inicial.monto) : '');
  const [fecha, setFecha] = useState(inicial?.fecha?.slice(0, 10) ?? hoyLocal());
  const [categoria, setCategoria] = useState(
    inicial?.categoriaId
      ? String(inicial.categoriaId)
      : categorias[0]
        ? String(categorias[0].id)
        : '',
  );
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const numero = Number(valor);

    if (!descripcion.trim()) return setErrorLocal('Escribí una descripción.');
    if (!Number.isFinite(numero) || numero <= 0) {
      return setErrorLocal('El monto tiene que ser mayor a 0.');
    }
    if (!fecha) return setErrorLocal('Elegí una fecha.');
    if (!categoria) return setErrorLocal('Elegí una categoría.');

    setErrorLocal(null);
    onGuardar({
      descripcion: descripcion.trim(),
      valor: numero,
      fecha,
      categoria: Number(categoria),
    });
  };

  return (
    <form className="auth__form" onSubmit={enviar}>
      {error || errorLocal ? (
        <p className="alerta" role="alert">
          {errorLocal ?? error}
        </p>
      ) : null}

      <label className="campo">
        <span className="campo__label">Descripción</span>
        <input
          value={descripcion}
          onChange={(evento) => setDescripcion(evento.target.value)}
          placeholder="Ej: Coto, nafta, farmacia"
          required
        />
      </label>

      <label className="campo">
        <span className="campo__label">Monto</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          placeholder="1500"
          required
        />
      </label>

      <label className="campo">
        <span className="campo__label">Fecha</span>
        <input
          type="date"
          value={fecha}
          onChange={(evento) => setFecha(evento.target.value)}
          required
        />
      </label>

      <label className="campo">
        <span className="campo__label">Categoría</span>
        <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
          {categorias.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="fila">
        <button type="submit" className="boton boton--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Registrar gasto'}
        </button>
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
