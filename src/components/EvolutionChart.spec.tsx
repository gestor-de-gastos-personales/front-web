import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvolutionChart } from './EvolutionChart.js';

const PUNTOS = [
  { clave: '2026-11-01', etiqueta: '01/11', total: 1500 },
  { clave: '2026-11-02', etiqueta: '02/11', total: 0 },
  { clave: '2026-11-03', etiqueta: '03/11', total: 500 },
];

describe('EvolutionChart', () => {
  it('dibuja el SVG con una barra por punto y colores distintos', () => {
    const { container } = render(<EvolutionChart puntos={PUNTOS} agrupacion="dia" />);
    expect(screen.getByRole('img', { name: /Evolución de gastos/ })).toBeInTheDocument();
    expect(screen.getByText(/Total del período/)).toBeInTheDocument();
    expect(screen.getByText('por día')).toBeInTheDocument();

    const barras = Array.from(container.querySelectorAll('.grafico__barra'));
    expect(barras).toHaveLength(3);
    expect(new Set(barras.map((barra) => barra.getAttribute('fill'))).size).toBe(3);
  });

  it('muestra vacío si no hay puntos', () => {
    render(<EvolutionChart puntos={[]} agrupacion="mes" />);
    expect(screen.getByText(/Sin gastos en el período/)).toBeInTheDocument();
  });

  it('muestra vacío si el total es cero', () => {
    render(
      <EvolutionChart
        puntos={[{ clave: '2026-11', etiqueta: '11/2026', total: 0 }]}
        agrupacion="mes"
      />,
    );
    expect(screen.getByText(/Sin gastos en el período/)).toBeInTheDocument();
  });
});
