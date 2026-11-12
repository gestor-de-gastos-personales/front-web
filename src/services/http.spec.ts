import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, pedir, setToken } from './http.js';

function respuesta(cuerpo: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as Response;
}

describe('http', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setToken(null);
  });

  it('adjunta el token y los parámetros de la query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('abc');

    await pedir('/gastos', { params: { page: 2, vacio: undefined, texto: '' } });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('http://localhost:3000/gastos?page=2');
    expect(init.headers.Authorization).toBe('Bearer abc');
  });

  it('envía JSON en POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await pedir('/gastos', { method: 'POST', body: { monto: 10 } });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"monto":10}');
  });

  it('convierte un error de Nest en ApiError con status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuesta({ message: ['campo a', 'campo b'] }, 400),
      ),
    );

    await expect(pedir('/gastos')).rejects.toMatchObject({
      message: 'campo a, campo b',
      status: 400,
    });
  });

  it('usa el status si el cuerpo no es JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('sin json');
        },
      } as unknown as Response),
    );

    await expect(pedir('/gastos')).rejects.toBeInstanceOf(ApiError);
  });

  it('devuelve undefined en 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) } as Response),
    );

    await expect(pedir('/gastos/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});
