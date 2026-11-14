import type { ReactNode } from 'react';
import { Widget } from '../components/Widget.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { WidgetPeriodoSelector } from './WidgetPeriodoSelector.js';
import type { Periodo } from '../utils/periodo.js';
import type { ModoPeriodoWidget, WidgetLayoutItem } from './tipos.js';

export interface WidgetConPeriodoProps {
  item: WidgetLayoutItem;
  periodoGlobal: Periodo;
  onCambiarPeriodo: (modo: ModoPeriodoWidget) => void;
  acciones?: ReactNode;
}

export interface WidgetGlobalProps {
  periodo: Periodo;
  acciones?: ReactNode;
}

export function Cargando({
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

export function ConError({
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
export function controles(
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
