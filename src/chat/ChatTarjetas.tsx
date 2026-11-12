import { useState } from 'react';
import type { Categoria, Gasto, GastoEntrada } from '../services/gastos.service.js';
import { ExpenseForm } from '../components/ExpenseForm.js';
import { EvolutionChart } from '../components/EvolutionChart.js';
import { formatearFecha, formatearMonto, mensajeDeError } from '../utils/format.js';
import { colorGrafico } from '../utils/colores.js';
import { categoriaSugerida, fechaHoyISO } from './chatPeriodo.js';
import type {
  DatosGasto,
  Frecuencia,
  MensajeChat,
  OpcionesBorrador,
} from './tipos.js';

type Borrador = Extract<MensajeChat, { tipo: 'borrador' }>;
type ResumenMensaje = Extract<MensajeChat, { tipo: 'resumen' }>;
type GraficoMensaje = Extract<MensajeChat, { tipo: 'grafico' }>;
type HistorialMensaje = Extract<MensajeChat, { tipo: 'historial' }>;
type CandidatosMensaje = Extract<MensajeChat, { tipo: 'candidatos' }>;
type CategoriaMensaje = Extract<MensajeChat, { tipo: 'categoria' }>;

function normalizarFrecuencia(valor?: string | null): Frecuencia {
  const texto = (valor ?? '').toLowerCase();
  if (texto.includes('diar')) return 'DIARIA';
  if (texto.includes('semanal')) return 'SEMANAL';
  if (texto.includes('anual')) return 'ANUAL';
  return 'MENSUAL';
}

function gastoInicial(
  mensaje: Borrador,
  categorias: Categoria[],
): Gasto {
  if (mensaje.gasto) return mensaje.gasto;

  const sugerida = mensaje.categoriaId
    ? categorias.find((categoria) => categoria.id === mensaje.categoriaId)
    : categoriaSugerida(mensaje.analisis, categorias);

  return {
    id: 0,
    descripcion:
      mensaje.analisis.descripcion ?? mensaje.analisis.comercio ?? '',
    monto: mensaje.analisis.monto ?? '',
    fecha: mensaje.analisis.fecha ?? fechaHoyISO(),
    categoriaId: sugerida?.id ?? 0,
    categoria: sugerida ?? null,
  };
}

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

export function HistorialCard({
  mensaje,
  onPagina,
  onEditar,
  onEliminar,
}: {
  mensaje: HistorialMensaje;
  onPagina: (
    id: string,
    pagina: number,
    periodo: HistorialMensaje['periodo'],
  ) => Promise<void>;
  onEditar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
}) {
  const { pagina } = mensaje;
  const totalPaginas = Math.max(1, pagina.meta.totalPages);

  return (
    <div className="chat-card">
      <p className="chat-card__title">Historial · {mensaje.periodo.etiqueta}</p>
      {pagina.data.length === 0 ? (
        <p className="meta">Sin gastos en el período.</p>
      ) : (
        <ul className="chat-gastos">
          {pagina.data.map((gasto) => (
            <li className="chat-gasto" key={gasto.id}>
              <div className="chat-gasto__info">
                <strong>{gasto.descripcion}</strong>
                <span className="meta">
                  {formatearFecha(gasto.fecha)} ·{' '}
                  {gasto.categoria?.nombre ?? 'Sin categoría'}
                </span>
              </div>
              <span className="num">{formatearMonto(gasto.monto)}</span>
              <div className="chat-gasto__acciones">
                <button
                  type="button"
                  className="boton boton--chico"
                  onClick={() => onEditar(gasto)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="boton boton--chico boton--peligro"
                  onClick={() => onEliminar(gasto)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="chat-paginacion">
        <button
          type="button"
          className="boton boton--chico"
          disabled={pagina.meta.page <= 1}
          onClick={() => void onPagina(mensaje.id, pagina.meta.page - 1, mensaje.periodo)}
        >
          Anterior
        </button>
        <span className="meta">
          Página {pagina.meta.page} de {totalPaginas}
        </span>
        <button
          type="button"
          className="boton boton--chico"
          disabled={pagina.meta.page >= totalPaginas}
          onClick={() => void onPagina(mensaje.id, pagina.meta.page + 1, mensaje.periodo)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export function CandidatosCard({
  mensaje,
  onEditar,
  onEliminar,
  onCancelar,
}: {
  mensaje: CandidatosMensaje;
  onEditar: (id: string, gasto: Gasto) => void;
  onEliminar: (id: string, gasto: Gasto) => Promise<void>;
  onCancelar: (id: string) => void;
}) {
  const [borrando, setBorrando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async (gasto: Gasto) => {
    setBorrando(gasto.id);
    setError(null);
    try {
      await onEliminar(mensaje.id, gasto);
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div className="chat-card">
      <p className="chat-card__title">
        {mensaje.accion === 'eliminar'
          ? '¿Cuál querés eliminar?'
          : '¿Cuál querés editar?'}
      </p>

      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="chat-gastos">
        {mensaje.gastos.map((gasto) => (
          <li className="chat-gasto" key={gasto.id}>
            <div className="chat-gasto__info">
              <strong>{gasto.descripcion}</strong>
              <span className="meta">
                {formatearFecha(gasto.fecha)} ·{' '}
                {gasto.categoria?.nombre ?? 'Sin categoría'}
              </span>
            </div>
            <span className="num">{formatearMonto(gasto.monto)}</span>
            <div className="chat-gasto__acciones">
              {mensaje.accion === 'eliminar' ? (
                <button
                  type="button"
                  className="boton boton--chico boton--peligro"
                  disabled={borrando !== null}
                  onClick={() => void eliminar(gasto)}
                >
                  {borrando === gasto.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              ) : (
                <button
                  type="button"
                  className="boton boton--chico"
                  onClick={() => onEditar(mensaje.id, gasto)}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="boton boton--fantasma boton--chico"
        onClick={() => onCancelar(mensaje.id)}
      >
        Cancelar
      </button>
    </div>
  );
}

export function CategoriaCard({
  mensaje,
  onCrear,
  onCancelar,
}: {
  mensaje: CategoriaMensaje;
  onCrear: (id: string, nombre: string) => Promise<void>;
  onCancelar: (id: string) => void;
}) {
  const [nombre, setNombre] = useState(mensaje.nombre);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nombre.trim().length < 2) {
      setError('El nombre tiene que tener al menos 2 letras.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onCrear(mensaje.id, nombre.trim());
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="chat-card" onSubmit={crear}>
      <p className="chat-card__title">Nueva categoría</p>
      <label className="campo">
        <span className="campo__label">Nombre</span>
        <input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Ej: Mascotas"
          autoFocus
        />
      </label>
      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}
      <div className="fila">
        <button
          type="submit"
          className="boton boton--primario boton--chico"
          disabled={guardando}
        >
          {guardando ? 'Creando…' : 'Crear categoría'}
        </button>
        <button
          type="button"
          className="boton boton--fantasma boton--chico"
          onClick={() => onCancelar(mensaje.id)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
