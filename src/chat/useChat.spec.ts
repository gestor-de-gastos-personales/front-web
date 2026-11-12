import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnalisisIA } from './tipos.js';

const mocks = vi.hoisted(() => ({
  categoriasData: [{ id: 1, nombre: 'Alimentación' }],
  recargar: vi.fn(),
  categorias: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
  gastos: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
  resumen: { obtener: vi.fn() },
  serie: { obtener: vi.fn() },
  chat: {
    analizar: vi.fn(),
    analizarImagen: vi.fn(),
    crearRecurrente: vi.fn(),
  },
}));

vi.mock('../services/gastos.service.js', () => ({ gastosService: mocks.gastos }));
vi.mock('../services/categorias.service.js', () => ({
  categoriasService: mocks.categorias,
}));
vi.mock('../services/resumen.service.js', () => ({ resumenService: mocks.resumen }));
vi.mock('../services/serie.service.js', () => ({ serieService: mocks.serie }));
vi.mock('./chatApi.js', () => ({ chatService: mocks.chat }));
vi.mock('../hooks/useAsync.js', () => ({
  useAsync: () => ({
    data: mocks.categoriasData,
    cargando: false,
    error: null,
    recargar: mocks.recargar,
  }),
}));

import { useChat } from './useChat.js';
import type { Gasto } from '../services/gastos.service.js';

const GASTO: Gasto = {
  id: 1,
  descripcion: 'Coto',
  monto: 100,
  fecha: '2026-11-01T00:00:00.000Z',
  categoriaId: 1,
  categoria: { id: 1, nombre: 'Alimentación' },
};

const PAGINA = {
  data: [GASTO],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

const RESUMEN = {
  periodo: {
    mes: 11,
    anio: 2026,
    rango: null,
    fechaInicio: '2026-11-01T00:00:00.000Z',
    fechaFin: '2026-11-30T23:59:59.999Z',
  },
  totalGeneral: 100,
  porCategoria: [
    { categoriaId: 1, categoriaNombre: 'Alimentación', total: 100, porcentaje: 100 },
  ],
  mayorGasto: null,
  cantidad: 1,
};

const SERIE = {
  desde: '2026-11-01',
  hasta: '2026-11-30',
  agrupacion: 'dia' as const,
  puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 100 }],
  totalGeneral: 100,
};

const DATOS = {
  descripcion: 'Coto',
  valor: 100,
  fecha: '2026-11-01',
  categoria: 1,
};

function analisis(overrides: Partial<AnalisisIA> = {}): AnalisisIA {
  return {
    intent: 'CREATE_EXPENSE',
    monto: 100,
    comercio: 'Coto',
    categoria: 'Alimentación',
    descripcion: null,
    fecha: null,
    rango: null,
    recurringHint: null,
    searchHint: null,
    campos: null,
    ...overrides,
  };
}

function borrador(mensajes: ReturnType<typeof useChat>['mensajes']) {
  return mensajes.find((mensaje) => mensaje.tipo === 'borrador');
}

describe('useChat', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.gastos.listar.mockResolvedValue(PAGINA);
    mocks.gastos.crear.mockResolvedValue(GASTO);
    mocks.gastos.actualizar.mockResolvedValue(GASTO);
    mocks.gastos.eliminar.mockResolvedValue(undefined);
    mocks.categorias.crear.mockResolvedValue({ id: 2, nombre: 'Mascotas' });
    mocks.resumen.obtener.mockResolvedValue(RESUMEN);
    mocks.serie.obtener.mockResolvedValue(SERIE);
    mocks.chat.analizar.mockResolvedValue(analisis());
    mocks.chat.analizarImagen.mockResolvedValue(analisis());
    mocks.chat.crearRecurrente.mockResolvedValue({ id: 1 });
  });

  it('arranca con bienvenida y categorías', () => {
    const { result } = renderHook(() => useChat(1));

    expect(result.current.mensajes).toHaveLength(1);
    expect(result.current.mensajes[0]).toMatchObject({ tipo: 'texto' });
    expect(result.current.categorias).toEqual(mocks.categoriasData);
    expect(result.current.periodo).toBeTruthy();
  });

  it('crea un gasto desde texto y lo confirma', async () => {
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('gasté 100 en Coto');
    });

    expect(mocks.chat.analizar).toHaveBeenCalledWith('gasté 100 en Coto');
    const draft = borrador(result.current.mensajes);
    expect(draft).toMatchObject({ tipo: 'borrador', modo: 'crear' });

    await act(async () => {
      await result.current.confirmarBorrador(
        draft!.id,
        DATOS,
        { recurrente: false, frecuencia: 'MENSUAL' },
      );
    });

    expect(mocks.gastos.crear).toHaveBeenCalledWith(DATOS);
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('Guardé el gasto'),
      ),
    ).toBe(true);
  });

  it('crea un gasto recurrente cuando se lo piden', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ recurringHint: 'suscripción', intent: 'SET_RECURRING' }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('Spotify todos los meses');
    });
    const draft = borrador(result.current.mensajes)!;

    await act(async () => {
      await result.current.confirmarBorrador(
        draft.id,
        DATOS,
        { recurrente: true, frecuencia: 'MENSUAL' },
      );
    });

    expect(mocks.gastos.crear).toHaveBeenCalled();
    expect(mocks.chat.crearRecurrente).toHaveBeenCalledWith({
      monto: 100,
      descripcion: 'Coto',
      categoriaId: 1,
      frecuencia: 'MENSUAL',
      comercio: 'Coto',
    });
  });

  it('analiza imágenes y valida tipo y tamaño', async () => {
    const { result } = renderHook(() => useChat(1));
    const archivo = new File(['x'], 'ticket.png', { type: 'image/png' });

    await act(async () => {
      await result.current.enviarImagen(archivo);
    });

    expect(mocks.chat.analizarImagen).toHaveBeenCalledWith(archivo);
    expect(
      result.current.mensajes.some((mensaje) => mensaje.tipo === 'imagen'),
    ).toBe(true);
    expect(borrador(result.current.mensajes)).toBeTruthy();

    mocks.chat.analizarImagen.mockClear();
    await act(async () => {
      await result.current.enviarImagen(
        new File(['x'], 'nota.txt', { type: 'text/plain' }),
      );
    });
    expect(mocks.chat.analizarImagen).not.toHaveBeenCalled();
    expect(
      result.current.mensajes.some(
        (mensaje) =>
          mensaje.tipo === 'texto' && mensaje.texto.includes('tiene que ser una imagen'),
      ),
    ).toBe(true);

    const grande = new File(['x'], 'grande.png', { type: 'image/png' });
    Object.defineProperty(grande, 'size', { value: 11 * 1024 * 1024 });
    await act(async () => {
      await result.current.enviarImagen(grande);
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('10 MB'),
      ),
    ).toBe(true);
  });

  it('pide resumen, historial y gráfico', async () => {
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.pedirResumen();
    });
    expect(mocks.resumen.obtener).toHaveBeenCalled();
    expect(
      result.current.mensajes.some((mensaje) => mensaje.tipo === 'resumen'),
    ).toBe(true);

    await act(async () => {
      await result.current.pedirHistorial(1);
    });
    const historial = result.current.mensajes.find(
      (mensaje) => mensaje.tipo === 'historial',
    );
    expect(historial).toBeTruthy();

    await act(async () => {
      await result.current.cargarHistorial(
        historial!.id,
        2,
        result.current.periodo,
      );
    });
    expect(mocks.gastos.listar).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );

    await act(async () => {
      await result.current.pedirGrafico();
    });
    expect(mocks.serie.obtener).toHaveBeenCalled();
    expect(
      result.current.mensajes.some((mensaje) => mensaje.tipo === 'grafico'),
    ).toBe(true);
  });

  it('resuelve el resumen pedido por la IA con su rango', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'GET_SUMMARY', rango: 'WEEK' }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('resumen de la semana');
    });

    expect(mocks.resumen.obtener).toHaveBeenCalled();
    expect(
      result.current.mensajes.some((mensaje) => mensaje.tipo === 'resumen'),
    ).toBe(true);
  });

  it('elimina un gasto con confirmación', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'DELETE_EXPENSE', searchHint: 'coto', monto: null }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('eliminá el gasto Coto');
    });
    const candidatos = result.current.mensajes.find(
      (mensaje) => mensaje.tipo === 'candidatos',
    );
    expect(candidatos).toBeTruthy();

    await act(async () => {
      await result.current.confirmarEliminar(candidatos!.id, GASTO);
    });
    expect(mocks.gastos.eliminar).toHaveBeenCalledWith(1);
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('Eliminé el gasto'),
      ),
    ).toBe(true);
  });

  it('avisa cuando no encuentra candidatos', async () => {
    mocks.gastos.listar.mockResolvedValue({ ...PAGINA, data: [] });
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'DELETE_EXPENSE', searchHint: 'inexistente' }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('eliminá algo');
    });

    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('No encontré'),
      ),
    ).toBe(true);
  });

  it('edita un gasto encontrado', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'EDIT_EXPENSE', comercio: 'Coto', monto: null }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('editá el gasto Coto');
    });
    const draft = borrador(result.current.mensajes)!;
    expect(draft).toMatchObject({ tipo: 'borrador', modo: 'editar' });

    await act(async () => {
      await result.current.confirmarBorrador(
        draft.id,
        DATOS,
        { recurrente: false, frecuencia: 'MENSUAL' },
        GASTO,
      );
    });

    expect(mocks.gastos.actualizar).toHaveBeenCalledWith(1, DATOS);
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('actualicé'),
      ),
    ).toBe(true);
  });

  it('muestra candidatos para editar y permite elegir', async () => {
    mocks.gastos.listar.mockResolvedValue({
      ...PAGINA,
      data: [GASTO, { ...GASTO, id: 2, descripcion: 'Coto 2' }],
    });
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'EDIT_EXPENSE', comercio: 'Coto', monto: null }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('editá el gasto Coto');
    });
    const candidatos = result.current.mensajes.find(
      (mensaje) => mensaje.tipo === 'candidatos',
    );
    expect(candidatos).toBeTruthy();

    act(() => result.current.editarCandidato(candidatos!.id, GASTO));
    expect(borrador(result.current.mensajes)).toMatchObject({ modo: 'editar' });
  });

  it('muestra un gasto puntual', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'SHOW_EXPENSE', comercio: 'Coto', monto: null }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('mostrame el gasto Coto');
    });

    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('Encontré este gasto'),
      ),
    ).toBe(true);
  });

  it('crea una categoría o pide el nombre', async () => {
    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'CREATE_CATEGORY', categoria: 'Mascotas' }),
    );
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('crear categoría Mascotas');
    });
    const categoria = result.current.mensajes.find(
      (mensaje) => mensaje.tipo === 'categoria',
    );
    expect(categoria).toMatchObject({ nombre: 'Mascotas' });

    await act(async () => {
      await result.current.crearCategoria(categoria!.id, 'Mascotas');
    });
    expect(mocks.categorias.crear).toHaveBeenCalledWith('Mascotas');
    expect(mocks.recargar).toHaveBeenCalled();

    mocks.chat.analizar.mockResolvedValue(
      analisis({ intent: 'CREATE_CATEGORY', categoria: null, comercio: null, descripcion: null, query: null }),
    );
    await act(async () => {
      await result.current.enviarTexto('quiero crear una categoría');
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('¿Cómo querés llamar'),
      ),
    ).toBe(true);
  });

  it('responde ayuda ante una intención desconocida', async () => {
    mocks.chat.analizar.mockResolvedValue(analisis({ intent: 'UNKNOWN' }));
    const { result } = renderHook(() => useChat(1));

    await act(async () => {
      await result.current.enviarTexto('hola');
    });

    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('No entendí'),
      ),
    ).toBe(true);
  });

  it('agrega acciones desde el historial', () => {
    const { result } = renderHook(() => useChat(1));

    act(() => result.current.editarDesdeHistorial(GASTO));
    expect(borrador(result.current.mensajes)).toMatchObject({ modo: 'editar' });

    act(() => result.current.eliminarDesdeHistorial(GASTO));
    expect(
      result.current.mensajes.some((mensaje) => mensaje.tipo === 'candidatos'),
    ).toBe(true);
  });

  it('persiste los mensajes y limpia el chat', async () => {
    const primera = renderHook(() => useChat(1));
    await act(async () => {
      await primera.result.current.enviarTexto('gasté 100');
    });
    primera.unmount();

    const misma = renderHook(() => useChat(1));
    expect(misma.result.current.mensajes.length).toBeGreaterThan(1);

    act(() => misma.result.current.limpiar());
    expect(misma.result.current.mensajes).toHaveLength(1);
  });

  it('maneja errores de red', async () => {
    const { result } = renderHook(() => useChat(1));

    mocks.chat.analizar.mockRejectedValueOnce(new Error('sin red'));
    await act(async () => {
      await result.current.enviarTexto('gasté 100');
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'error',
      ),
    ).toBe(true);

    mocks.resumen.obtener.mockRejectedValueOnce(new Error('sin red'));
    await act(async () => {
      await result.current.pedirResumen();
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('No pude obtener el resumen'),
      ),
    ).toBe(true);

    mocks.serie.obtener.mockRejectedValueOnce(new Error('sin red'));
    await act(async () => {
      await result.current.pedirGrafico();
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('No pude generar el gráfico'),
      ),
    ).toBe(true);

    mocks.gastos.listar.mockRejectedValueOnce(new Error('sin red'));
    await act(async () => {
      await result.current.pedirHistorial(1);
    });
    expect(
      result.current.mensajes.some(
        (mensaje) => mensaje.tipo === 'texto' && mensaje.texto.includes('No pude obtener el historial'),
      ),
    ).toBe(true);
  });

  it('propaga errores al confirmar o crear una categoría', async () => {
    const { result } = renderHook(() => useChat(1));
    await act(async () => {
      await result.current.enviarTexto('gasté 100');
    });
    const draft = borrador(result.current.mensajes)!;

    mocks.gastos.crear.mockRejectedValueOnce(new Error('boom'));
    await expect(
      result.current.confirmarBorrador(
        draft.id,
        DATOS,
        { recurrente: false, frecuencia: 'MENSUAL' },
      ),
    ).rejects.toThrow('boom');

    mocks.categorias.crear.mockRejectedValueOnce(new Error('boom'));
    await expect(
      result.current.crearCategoria('x', 'Mascotas'),
    ).rejects.toThrow('boom');
  });
});
