import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chat = vi.hoisted(() => ({
  mensajes: [] as any[],
  cargando: false,
  categorias: [{ id: 1, nombre: 'Alimentación' }] as any[],
  categoriasCargando: false,
  categoriasError: null as string | null,
  recargarCategorias: vi.fn(),
  modoPeriodo: 'mes',
  setModoPeriodo: vi.fn(),
  periodo: {
    desde: '2026-11-01',
    hasta: '2026-11-30',
    etiqueta: 'noviembre de 2026',
    agrupacion: 'dia',
  },
  enviarTexto: vi.fn(),
  enviarImagen: vi.fn(),
  confirmarBorrador: vi.fn(),
  cancelar: vi.fn(),
  pedirResumen: vi.fn(),
  pedirHistorial: vi.fn(),
  pedirGrafico: vi.fn(),
  cargarHistorial: vi.fn(),
  editarDesdeHistorial: vi.fn(),
  eliminarDesdeHistorial: vi.fn(),
  confirmarEliminar: vi.fn(),
  editarCandidato: vi.fn(),
  crearCategoria: vi.fn(),
  limpiar: vi.fn(),
  agregarUsuario: vi.fn(),
}));

vi.mock('./useChat.js', () => ({ useChat: () => chat }));
vi.mock('../state/auth.store.js', () => ({ useAuth: () => 1 }));

import { ChatPanel } from './ChatPanel.js';

const PERIODO = chat.periodo;
const GASTO = {
  id: 1,
  descripcion: 'Coto',
  monto: 100,
  fecha: '2026-11-01T00:00:00.000Z',
  categoriaId: 1,
  categoria: { id: 1, nombre: 'Alimentación' },
};
const PAGINA = {
  data: [GASTO],
  meta: { total: 1, page: 1, limit: 5, totalPages: 2 },
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
const ANALISIS = {
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
};

function mensajesCompletos() {
  return [
    { id: 'u1', rol: 'usuario', tipo: 'texto', texto: 'hola' },
    { id: 'a1', rol: 'asistente', tipo: 'texto', texto: 'respuesta' },
    { id: 'i1', rol: 'usuario', tipo: 'imagen', nombre: 'ticket.png' },
    { id: 'e1', rol: 'asistente', tipo: 'error', texto: 'algo salió mal' },
    {
      id: 'b1',
      rol: 'asistente',
      tipo: 'borrador',
      analisis: ANALISIS,
      modo: 'crear',
      categoriaId: 1,
    },
    { id: 'r1', rol: 'asistente', tipo: 'resumen', periodo: PERIODO, resumen: RESUMEN },
    {
      id: 'g1',
      rol: 'asistente',
      tipo: 'grafico',
      periodo: PERIODO,
      puntos: [{ clave: '2026-11-01', etiqueta: '01/11', total: 100 }],
      agrupacion: 'dia',
    },
    { id: 'h1', rol: 'asistente', tipo: 'historial', periodo: PERIODO, pagina: PAGINA },
    {
      id: 'c1',
      rol: 'asistente',
      tipo: 'candidatos',
      accion: 'eliminar',
      gastos: [GASTO],
    },
    { id: 'cat1', rol: 'asistente', tipo: 'categoria', nombre: 'Mascotas' },
  ] as any[];
}

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chat.mensajes = [{ id: 'bienvenida', rol: 'asistente', tipo: 'texto', texto: 'Hola' }];
    chat.cargando = false;
    chat.categorias = [{ id: 1, nombre: 'Alimentación' }];
    chat.categoriasCargando = false;
    chat.categoriasError = null;
    chat.modoPeriodo = 'mes';
    chat.confirmarBorrador.mockResolvedValue(undefined);
    chat.confirmarEliminar.mockResolvedValue(undefined);
    chat.crearCategoria.mockResolvedValue(undefined);
    chat.enviarTexto.mockResolvedValue(undefined);
    chat.enviarImagen.mockResolvedValue(undefined);
    chat.pedirResumen.mockResolvedValue(undefined);
    chat.pedirHistorial.mockResolvedValue(undefined);
    chat.pedirGrafico.mockResolvedValue(undefined);
    chat.cargarHistorial.mockResolvedValue(undefined);
  });

  it('renderiza todos los tipos de mensaje', () => {
    chat.mensajes = mensajesCompletos();
    render(<ChatPanel modo="drawer" onCerrar={vi.fn()} />);

    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('respuesta')).toBeInTheDocument();
    expect(screen.getByText(/ticket\.png/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('algo salió mal');
    expect(screen.getByText('Gasto detectado')).toBeInTheDocument();
    expect(screen.getByText(/Resumen ·/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Evolución de gastos/ })).toBeInTheDocument();
    expect(screen.getByText(/Historial ·/)).toBeInTheDocument();
    expect(screen.getByText('¿Cuál querés eliminar?')).toBeInTheDocument();
    expect(screen.getByText('Nueva categoría')).toBeInTheDocument();
  });

  it('interactúa con las tarjetas', async () => {
    chat.mensajes = mensajesCompletos();
    render(<ChatPanel modo="drawer" onCerrar={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Registrar gasto' }));
    await waitFor(() =>
      expect(chat.confirmarBorrador).toHaveBeenCalledWith(
        'b1',
        expect.objectContaining({ descripcion: 'Coto', valor: 100, categoria: 1 }),
        { recurrente: false, frecuencia: 'MENSUAL' },
        undefined,
      ),
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar' })[0]!);
    expect(chat.cancelar).toHaveBeenCalledWith('b1');

    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]!);
    expect(chat.editarDesdeHistorial).toHaveBeenCalledWith(GASTO);

    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!);
    expect(chat.eliminarDesdeHistorial).toHaveBeenCalledWith(GASTO);

    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' }).at(-1)!);
    await waitFor(() =>
      expect(chat.confirmarEliminar).toHaveBeenCalledWith('c1', GASTO),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(chat.cargarHistorial).toHaveBeenCalledWith('h1', 2, PERIODO);

    const categoria = screen.getByText('Nueva categoría').closest('form')!;
    fireEvent.change(within(categoria).getByLabelText('Nombre'), {
      target: { value: 'Viajes' },
    });
    fireEvent.click(within(categoria).getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() =>
      expect(chat.crearCategoria).toHaveBeenCalledWith('cat1', 'Viajes'),
    );
  });

  it('ejecuta las acciones rápidas', async () => {
    render(<ChatPanel modo="drawer" onCerrar={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Resumen' }));
    await waitFor(() => expect(chat.pedirResumen).toHaveBeenCalled());
    expect(chat.agregarUsuario).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Historial' }));
    await waitFor(() =>
      expect(chat.pedirHistorial).toHaveBeenCalledWith(1),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gráfico' }));
    await waitFor(() => expect(chat.pedirGrafico).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Categoría' }));
    expect(chat.enviarTexto).toHaveBeenCalledWith(
      'Quiero crear una categoría',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo gasto' }));
    expect(document.activeElement).toBe(
      screen.getByLabelText('Mensaje para el asistente'),
    );
  });

  it('envía texto, imágenes y acepta drag & drop', async () => {
    render(<ChatPanel modo="drawer" onCerrar={vi.fn()} />);
    const input = screen.getByLabelText('Mensaje para el asistente');

    fireEvent.change(input, { target: { value: 'gasté 100' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(chat.enviarTexto).toHaveBeenCalledWith('gasté 100');
    expect(input).toHaveValue('');

    chat.enviarTexto.mockClear();
    fireEvent.change(input, { target: { value: 'no enviar' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(chat.enviarTexto).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(chat.enviarTexto).toHaveBeenCalledWith('no enviar');

    const archivo = new File(['x'], 'ticket.png', { type: 'image/png' });
    const fileInput = document.querySelector<HTMLInputElement>('input[type=file]')!;
    fireEvent.change(fileInput, { target: { files: [archivo] } });
    expect(chat.enviarImagen).toHaveBeenCalledWith(archivo);

    chat.enviarImagen.mockClear();
    fireEvent.drop(screen.getByText('Hola').closest('.chat-body')!, {
      dataTransfer: { files: [archivo] },
    });
    expect(chat.enviarImagen).toHaveBeenCalledWith(archivo);
  });

  it('muestra el estado de carga y bloquea el envío', () => {
    chat.cargando = true;
    render(<ChatPanel modo="drawer" onCerrar={vi.fn()} />);

    expect(screen.getAllByText('Analizando…').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Adjuntar imagen' })).toBeDisabled();
  });

  it('muestra carga y error de categorías en un borrador', () => {
    chat.categorias = [];
    chat.categoriasCargando = true;
    chat.mensajes = [mensajesCompletos()[4]];
    const { rerender } = render(<ChatPanel modo="drawer" />);
    expect(screen.getByText('Cargando categorías…')).toBeInTheDocument();

    chat.categoriasCargando = false;
    chat.categoriasError = 'boom';
    rerender(<ChatPanel modo="drawer" />);
    expect(screen.getByText('No pude cargar las categorías.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(chat.recargarCategorias).toHaveBeenCalled();
  });

  it('cambia el período, limpia y cierra', () => {
    const onCerrar = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ChatPanel modo="drawer" onCerrar={onCerrar} />);

    fireEvent.change(
      screen.getByRole('combobox', { name: 'Período del asistente' }),
      { target: { value: 'anio' } },
    );
    expect(chat.setModoPeriodo).toHaveBeenCalledWith('anio');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(chat.limpiar).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar asistente' }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('en modo página no muestra el botón de cierre', () => {
    render(<ChatPanel modo="pagina" />);
    expect(
      screen.queryByRole('button', { name: 'Cerrar asistente' }),
    ).not.toBeInTheDocument();
  });

  it('muestra la nota de error de categorías', () => {
    chat.categoriasError = 'falló la red';
    render(<ChatPanel modo="pagina" />);
    expect(screen.getByText(/No se pudieron cargar las categorías/)).toBeInTheDocument();
  });
});
