import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../chat/ChatPanel.js', () => ({
  ChatPanel: ({ modo }: { modo: string }) => (
    <div data-testid="chat-panel">panel {modo}</div>
  ),
}));

import { AsistenteView } from './AsistenteView.js';

describe('AsistenteView', () => {
  it('muestra el título y el panel del asistente', () => {
    render(
      <MemoryRouter>
        <AsistenteView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Asistente' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toHaveTextContent('panel pagina');
  });
});
