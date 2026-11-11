interface ErrorStateProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function ErrorState({ mensaje, onReintentar }: ErrorStateProps) {
  return (
    <div className="estado estado--error" role="alert">
      <strong>No se pudo cargar</strong>
      <p>{mensaje}</p>
      {onReintentar ? (
        <button type="button" className="boton boton--chico" onClick={onReintentar}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
