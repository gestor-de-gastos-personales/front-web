import type { ReactNode } from 'react';

interface PageHeaderProps {
  titulo: string;
  acciones?: ReactNode;
}

/** Cabecera común de las pantallas: título grande y acciones a la derecha. */
export function PageHeader({ titulo, acciones }: PageHeaderProps) {
  return (
    <header className="page-head span-12">
      <h1 className="page-title">{titulo}</h1>
      {acciones ? (
        <div className="page-head__acciones">{acciones}</div>
      ) : null}
    </header>
  );
}
