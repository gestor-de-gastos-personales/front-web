import { create } from 'zustand';
import { authService } from '../services/auth.service.js';
import type { Credenciales, Registro, Usuario } from '../services/auth.service.js';
import { ApiError, setToken } from '../services/http.js';
import { mensajeDeError } from '../utils/format.js';

const TOKEN_KEY = 'mangos.token';

const tokenInicial =
  typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);

setToken(tokenInicial);

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  login: (credenciales: Credenciales) => Promise<void>;
  registrar: (datos: Registro) => Promise<void>;
  cargarPerfil: () => Promise<void>;
  salir: () => void;
  limpiarError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: tokenInicial,
  usuario: null,
  cargando: Boolean(tokenInicial),
  error: null,

  login: async (credenciales) => {
    set({ cargando: true, error: null });
    try {
      const { access_token } = await authService.login(credenciales);
      setToken(access_token);
      localStorage.setItem(TOKEN_KEY, access_token);
      const usuario = await authService.me();
      set({ token: access_token, usuario, cargando: false });
    } catch (error) {
      set({ cargando: false, error: mensajeDeError(error) });
      throw error;
    }
  },

  registrar: async (datos) => {
    set({ cargando: true, error: null });
    try {
      await authService.register(datos);
      const { access_token } = await authService.login({
        email: datos.email,
        password: datos.password,
      });
      setToken(access_token);
      localStorage.setItem(TOKEN_KEY, access_token);
      const usuario = await authService.me();
      set({ token: access_token, usuario, cargando: false });
    } catch (error) {
      set({ cargando: false, error: mensajeDeError(error) });
      throw error;
    }
  },

  cargarPerfil: async () => {
    const token = get().token;
    if (!token) {
      set({ cargando: false });
      return;
    }

    try {
      const usuario = await authService.me();
      set({ usuario, cargando: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        get().salir();
        return;
      }
      set({ cargando: false, error: mensajeDeError(error) });
    }
  },

  salir: () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, usuario: null, cargando: false, error: null });
  },

  limpiarError: () => set({ error: null }),
}));
