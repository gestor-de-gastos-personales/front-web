import type { ReactNode } from 'react';

interface WidgetProps {
  titulo: string;
  tag?: string;
  acento?: 'mango' | 'coral' | 'leaf' | 'blue';
  className?: string;
  children: ReactNode;
}

/** Recibo: tarjeta con borde duro, sombra offset y perforación superior. */
export function Widget({
  titulo,
  tag,
  acento = 'mango',
  className = 'span-4',
  children,
}: WidgetProps) {
  const claseTag = acento === 'mango' ? 'widget__tag' : `widget__tag widget__tag--${acento}`;

  return (
    <section className={`widget ${className}`} aria-label={titulo}>
      <header className="widget__head">
        <h2 className="widget__title">{titulo}</h2>
        {tag ? <span className={claseTag}>{tag}</span> : null}
      </header>
      {children}
    </section>
  );
}
