import { useState } from 'react';
import type { Categoria, Gasto, GastoEntrada } from '../services/gastos.service.js';
import { ExpenseForm } from '../components/ExpenseForm.js';
import { mensajeDeError } from '../utils/format.js';
import {
  gastoInicial,
  normalizarFrecuencia,
  type Borrador,
} from './chatBorrador.js';
import type {
  DatosGasto,
  Frecuencia,
  OpcionesBorrador,
} from './tipos.js';

export function ExpenseDraftCard({
  mensaje,
  categorias,
  categoriasCargando,
  categoriasError,
  onReintentarCategorias,
  onConfirmar,
  onCancelar,
}: {
  mensaje: Borrador;
  categorias: Categoria[];
  categoriasCargando: boolean;
  categoriasError: string | null;
  onReintentarCategorias: () => void;
  onConfirmar: (
    id: string,
    datos: DatosGasto,
    opciones: OpcionesBorrador,
    gasto?: Gasto,
  ) => Promise<void>;
  onCancelar: (id: string) => void;
}) {
  const sugiereRecurrente =
    mensaje.modo === 'crear' &&
    (mensaje.analisis.intent === 'SET_RECURRING' ||
      Boolean(mensaje.analisis.recurringHint));
  const [recurrente, setRecurrente] = useState(sugiereRecurrente);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(() =>
    normalizarFrecuencia(mensaje.analisis.frecuencia),
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (datos: GastoEntrada) => {
    setGuardando(true);
    setError(null);
    try {
      await onConfirmar(
        mensaje.id,
        datos,
        { recurrente, frecuencia },
        mensaje.gasto,
      );
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  if (!categorias.length && categoriasCargando) {
    return (
      <div className="chat-card">
        <p className="chat-card__title">Gasto detectado</p>
        <p className="meta">Cargando categorías…</p>
      </div>
    );
  }

  if (!categorias.length && categoriasError) {
    return (
      <div className="chat-card">
        <p className="chat-card__title">Gasto detectado</p>
        <p className="alerta" role="alert">
          No pude cargar las categorías.
        </p>
        <div className="fila">
          <button type="button" className="boton boton--chico" onClick={onReintentarCategorias}>
            Reintentar
          </button>
          <button
            type="button"
            className="boton boton--fantasma boton--chico"
            onClick={() => onCancelar(mensaje.id)}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-card">
      <p className="chat-card__title">
        {mensaje.modo === 'editar' ? 'Editar gasto' : 'Gasto detectado'}
      </p>
      {sugiereRecurrente ? (
        <div className="chat-recurrente">
          <label className="chat-check">
            <input
              type="checkbox"
              checked={recurrente}
              onChange={(evento) => setRecurrente(evento.target.checked)}
            />
            <span>Crear también regla recurrente</span>
          </label>
          <label className="campo">
            <span className="campo__label">Frecuencia</span>
            <select
              value={frecuencia}
              onChange={(evento) =>
                setFrecuencia(evento.target.value as Frecuencia)
              }
              disabled={!recurrente}
            >
              <option value="DIARIA">Diaria</option>
              <option value="SEMANAL">Semanal</option>
              <option value="MENSUAL">Mensual</option>
              <option value="ANUAL">Anual</option>
            </select>
          </label>
        </div>
      ) : null}

      <ExpenseForm
        categorias={categorias}
        inicial={gastoInicial(mensaje, categorias)}
        guardando={guardando}
        error={error}
        textoGuardar={mensaje.modo === 'crear' ? 'Registrar gasto' : undefined}
        onGuardar={guardar}
        onCancelar={() => onCancelar(mensaje.id)}
      />
    </div>
  );
}
