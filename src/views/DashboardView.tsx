import { useState } from 'react';
import { useAuth } from '../state/auth.store.js';
import { usePeriodo } from '../state/periodo.store.js';
import { COLUMNAS, ORDEN_WIDGETS, WIDGETS } from '../widgets/tipos.js';
import type { ModoPeriodoWidget, WidgetLayoutItem } from '../widgets/tipos.js';
import { useDashboardLayout } from '../widgets/useDashboardLayout.js';
import { WidgetAcciones } from '../widgets/WidgetAcciones.js';
import { WidgetGrid } from '../widgets/WidgetGrid.js';
import {
  CategoriasWidgetPeriodo,
  EvolucionWidgetPeriodo,
  HistorialWidget,
  PresupuestosWidget,
  TotalWidgetPeriodo,
} from '../widgets/WidgetsDashboard.js';
import { AddWidgetModal } from '../components/AddWidgetModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { PeriodSelector } from '../components/PeriodSelector.js';
import { EmptyState } from '../components/EmptyState.js';

export function DashboardView() {
  const periodo = usePeriodo((estado) => estado.periodo);
  const usuarioId = useAuth((estado) => estado.usuario?.id ?? null);
  const layout = useDashboardLayout(usuarioId);

  const [picker, setPicker] = useState(false);
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [editando, setEditando] = useState(false);

  const contenido = (item: WidgetLayoutItem) => {
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

    const onCambiarPeriodo = (modo: ModoPeriodoWidget) =>
      layout.cambiarPeriodo(item.id, modo);

    switch (item.tipo) {
      case 'total':
        return (
          <TotalWidgetPeriodo
            item={item}
            periodoGlobal={periodo}
            onCambiarPeriodo={onCambiarPeriodo}
            acciones={acciones}
          />
        );

      case 'categorias':
        return (
          <CategoriasWidgetPeriodo
            item={item}
            periodoGlobal={periodo}
            onCambiarPeriodo={onCambiarPeriodo}
            acciones={acciones}
          />
        );

      case 'evolucion':
        return (
          <EvolucionWidgetPeriodo
            item={item}
            periodoGlobal={periodo}
            onCambiarPeriodo={onCambiarPeriodo}
            acciones={acciones}
          />
        );

      case 'presupuestos':
        return <PresupuestosWidget periodo={periodo} acciones={acciones} />;

      case 'historial':
        return <HistorialWidget periodo={periodo} acciones={acciones} />;

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
          mensaje="¿Seguro que querés volver al layout por defecto? Se perderán las posiciones, tamaños y períodos personalizados."
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
