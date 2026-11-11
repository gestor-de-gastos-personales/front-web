import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsync } from './useAsync.js';

describe('useAsync', () => {
  it('carga los datos al montar', async () => {
    const cargar = vi.fn().mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useAsync(cargar, []));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(result.current.error).toBeNull();
  });

  it('expone el error de la promesa', async () => {
    const cargar = vi.fn().mockRejectedValue(new Error('falló'));

    const { result } = renderHook(() => useAsync(cargar, []));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.error).toBe('falló');
    expect(result.current.data).toBeNull();
  });

  it('recargar vuelve a ejecutar', async () => {
    const cargar = vi.fn().mockResolvedValue(1);
    const { result } = renderHook(() => useAsync(cargar, []));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.recargar());

    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(2));
  });
});
