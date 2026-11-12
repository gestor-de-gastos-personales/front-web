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
  const [formulario, setFormulario] = useState<Gasto | 'nuevo' | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const categorias = useCategorias();
  const gastos = useGastos({
    page: pagina,
    limit: LIMITE,
    fechaInicio: aDDMMYYYY(periodo.desde),
    fechaFin: aDDMMYYYY(periodo.hasta),
    categoriaId,
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

        <Widget titulo="Filtros" tag={periodo.etiqueta} className="span-12">
          <label className="campo">
            <span className="campo__label">Categoría</span>
            <select
              value={categoriaId ?? ''}
              onChange={(evento) => {
                setPagina(1);
                setCategoriaId(evento.target.value ? Number(evento.target.value) : undefined);
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
