import { pedir } from './http.js';

export interface Usuario {
  id: number;
  email: string | null;
  nombre: string | null;
  telegramId: string | null;
  createdAt: string;
}

export interface Credenciales {
  email: string;
  password: string;
}

export interface Registro extends Credenciales {
  nombre: string;
}

export const authService = {
  login: (credenciales: Credenciales) =>
    pedir<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: credenciales,
      auth: false,
    }),

  register: (datos: Registro) =>
    pedir<Usuario>('/auth/register', {
      method: 'POST',
      body: datos,
      auth: false,
    }),

  me: () => pedir<Usuario>('/auth/me'),
};
