import { useState } from 'react';
import { usePeriodo } from '../state/periodo.store.js';
import { useCategorias, usePresupuestos, useResumen } from '../hooks/datos.js';
import { presupuestosService } from '../services/presupuestos.service.js';
import { mesYAnio } from '../utils/periodo.js';
import { formatearMonto, mensajeDeError } from '../utils/format.js';
import { Widget } from '../components/Widget.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

export function PresupuestosView() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const { mes, anio } = mesYAnio(periodo);
  const categorias = useCategorias();
  const presupuestos = usePresupuestos(periodo);
  const resumen = useResumen(periodo);

  const [categoriaId, setCategoriaId] = useState('');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const gastadoPorCategoria = new Map(
    (resumen.data?.porCategoria ?? []).map((grupo) => [grupo.categoriaId, grupo.total]),
  );

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const valor = Number(monto);
    if (!categoriaId) return setError('Elegí una categoría.');
    if (!Number.isFinite(valor) || valor <= 0) {
      return setError('El monto tiene que ser mayor a 0.');
    }

    setGuardando(true);
    setError(null);
    try {
      await presupuestosService.guardar({
        categoriaId: Number(categoriaId),
        monto: valor,
        mes,
        anio,
      });
      setMonto('');
      presupuestos.recargar();
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid">
      <Widget titulo="Presupuestos" tag={`${mes}/${anio}`} acento="leaf" className="span-12">
        {error ? (
          <p className="alerta" role="alert">
            {error}
          </p>
        ) : null}

        <form className="fila" onSubmit={guardar}>
          <label className="campo" style={{ flex: 1 }}>
            <span className="campo__label">Categoría</span>
            <select
              value={categoriaId}
              onChange={(evento) => setCategoriaId(evento.target.value)}
            >
              <option value="">Elegí una categoría</option>
              {(categorias.data ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="campo" style={{ flex: 1 }}>
            <span className="campo__label">Tope mensual</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(evento) => setMonto(evento.target.value)}
              placeholder="50000"
            />
          </label>

          <button type="submit" className="boton boton--primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar tope'}
          </button>
        </form>

        <div style={{ marginTop: 18 }}>
          {presupuestos.cargando ? (
            <Loading />
          ) : presupuestos.error ? (
            <ErrorState mensaje={presupuestos.error} onReintentar={presupuestos.recargar} />
          ) : (presupuestos.data?.data ?? []).length === 0 ? (
            <p className="estado estado--vacio">Todavía no definiste presupuestos para este mes.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="num">Tope</th>
                  <th className="num">Gastado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(presupuestos.data?.data ?? []).map((presupuesto) => {
                  const tope = Number(presupuesto.monto);
                  const gastado = gastadoPorCategoria.get(presupuesto.categoriaId) ?? 0;
                  const excedido = gastado > tope;

                  return (
                    <tr key={presupuesto.id}>
                      <td>{presupuesto.categoria?.nombre ?? 'Sin categoría'}</td>
                      <td className="num">{formatearMonto(tope)}</td>
                      <td className="num">{formatearMonto(gastado)}</td>
                      <td className="mono">{excedido ? 'excedido' : 'en rango'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Widget>
    </div>
  );
}
