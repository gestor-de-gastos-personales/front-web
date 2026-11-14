/** Encabezado del dashboard con las acciones de edición del tablero. */
export function DashboardHeader({
  editando,
  onEditar,
  onListo,
  onRestablecer,
  onAgregar,
}: {
  editando: boolean;
  onEditar: () => void;
  onListo: () => void;
  onRestablecer: () => void;
  onAgregar: () => void;
}) {
  return (
    <header className="page-head">
      <div className="dashboard-head__left">
        <h1 className="page-title">Dashboard</h1>
        {editando ? (
          <button
            type="button"
            className="boton boton--fantasma boton--chico"
            onClick={onRestablecer}
          >
            Restablecer
          </button>
        ) : null}
      </div>

      <div className="dashboard-tools">
        {editando ? (
          <>
            <span className="dashboard-tools__hint">
              Arrastrá desde el encabezado para mover; redimensioná desde la esquina.
            </span>
            <button
              type="button"
              className="boton boton--chico"
              onClick={onAgregar}
            >
              Agregar widget
            </button>
            <button
              type="button"
              className="boton boton--primario boton--chico"
              onClick={onListo}
            >
              Listo
            </button>
          </>
        ) : (
          <button
            type="button"
            className="boton boton--chico"
            onClick={onEditar}
          >
            Editar
          </button>
        )}
      </div>
    </header>
  );
}
