import { describe, expect, it, vi } from 'vitest';

const pedir = vi.hoisted(() => vi.fn());
vi.mock('../services/http.js', () => ({ pedir }));

import { chatService } from './chatApi.js';

describe('chatService', () => {
  it('analiza texto', async () => {
    pedir.mockResolvedValue({ intent: 'CREATE_EXPENSE' });
    await expect(chatService.analizar('gasté 100')).resolves.toEqual({
      intent: 'CREATE_EXPENSE',
    });
    expect(pedir).toHaveBeenCalledWith('/chat/analizar', {
      method: 'POST',
      body: { texto: 'gasté 100' },
    });
  });

  it('analiza una imagen como FormData', async () => {
    pedir.mockResolvedValue({ intent: 'CREATE_EXPENSE' });
    const archivo = new File(['x'], 'ticket.png', { type: 'image/png' });

    await chatService.analizarImagen(archivo);

    const [, opciones] = pedir.mock.calls[0] as [string, { body: FormData }];
    expect(pedir).toHaveBeenCalledWith(
      '/chat/analizar-imagen',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(opciones.body).toBeInstanceOf(FormData);
    expect(opciones.body.get('file')).toBe(archivo);
  });

  it('crea una regla recurrente', async () => {
    pedir.mockResolvedValue({ id: 1 });
    const datos = {
      monto: 1000,
      descripcion: 'Spotify',
      categoriaId: 1,
      frecuencia: 'MENSUAL' as const,
      comercio: 'Spotify',
    };

    await chatService.crearRecurrente(datos);
    expect(pedir).toHaveBeenCalledWith('/gastos/recurrentes/mios', {
      method: 'POST',
      body: datos,
    });
  });
});
