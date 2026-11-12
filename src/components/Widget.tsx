import type { ReactNode } from 'react';

interface WidgetProps {
  titulo: string;
  tag?: string;
  acento?: 'mango' | 'coral' | 'leaf' | 'blue';
  className?: string;
  acciones?: ReactNode;
  children: ReactNode;
}

/** Tarjeta de datos con título, etiqueta y acciones opcionales. */
export function Widget({
  titulo,
  tag,
  acento = 'mango',
  className = '',
  acciones,
  children,
}: WidgetProps) {
  const claseTag = acento === 'mango' ? 'widget__tag' : `widget__tag widget__tag--${acento}`;

  return (
    <section className={`widget ${className}`.trim()} aria-label={titulo}>
      <header className="widget__head">
        <h2 className="widget__title">{titulo}</h2>
        <div className="widget__aside">
          {tag ? <span className={claseTag}>{tag}</span> : null}
          {acciones}
        </div>
      </header>
      {children}
    </section>
  );
}
