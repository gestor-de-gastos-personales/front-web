import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), me: vi.fn() }));
vi.mock('./services/auth.service.js', () => ({ authService: mocks }));

import { App } from './App.js';
import { useAuth } from './state/auth.store.js';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuth.setState({ token: null, usuario: null, cargando: false, error: null });
    window.history.pushState({}, '', '/');
  });

  it('sin sesión muestra el login', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });
});
