import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { usePeriodo } from '../state/periodo.store.js';
import { useGastos, usePresupuestos, useResumen, useSerie } from '../hooks/datos.js';
import { aDDMMYYYY } from '../utils/periodo.js';
import { WIDGETS } from '../widgets/tipos.js';
import type { TipoWidget } from '../widgets/tipos.js';
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
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);

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

  const contenido = (tipo: TipoWidget, indice: number) => {
    const meta = WIDGETS[tipo];
    const acciones = (
      <WidgetAcciones
        indice={indice}
        total={layout.items.length}
        span={layout.items[indice]!.span}
        onIzquierda={() => layout.moverIzquierda(indice)}
        onDerecha={() => layout.moverDerecha(indice)}
        onRedimensionar={() => layout.redimensionar(indice)}
        onQuitar={() => layout.quitar(tipo)}
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

    switch (tipo) {
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
          <RecentExpenses
            gastos={ultimos.data?.data ?? []}
            acciones={acciones}
          />
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

  const soltar = (indiceDestino: number) => {
    if (arrastrando !== null && arrastrando !== indiceDestino) {
      layout.mover(arrastrando, indiceDestino);
    }
    setArrastrando(null);
    setDestino(null);
  };

  return (
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

      {layout.items.map((item, indice) => (
        <WidgetSlot
          key={item.tipo}
          item={item}
          indice={indice}
          arrastrando={arrastrando}
          destino={destino}
          onDragStart={setArrastrando}
          onDragOver={setDestino}
          onDrop={soltar}
          onDragEnd={() => {
            setArrastrando(null);
            setDestino(null);
          }}
        >
          {contenido(item.tipo, indice)}
        </WidgetSlot>
      ))}

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
          disponibles={layout.disponibles.map((tipo) => ({
            tipo,
            ...WIDGETS[tipo],
          }))}
          onAgregar={(tipo) => {
            layout.agregar(tipo);
            setPicker(false);
          }}
          onCerrar={() => setPicker(false)}
        />
      ) : null}
    </div>
  );
}
