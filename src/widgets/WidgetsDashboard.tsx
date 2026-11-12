import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGastos,
  usePresupuestos,
  useResumen,
  useSerie,
} from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';
import { Widget } from '../components/Widget.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { TotalWidget } from '../components/TotalWidget.js';
import { CategoryBars } from '../components/CategoryBars.js';
import { EvolutionChart } from '../components/EvolutionChart.js';
import { BudgetWidget } from '../components/BudgetWidget.js';
import { HistoryTable } from '../components/HistoryTable.js';
import { WIDGETS } from './tipos.js';
import type { ModoPeriodoWidget, WidgetLayoutItem } from './tipos.js';
import { resolverPeriodo } from './periodo.js';
import { WidgetPeriodoSelector } from './WidgetPeriodoSelector.js';

const LIMITE_HISTORIAL = 5;

interface WidgetConPeriodoProps {
  item: WidgetLayoutItem;
  periodoGlobal: Periodo;
  onCambiarPeriodo: (modo: ModoPeriodoWidget) => void;
  acciones?: ReactNode;
}

interface WidgetGlobalProps {
  periodo: Periodo;
  acciones?: ReactNode;
}

function Cargando({
  titulo,
  acciones,
}: {
  titulo: string;
  acciones?: ReactNode;
}) {
  return (
    <Widget titulo={titulo} acciones={acciones}>
      <Loading />
    </Widget>
  );
}

function ConError({
  titulo,
  acciones,
  mensaje,
  reintentar,
}: {
  titulo: string;
  acciones?: ReactNode;
  mensaje: string;
  reintentar: () => void;
}) {
  return (
    <Widget titulo={titulo} acciones={acciones}>
      <ErrorState mensaje={mensaje} onReintentar={reintentar} />
    </Widget>
  );
}

/** Selector de período + controles de edición, en el encabezado del widget. */
function controles(
  item: WidgetLayoutItem,
  onCambiarPeriodo: (modo: ModoPeriodoWidget) => void,
  acciones?: ReactNode,
) {
  return (
    <>
      <WidgetPeriodoSelector
        valor={
          item.periodo && item.periodo !== 'global' ? item.periodo : 'mes'
        }
        onCambiar={onCambiarPeriodo}
      />
      {acciones}
    </>
  );
}

export function TotalWidgetPeriodo({
  item,
  periodoGlobal,
  onCambiarPeriodo,
  acciones,
}: WidgetConPeriodoProps) {
  const periodo = resolverPeriodo(item.periodo, periodoGlobal);
  const resumen = useResumen(periodo);
  const extras = controles(item, onCambiarPeriodo, acciones);
  const titulo = WIDGETS.total.titulo;

  if (resumen.cargando) return <Cargando titulo={titulo} acciones={extras} />;
  if (resumen.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={extras}
        mensaje={resumen.error}
        reintentar={resumen.recargar}
      />
    );
  }

  return resumen.data ? (
    <TotalWidget resumen={resumen.data} acciones={extras} />
  ) : null;
}

export function CategoriasWidgetPeriodo({
  item,
  periodoGlobal,
  onCambiarPeriodo,
  acciones,
}: WidgetConPeriodoProps) {
  const periodo = resolverPeriodo(item.periodo, periodoGlobal);
  const resumen = useResumen(periodo);
  const extras = controles(item, onCambiarPeriodo, acciones);
  const titulo = WIDGETS.categorias.titulo;

  if (resumen.cargando) return <Cargando titulo={titulo} acciones={extras} />;
  if (resumen.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={extras}
        mensaje={resumen.error}
        reintentar={resumen.recargar}
      />
    );
  }

  return (
    <CategoryBars
      grupos={resumen.data?.porCategoria ?? []}
      acciones={extras}
    />
  );
}

export function EvolucionWidgetPeriodo({
  item,
  periodoGlobal,
  onCambiarPeriodo,
  acciones,
}: WidgetConPeriodoProps) {
  const periodo = resolverPeriodo(item.periodo, periodoGlobal);
  const serie = useSerie(periodo);
  const extras = controles(item, onCambiarPeriodo, acciones);
  const titulo = WIDGETS.evolucion.titulo;

  if (serie.cargando) return <Cargando titulo={titulo} acciones={extras} />;
  if (serie.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={extras}
        mensaje={serie.error}
        reintentar={serie.recargar}
      />
    );
  }

  return serie.data ? (
    <EvolutionChart
      puntos={serie.data.puntos}
      agrupacion={serie.data.agrupacion}
      acciones={extras}
    />
  ) : null;
}

/** Presupuestos sigue el período global: no tiene selector propio. */
export function PresupuestosWidget({ periodo, acciones }: WidgetGlobalProps) {
  const presupuestos = usePresupuestos(periodo);
  const resumen = useResumen(periodo);
  const titulo = WIDGETS.presupuestos.titulo;

  if (presupuestos.cargando || resumen.cargando) {
    return <Cargando titulo={titulo} acciones={acciones} />;
  }
  if (presupuestos.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={acciones}
        mensaje={presupuestos.error}
        reintentar={presupuestos.recargar}
      />
    );
  }
  if (resumen.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={acciones}
        mensaje={resumen.error}
        reintentar={resumen.recargar}
      />
    );
  }

  return (
    <BudgetWidget
      presupuestos={presupuestos.data?.data ?? []}
      resumen={resumen.data}
      acciones={acciones}
    />
  );
}

/** Historial sigue el período global: no tiene selector propio. */
export function HistorialWidget({ periodo, acciones }: WidgetGlobalProps) {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);
  const titulo = WIDGETS.historial.titulo;

  useEffect(() => {
    setPagina(1);
  }, [periodo.desde, periodo.hasta]);

  const historial = useGastos({
    page: pagina,
    limit: LIMITE_HISTORIAL,
    fechaInicio: aDDMMYYYY(periodo.desde),
    fechaFin: aDDMMYYYY(periodo.hasta),
  });

  if (historial.cargando) return <Cargando titulo={titulo} acciones={acciones} />;
  if (historial.error) {
    return (
      <ConError
        titulo={titulo}
        acciones={acciones}
        mensaje={historial.error}
        reintentar={historial.recargar}
      />
    );
  }

  const irAGastos = () => navigate('/gastos');

  return historial.data ? (
    <HistoryTable
      pagina={historial.data}
      onEditar={irAGastos}
      onEliminar={irAGastos}
      onPagina={setPagina}
      acciones={acciones}
    />
  ) : null;
}
