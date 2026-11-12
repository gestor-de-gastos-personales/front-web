import { pedir } from './http.js';
import type { Categoria } from './gastos.service.js';

export const categoriasService = {
  listar: () => pedir<Categoria[]>('/categorias'),

  crear: (nombre: string) =>
    pedir<Categoria>('/categorias', { method: 'POST', body: { nombre } }),

  actualizar: (id: number, nombre: string) =>
    pedir<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: { nombre },
    }),

  eliminar: (id: number) =>
    pedir<void>(`/categorias/${id}`, { method: 'DELETE' }),
};
