import { useState } from 'react';
import { useCategorias, useGastos } from '../hooks/datos.js';
import { gastosService } from '../services/gastos.service.js';
import type { Gasto, GastoEntrada } from '../services/gastos.service.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { mensajeDeError } from '../utils/format.js';
import { PageHeader } from '../components/PageHeader.js';
import { GastosFiltros } from './GastosFiltros.js';
import { GastosFormulario } from './GastosFormulario.js';
import { GastosTabla } from './GastosTabla.js';

const LIMITE = 8;

export function GastosView() {
  const [pagina, setPagina] = useState(1);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
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

  const cambiarCategoria = (valor?: number) => {
    setPagina(1);
    setCategoriaId(valor);
  };
  const cambiarDesde = (valor: string) => {
    setPagina(1);
    setDesde(valor);
  };
  const cambiarHasta = (valor: string) => {
    setPagina(1);
    setHasta(valor);
  };
  const cambiarMontoMin = (valor: string) => {
    setPagina(1);
    setMontoMin(valor);
  };
  const cambiarMontoMax = (valor: string) => {
    setPagina(1);
    setMontoMax(valor);
  };

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

        <GastosFiltros
          categorias={categorias.data ?? []}
          categoriaId={categoriaId}
          desde={desde}
          hasta={hasta}
          montoMin={montoMin}
          montoMax={montoMax}
          error={errorAccion}
          onCategoria={cambiarCategoria}
          onDesde={cambiarDesde}
          onHasta={cambiarHasta}
          onMontoMin={cambiarMontoMin}
          onMontoMax={cambiarMontoMax}
        />

        <GastosTabla
          cargando={gastos.cargando}
          error={gastos.error}
          pagina={gastos.data}
          onReintentar={gastos.recargar}
          onEditar={(gasto) => {
            setErrorAccion(null);
            setFormulario(gasto);
          }}
          onEliminar={eliminar}
          onPagina={setPagina}
        />
      </div>

      {formulario ? (
        <GastosFormulario
          formulario={formulario}
          categorias={categorias.data ?? []}
          guardando={guardando}
          error={errorAccion}
          onGuardar={guardar}
          onCerrar={() => setFormulario(null)}
        />
      ) : null}
    </>
  );
}
