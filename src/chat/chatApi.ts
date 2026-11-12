import { pedir } from '../services/http.js';
import type { AnalisisIA, Frecuencia } from './tipos.js';

export const chatService = {
  analizar: (texto: string) =>
    pedir<AnalisisIA>('/chat/analizar', {
      method: 'POST',
      body: { texto },
    }),

  analizarImagen: (archivo: File) => {
    const datos = new FormData();
    datos.append('file', archivo);
    return pedir<AnalisisIA>('/chat/analizar-imagen', {
      method: 'POST',
      body: datos,
    });
  },

  crearRecurrente: (datos: {
    monto: number;
    descripcion: string;
    categoriaId?: number;
    frecuencia: Frecuencia;
    comercio?: string;
  }) =>
    pedir<{ id: number }>('/gastos/recurrentes/mios', {
      method: 'POST',
      body: datos,
    }),
};
