import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from './auth.store.js';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../services/http.js';

vi.mock('../services/auth.service.js', () => ({
  authService: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

const loginMock = vi.mocked(authService.login);
const registerMock = vi.mocked(authService.register);
const meMock = vi.mocked(authService.me);

const USUARIO = {
  id: 1,
  email: 'ana@mail.com',
  nombre: 'Ana',
  telegramId: null,
  createdAt: '2026-11-01T00:00:00Z',
};

describe('auth.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuth.setState({ token: null, usuario: null, cargando: false, error: null });
  });

  it('login guarda el token y el perfil', async () => {
    loginMock.mockResolvedValue({ access_token: 'jwt' });
    meMock.mockResolvedValue(USUARIO);

    await useAuth.getState().login({ email: 'ana@mail.com', password: 'x' });

    expect(localStorage.getItem('mangos.token')).toBe('jwt');
    expect(useAuth.getState()).toMatchObject({ token: 'jwt', usuario: USUARIO, cargando: false });
  });

  it('login deja el error visible y relanza', async () => {
    loginMock.mockRejectedValue(new Error('Credenciales inválidas'));

    await expect(
      useAuth.getState().login({ email: 'ana@mail.com', password: 'x' }),
    ).rejects.toThrow('Credenciales inválidas');
    expect(useAuth.getState().error).toBe('Credenciales inválidas');
    expect(useAuth.getState().token).toBeNull();
  });

  it('registrar crea la cuenta y deja la sesión iniciada', async () => {
    registerMock.mockResolvedValue(USUARIO);
    loginMock.mockResolvedValue({ access_token: 'jwt2' });
    meMock.mockResolvedValue(USUARIO);

    await useAuth.getState().registrar({
      email: 'ana@mail.com',
      password: 'x',
      nombre: 'Ana',
    });

    expect(registerMock).toHaveBeenCalled();
    expect(useAuth.getState().token).toBe('jwt2');
  });

  it('cargarPerfil con 401 cierra la sesión', async () => {
    useAuth.setState({ token: 'viejo' });
    meMock.mockRejectedValue(new ApiError('no autorizado', 401));

    await useAuth.getState().cargarPerfil();

    expect(useAuth.getState().token).toBeNull();
  });

  it('cargarPerfil sin token solo apaga la carga', async () => {
    await useAuth.getState().cargarPerfil();
    expect(useAuth.getState().cargando).toBe(false);
  });

  it('cargarPerfil guarda el usuario', async () => {
    useAuth.setState({ token: 'jwt' });
    meMock.mockResolvedValue(USUARIO);

    await useAuth.getState().cargarPerfil();

    expect(useAuth.getState().usuario).toEqual(USUARIO);
  });

  it('salir limpia token, usuario y storage', () => {
    useAuth.setState({ token: 'jwt', usuario: USUARIO });
    localStorage.setItem('mangos.token', 'jwt');

    useAuth.getState().salir();

    expect(useAuth.getState().token).toBeNull();
    expect(localStorage.getItem('mangos.token')).toBeNull();
  });

  it('limpiarError borra el error', () => {
    useAuth.setState({ error: 'x' });
    useAuth.getState().limpiarError();
    expect(useAuth.getState().error).toBeNull();
  });
});
