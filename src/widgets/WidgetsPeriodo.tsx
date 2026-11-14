import { useResumen, useSerie } from '../hooks/datos.js';
import { TotalWidget } from '../components/TotalWidget.js';
import { CategoryBars } from '../components/CategoryBars.js';
import { EvolutionChart } from '../components/EvolutionChart.js';
import { WIDGETS } from './tipos.js';
import { resolverPeriodo } from './periodo.js';
import {
  Cargando,
  ConError,
  controles,
  type WidgetConPeriodoProps,
} from './WidgetsEstado.js';

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
