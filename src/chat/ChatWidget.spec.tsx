import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./ChatPanel.js', () => ({
  ChatPanel: ({ onCerrar }: { onCerrar?: () => void }) => (
    <div>
      <p>panel de prueba</p>
      {onCerrar ? (
        <button type="button" onClick={onCerrar}>
          Cerrar panel
        </button>
      ) : null}
    </div>
  ),
}));

import { ChatWidget } from './ChatWidget.js';

describe('ChatWidget', () => {
  it('abre y cierra el drawer con el botón flotante', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }));
    expect(screen.getByRole('dialog', { name: 'Asistente' })).toBeInTheDocument();
    expect(screen.getByText('panel de prueba')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Abrir asistente' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(
      screen.queryByRole('dialog', { name: 'Asistente' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Abrir asistente' }),
    ).toBeInTheDocument();
  });

  it('cierra al hacer clic en el fondo', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }));
    fireEvent.click(screen.getByRole('presentation'));
    expect(
      screen.queryByRole('dialog', { name: 'Asistente' }),
    ).not.toBeInTheDocument();
  });

  it('no muestra el botón en la ruta /asistente', () => {
    render(
      <MemoryRouter initialEntries={['/asistente']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: 'Abrir asistente' }),
    ).not.toBeInTheDocument();
  });
});
