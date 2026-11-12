import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), me: vi.fn() }));
vi.mock('../services/auth.service.js', () => ({ authService: mocks }));

import { useAuth } from '../state/auth.store.js';
import { LoginView } from './LoginView.js';
import { RegisterView } from './RegisterView.js';
import { PerfilView } from './PerfilView.js';
import { NotFoundView } from './NotFoundView.js';
import { Layout } from '../components/Layout.js';
import { RutaProtegida } from '../components/RutaProtegida.js';

const USUARIO = {
  id: 1,
  email: 'ana@mail.com',
  nombre: 'Ana',
  telegramId: '777',
  createdAt: '2026-11-01T00:00:00Z',
};

function renderRuta(elemento: React.ReactElement, ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path={ruta} element={elemento} />
        <Route path="/" element={<p>home</p>} />
        <Route path="/login" element={<p>login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('vistas de autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuth.setState({ token: null, usuario: null, cargando: false, error: null });
  });

  it('LoginView inicia sesión y navega', async () => {
    mocks.login.mockResolvedValue({ access_token: 'jwt' });
    mocks.me.mockResolvedValue(USUARIO);
    renderRuta(<LoginView />, '/login');

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mail.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument());
    expect(mocks.login).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'secreto' });
  });

  it('LoginView muestra el error del backend', async () => {
    mocks.login.mockRejectedValue(new Error('Credenciales inválidas'));
    renderRuta(<LoginView />, '/login');

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mail.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });

  it('RegisterView crea la cuenta y navega', async () => {
    mocks.register.mockResolvedValue(USUARIO);
    mocks.login.mockResolvedValue({ access_token: 'jwt' });
    mocks.me.mockResolvedValue(USUARIO);
    renderRuta(<RegisterView />, '/register');

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mail.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument());
    expect(mocks.register).toHaveBeenCalled();
  });

  it('PerfilView muestra los datos y cierra sesión', async () => {
    useAuth.setState({ token: 'jwt', usuario: USUARIO });
    renderRuta(<PerfilView />, '/perfil');

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('ana@mail.com')).toBeInTheDocument();
    expect(screen.getByText('777')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(screen.getByText('login')).toBeInTheDocument());
    expect(useAuth.getState().token).toBeNull();
  });

  it('NotFoundView muestra 404 y vuelve al dashboard', () => {
    renderRuta(<NotFoundView />, '/otra');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toBeInTheDocument();
  });
});

describe('guardas y layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuth.setState({ token: null, usuario: null, cargando: false, error: null });
  });

  it('RutaProtegida redirige sin token', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<p>privado</p>} />
          </Route>
          <Route path="/login" element={<p>login</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('RutaProtegida muestra el hijo con token', () => {
    useAuth.setState({ token: 'jwt' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<p>privado</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('privado')).toBeInTheDocument();
  });

  it('Layout muestra navegación y permite salir', async () => {
    useAuth.setState({ token: 'jwt', usuario: USUARIO });
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>contenido</p>} />
          </Route>
          <Route path="/login" element={<p>login</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('mangos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gastos' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    await waitFor(() => expect(screen.getByText('login')).toBeInTheDocument());
  });
});
