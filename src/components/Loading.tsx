export function Loading({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <p className="estado" role="status">
      {texto}
    </p>
  );
}
