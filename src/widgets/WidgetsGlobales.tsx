import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGastos, usePresupuestos, useResumen } from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { BudgetWidget } from '../components/BudgetWidget.js';
import { HistoryTable } from '../components/HistoryTable.js';
import { WIDGETS } from './tipos.js';
import {
  Cargando,
  ConError,
  type WidgetGlobalProps,
} from './WidgetsEstado.js';

const LIMITE_HISTORIAL = 5;

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
