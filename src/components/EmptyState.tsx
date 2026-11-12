import type { ReactNode } from 'react';

interface EmptyStateProps {
  titulo: string;
  detalle?: string;
  accion?: ReactNode;
}

export function EmptyState({ titulo, detalle, accion }: EmptyStateProps) {
  return (
    <div className="estado estado--vacio">
      <strong>{titulo}</strong>
      {detalle ? <p className="muted">{detalle}</p> : null}
      {accion ? <div style={{ marginTop: 12 }}>{accion}</div> : null}
    </div>
  );
}
