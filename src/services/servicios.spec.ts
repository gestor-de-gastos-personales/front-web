import { afterEach, describe, expect, it, vi } from 'vitest';
import { gastosService } from './gastos.service.js';
import { authService } from './auth.service.js';
import { categoriasService } from './categorias.service.js';
import { resumenService } from './resumen.service.js';
import { serieService } from './serie.service.js';
import { presupuestosService } from './presupuestos.service.js';

function respuesta(cuerpo: unknown, status = 200) {
  return { ok: true, status, json: async () => cuerpo } as Response;
}

describe('servicios', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('gastos: lista con filtros y crea/edita/elimina', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ data: [], meta: {} }));
    vi.stubGlobal('fetch', fetchMock);

    await gastosService.listar({
      page: 2,
      fechaInicio: '01-11-2026',
      montoMin: 100,
      montoMax: 500,
    });
    await gastosService.crear({ descripcion: 'Coto', valor: 10, fecha: '2026-11-01', categoria: 1 });
    await gastosService.actualizar(3, { valor: 20 });
    await gastosService.eliminar(3);

    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls[0]).toContain(
      '/gastos?page=2&fechaInicio=01-11-2026&montoMin=100&montoMax=500',
    );
    expect(urls[1]).toContain('/gastos');
    expect(urls[2]).toContain('/gastos/3');
    expect(urls[3]).toContain('/gastos/3');
  });

  it('auth: login, registro y perfil', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ access_token: 't' }));
    vi.stubGlobal('fetch', fetchMock);

    await authService.login({ email: 'a@b.com', password: 'x' });
    await authService.register({ email: 'a@b.com', password: 'x', nombre: 'A' });
    await authService.me();

    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toEqual([
      'http://localhost:3000/auth/login',
      'http://localhost:3000/auth/register',
      'http://localhost:3000/auth/me',
    ]);
  });

  it('categorías: CRUD', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta([]));
    vi.stubGlobal('fetch', fetchMock);

    await categoriasService.listar();
    await categoriasService.crear('Mascotas');
    await categoriasService.actualizar(2, 'Pets');
    await categoriasService.eliminar(2);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('resumen, serie y presupuestos usan sus rutas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({}));
    vi.stubGlobal('fetch', fetchMock);

    await resumenService.obtener('2026-11-01', '2026-11-30');
    await serieService.obtener('2026-11-01', '2026-11-30', 'dia');
    await presupuestosService.listar(11, 2026);
    await presupuestosService.guardar({ categoriaId: 1, monto: 100, mes: 11, anio: 2026 });

    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls[0]).toContain('/gastos/resumen?desde=2026-11-01&hasta=2026-11-30');
    expect(urls[1]).toContain('/gastos/serie?desde=2026-11-01&hasta=2026-11-30&agrupacion=dia');
    expect(urls[2]).toContain('/presupuestos/mios?mes=11&anio=2026');
    expect(urls[3]).toContain('/presupuestos/mios');
  });
});
