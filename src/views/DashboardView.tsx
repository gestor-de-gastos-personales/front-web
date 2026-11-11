import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeriodo } from '../state/periodo.store.js';
import { useGastos, usePresupuestos, useResumen, useSerie } from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { PeriodSelector } from '../components/PeriodSelector.js';
import { TotalWidget } from '../components/TotalWidget.js';
import { CategoryBars } from '../components/CategoryBars.js';
import { EvolutionChart } from '../components/EvolutionChart.js';
import { BudgetWidget } from '../components/BudgetWidget.js';
import { RecentExpenses } from '../components/RecentExpenses.js';
import { HistoryTable } from '../components/HistoryTable.js';
import { Widget } from '../components/Widget.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';

const LIMITE_HISTORIAL = 5;

export function DashboardView() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);

  const resumen = useResumen(periodo);
  const serie = useSerie(periodo);
  const ultimos = useGastos({ limit: LIMITE_HISTORIAL });
  const presupuestos = usePresupuestos(periodo);
  const historial = useGastos({
    page: pagina,
    limit: LIMITE_HISTORIAL,
    fechaInicio: aDDMMYYYY(periodo.desde),
    fechaFin: aDDMMYYYY(periodo.hasta),
  });

  const irAGastos = () => navigate('/gastos');

  return (
    <div className="grid">
      <PeriodSelector />

      {resumen.cargando ? (
        <Widget titulo="Total del período" className="span-4">
          <Loading />
        </Widget>
      ) : resumen.error ? (
        <div className="span-4">
          <ErrorState mensaje={resumen.error} onReintentar={resumen.recargar} />
        </div>
      ) : resumen.data ? (
        <TotalWidget resumen={resumen.data} />
      ) : null}

      {resumen.cargando ? (
        <Widget titulo="Gasto por categoría" className="span-8">
          <Loading />
        </Widget>
      ) : resumen.error ? (
        <div className="span-8">
          <ErrorState mensaje={resumen.error} onReintentar={resumen.recargar} />
        </div>
      ) : resumen.data ? (
        <CategoryBars grupos={resumen.data.porCategoria} />
      ) : null}

      {serie.cargando ? (
        <Widget titulo="Evolución del gasto" className="span-8">
          <Loading />
        </Widget>
      ) : serie.error ? (
        <div className="span-8">
          <ErrorState mensaje={serie.error} onReintentar={serie.recargar} />
        </div>
      ) : serie.data ? (
        <EvolutionChart puntos={serie.data.puntos} agrupacion={serie.data.agrupacion} />
      ) : null}

      <BudgetWidget
        presupuestos={presupuestos.data?.data ?? []}
        resumen={resumen.data}
      />

      {ultimos.cargando ? (
        <Widget titulo="Últimos gastos" className="span-4">
          <Loading />
        </Widget>
      ) : ultimos.error ? (
        <div className="span-4">
          <ErrorState mensaje={ultimos.error} onReintentar={ultimos.recargar} />
        </div>
      ) : (
        <RecentExpenses gastos={ultimos.data?.data ?? []} />
      )}

      {historial.cargando ? (
        <Widget titulo="Historial" className="span-8">
          <Loading />
        </Widget>
      ) : historial.error ? (
        <div className="span-8">
          <ErrorState mensaje={historial.error} onReintentar={historial.recargar} />
        </div>
      ) : historial.data ? (
        <HistoryTable
          pagina={historial.data}
          onEditar={irAGastos}
          onEliminar={irAGastos}
          onPagina={setPagina}
        />
      ) : null}
    </div>
  );
}
