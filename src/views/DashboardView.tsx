import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAuth } from '../state/auth.store.js';
import { usePeriodo } from '../state/periodo.store.js';
import { useGastos, usePresupuestos, useResumen, useSerie } from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { ORDEN_WIDGETS, WIDGETS } from '../widgets/tipos.js';
import type { WidgetLayoutItem } from '../widgets/tipos.js';
import { useDashboardLayout } from '../widgets/useDashboardLayout.js';
import { WidgetAcciones } from '../widgets/WidgetAcciones.js';
import { WidgetSlot } from '../widgets/WidgetSlot.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';
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
import { EmptyState } from '../components/EmptyState.js';

const LIMITE_HISTORIAL = 5;

export function DashboardView() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const navigate = useNavigate();
  const usuarioId = useAuth((estado) => estado.usuario?.id ?? null);
  const layout = useDashboardLayout(usuarioId);

  const [pagina, setPagina] = useState(1);
  const [picker, setPicker] = useState(false);
  const [activo, setActivo] = useState<{ id: string; ancho: number } | null>(null);

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

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

  /** Al pasar sobre otro widget, se reordena en vivo (el resto se desplaza). */
  const alArrastrar = (evento: DragOverEvent) => {
    const { active, over } = evento;
    if (over && active.id !== over.id) {
      layout.moverPorId(String(active.id), String(over.id));
    }
  };

  const alEmpezarArrastre = (evento: DragStartEvent) => {
    setActivo({
      id: String(evento.active.id),
      ancho: evento.active.rect.current.initial?.width ?? 0,
    });
  };

  const alTerminarArrastre = () => setActivo(null);

  const contenido = (item: WidgetLayoutItem, indice: number) => {
    const meta = WIDGETS[item.tipo];
    const acciones = (
      <WidgetAcciones
        indice={indice}
        total={layout.items.length}
        onIzquierda={() => layout.moverIzquierda(indice)}
        onDerecha={() => layout.moverDerecha(indice)}
        onQuitar={() => layout.quitar(item.id)}
      />
    );

    const cargando = (
      <Widget titulo={meta.titulo} acciones={acciones}>
        <Loading />
      </Widget>
    );

    const error = (mensaje: string, reintentar: () => void) => (
      <Widget titulo={meta.titulo} acciones={acciones}>
        <ErrorState mensaje={mensaje} onReintentar={reintentar} />
      </Widget>
    );

    switch (item.tipo) {
      case 'total':
        if (resumen.cargando) return cargando;
        if (resumen.error) return error(resumen.error, resumen.recargar);
        return resumen.data ? (
          <TotalWidget resumen={resumen.data} acciones={acciones} />
        ) : null;

      case 'categorias':
        if (resumen.cargando) return cargando;
        if (resumen.error) return error(resumen.error, resumen.recargar);
        return (
          <CategoryBars
            grupos={resumen.data?.porCategoria ?? []}
            acciones={acciones}
          />
        );

      case 'evolucion':
        if (serie.cargando) return cargando;
        if (serie.error) return error(serie.error, serie.recargar);
        return serie.data ? (
          <EvolutionChart
            puntos={serie.data.puntos}
            agrupacion={serie.data.agrupacion}
            acciones={acciones}
          />
        ) : null;

      case 'presupuestos':
        if (presupuestos.cargando) return cargando;
        if (presupuestos.error) return error(presupuestos.error, presupuestos.recargar);
        return (
          <BudgetWidget
            presupuestos={presupuestos.data?.data ?? []}
            resumen={resumen.data}
            acciones={acciones}
          />
        );

      case 'ultimos':
        if (ultimos.cargando) return cargando;
        if (ultimos.error) return error(ultimos.error, ultimos.recargar);
        return (
          <RecentExpenses gastos={ultimos.data?.data ?? []} acciones={acciones} />
        );

      case 'historial':
        if (historial.cargando) return cargando;
        if (historial.error) return error(historial.error, historial.recargar);
        return historial.data ? (
          <HistoryTable
            pagina={historial.data}
            onEditar={irAGastos}
            onEliminar={irAGastos}
            onPagina={setPagina}
            acciones={acciones}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={alEmpezarArrastre}
      onDragOver={alArrastrar}
      onDragEnd={alTerminarArrastre}
      onDragCancel={alTerminarArrastre}
    >
      <div className="grid">
        <PeriodSelector />

        <div className="dashboard-tools span-12">
          <button
            type="button"
            className="boton boton--chico"
            onClick={() => setPicker(true)}
          >
            Agregar widget
          </button>
          <button
            type="button"
            className="boton boton--fantasma boton--chico"
            onClick={layout.resetear}
          >
            Restablecer
          </button>
        </div>

        <SortableContext
          items={layout.items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {layout.items.map((item, indice) => (
            <WidgetSlot
              key={item.id}
              item={item}
              indice={indice}
              onRedimensionar={(span) => layout.cambiarSpan(indice, span)}
            >
              {contenido(item, indice)}
            </WidgetSlot>
          ))}
        </SortableContext>

        {layout.items.length === 0 ? (
          <div className="span-12">
            <EmptyState
              titulo="Tu tablero está vacío"
              detalle="Agregá los widgets que quieras ver."
              accion={
                <button
                  type="button"
                  className="boton boton--primario"
                  onClick={() => setPicker(true)}
                >
                  Agregar widget
                </button>
              }
            />
          </div>
        ) : null}

        {picker ? (
          <AddWidgetModal
            catalogo={ORDEN_WIDGETS.map((tipo) => ({ tipo, ...WIDGETS[tipo] }))}
            onAgregar={layout.agregar}
            onCerrar={() => setPicker(false)}
          />
        ) : null}
      </div>

      <DragOverlay
        dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }}
      >
        {activo && layout.items.some((item) => item.id === activo.id) ? (
          <div className="widget-overlay" style={{ width: activo.ancho }}>
            {contenido(
              layout.items.find((item) => item.id === activo.id)!,
              layout.items.findIndex((item) => item.id === activo.id),
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
