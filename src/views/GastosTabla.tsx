import type { Gasto, PaginaGastos } from '../services/gastos.service.js';
import { HistoryTable } from '../components/HistoryTable.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { Widget } from '../components/Widget.js';

/** Tabla paginada del historial, con estados de carga y error. */
export function GastosTabla({
  cargando,
  error,
  pagina,
  onReintentar,
  onEditar,
  onEliminar,
  onPagina,
}: {
  cargando: boolean;
  error: string | null;
  pagina?: PaginaGastos | null;
  onReintentar: () => void;
  onEditar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
  onPagina: (pagina: number) => void;
}) {
  if (cargando) {
    return (
      <Widget titulo="Historial" className="span-12">
        <Loading />
      </Widget>
    );
  }

  if (error) {
    return (
      <div className="span-12">
        <ErrorState mensaje={error} onReintentar={onReintentar} />
      </div>
    );
  }

  if (!pagina) return null;

  return (
    <div className="span-12">
      <HistoryTable
        pagina={pagina}
        onEditar={onEditar}
        onEliminar={onEliminar}
        onPagina={onPagina}
      />
    </div>
  );
}
