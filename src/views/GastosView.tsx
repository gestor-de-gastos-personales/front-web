import { useState } from 'react';
import { usePeriodo } from '../state/periodo.store.js';
import { useCategorias, useGastos } from '../hooks/datos.js';
import { gastosService } from '../services/gastos.service.js';
import type { Gasto, GastoEntrada } from '../services/gastos.service.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { mensajeDeError } from '../utils/format.js';
import { HistoryTable } from '../components/HistoryTable.js';
import { Modal } from '../components/Modal.js';
import { ExpenseForm } from '../components/ExpenseForm.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { Widget } from '../components/Widget.js';
import { PageHeader } from '../components/PageHeader.js';

const LIMITE = 8;

export function GastosView() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const [pagina, setPagina] = useState(1);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState(periodo.desde);
  const [hasta, setHasta] = useState(periodo.hasta);
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [formulario, setFormulario] = useState<Gasto | 'nuevo' | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const categorias = useCategorias();
  const montoMinimo = montoMin.trim() === '' ? undefined : Number(montoMin);
  const montoMaximo = montoMax.trim() === '' ? undefined : Number(montoMax);
  const gastos = useGastos({
    page: pagina,
    limit: LIMITE,
    fechaInicio: desde ? aDDMMYYYY(desde) : undefined,
    fechaFin: hasta ? aDDMMYYYY(hasta) : undefined,
    categoriaId,
    montoMin: montoMinimo,
    montoMax: montoMaximo,
  });

  const recargar = () => gastos.recargar();

  const guardar = async (datos: GastoEntrada) => {
    setGuardando(true);
    setErrorAccion(null);
    try {
      if (formulario && formulario !== 'nuevo') {
        await gastosService.actualizar(formulario.id, datos);
      } else {
        await gastosService.crear(datos);
      }
      setFormulario(null);
      recargar();
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (gasto: Gasto) => {
    if (!window.confirm(`¿Eliminar "${gasto.descripcion}" (${gasto.monto})?`)) return;
    setErrorAccion(null);
    try {
      await gastosService.eliminar(gasto.id);
      recargar();
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    }
  };

  return (
    <>
      <div className="grid">
        <PageHeader
          titulo="Gastos"
          acciones={
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => {
                setErrorAccion(null);
                setFormulario('nuevo');
              }}
            >
              Nuevo gasto
            </button>
          }
        />

        <Widget titulo="Filtros" className="span-12">
          <div className="filtros">
            <label className="campo">
              <span className="campo__label">Categoría</span>
              <select
                value={categoriaId ?? ''}
                onChange={(evento) => {
                  setPagina(1);
                  setCategoriaId(
                    evento.target.value ? Number(evento.target.value) : undefined,
                  );
                }}
              >
                <option value="">Todas</option>
                {(categorias.data ?? []).map((categoria) => (
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
                onChange={(evento) => {
                  setPagina(1);
                  setDesde(evento.target.value);
                }}
              />
            </label>

            <label className="campo">
              <span className="campo__label">Hasta</span>
              <input
                type="date"
                value={hasta}
                onChange={(evento) => {
                  setPagina(1);
                  setHasta(evento.target.value);
                }}
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
                onChange={(evento) => {
                  setPagina(1);
                  setMontoMin(evento.target.value);
                }}
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
                onChange={(evento) => {
                  setPagina(1);
                  setMontoMax(evento.target.value);
                }}
              />
            </label>
          </div>

          {errorAccion ? (
            <p className="alerta" role="alert">
              {errorAccion}
            </p>
          ) : null}
        </Widget>

        {gastos.cargando ? (
          <Widget titulo="Historial" className="span-12">
            <Loading />
          </Widget>
        ) : gastos.error ? (
          <div className="span-12">
            <ErrorState mensaje={gastos.error} onReintentar={gastos.recargar} />
          </div>
        ) : gastos.data ? (
          <div className="span-12">
            <HistoryTable
              pagina={gastos.data}
              onEditar={(gasto) => {
                setErrorAccion(null);
                setFormulario(gasto);
              }}
              onEliminar={eliminar}
              onPagina={setPagina}
            />
          </div>
        ) : null}
      </div>

      {formulario ? (
        <Modal
          titulo={formulario === 'nuevo' ? 'Nuevo gasto' : 'Editar gasto'}
          onCerrar={() => setFormulario(null)}
        >
          <ExpenseForm
            categorias={categorias.data ?? []}
            inicial={formulario === 'nuevo' ? null : formulario}
            guardando={guardando}
            error={errorAccion}
            onGuardar={guardar}
            onCancelar={() => setFormulario(null)}
          />
        </Modal>
      ) : null}
    </>
  );
}
