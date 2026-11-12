import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { usePeriodo } from '../state/periodo.store.js';
import { useGastos, usePresupuestos, useResumen, useSerie } from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { COLUMNAS, ORDEN_WIDGETS, WIDGETS } from '../widgets/tipos.js';
import type { WidgetLayoutItem } from '../widgets/tipos.js';
import { useDashboardLayout } from '../widgets/useDashboardLayout.js';
import { WidgetAcciones } from '../widgets/WidgetAcciones.js';
import { WidgetGrid } from '../widgets/WidgetGrid.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
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
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [editando, setEditando] = useState(false);

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

  const contenido = (item: WidgetLayoutItem) => {
    const meta = WIDGETS[item.tipo];
    const indice = layout.items.findIndex((otro) => otro.id === item.id);

    const acciones = editando ? (
      <WidgetAcciones
        puedeIzquierda={item.x > 0}
        puedeDerecha={item.x + item.w < COLUMNAS}
        onIzquierda={() => layout.moverIzquierda(indice)}
        onDerecha={() => layout.moverDerecha(indice)}
        onQuitar={() => layout.quitar(item.id)}
      />
    ) : undefined;

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
    <div className="dashboard">
      <div className="grid">
        <PeriodSelector />

        <div className="dashboard-tools span-12">
          {editando ? (
            <>
              <button
                type="button"
                className="boton boton--fantasma boton--chico"
                onClick={() => setConfirmarReset(true)}
              >
                Restablecer
              </button>
              <span className="dashboard-tools__hint">
                Arrastrá desde el encabezado para mover; redimensioná desde la esquina.
              </span>
              <button
                type="button"
                className="boton boton--chico"
                onClick={() => setPicker(true)}
              >
                Agregar widget
              </button>
              <button
                type="button"
                className="boton boton--primario boton--chico"
                onClick={() => setEditando(false)}
              >
                Listo
              </button>
            </>
          ) : (
            <button
              type="button"
              className="boton boton--chico"
              onClick={() => setEditando(true)}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <WidgetGrid
        items={layout.items}
        editable={editando}
        onCambio={layout.actualizarDesdeGrilla}
        renderWidget={contenido}
      />

      {layout.items.length === 0 ? (
        <div className="grid">
          <div className="span-12">
            <EmptyState
              titulo="Tu tablero está vacío"
              detalle="Agregá los widgets que quieras ver."
              accion={
                <button
                  type="button"
                  className="boton boton--primario"
                  onClick={() => {
                    setEditando(true);
                    setPicker(true);
                  }}
                >
                  Agregar widget
                </button>
              }
            />
          </div>
        </div>
      ) : null}

      {picker ? (
        <AddWidgetModal
          catalogo={ORDEN_WIDGETS.map((tipo) => ({ tipo, ...WIDGETS[tipo] }))}
          onAgregar={layout.agregar}
          onCerrar={() => setPicker(false)}
        />
      ) : null}

      {confirmarReset ? (
        <ConfirmModal
          titulo="Restablecer tablero"
          mensaje="¿Seguro que querés volver al layout por defecto? Se perderán las posiciones y tamaños personalizados."
          textoConfirmar="Restablecer"
          onConfirmar={() => {
            layout.resetear();
            setConfirmarReset(false);
          }}
          onCancelar={() => setConfirmarReset(false)}
        />
      ) : null}
    </div>
  );
}
