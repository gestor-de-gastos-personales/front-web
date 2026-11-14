import { useCallback, useEffect, useState } from 'react';
import { categoriasService } from '../services/categorias.service.js';
import { gastosService } from '../services/gastos.service.js';
import type { Gasto } from '../services/gastos.service.js';
import { resumenService } from '../services/resumen.service.js';
import { serieService } from '../services/serie.service.js';
import { aDDMMYYYY, mesActual } from '../utils/periodo.js';
import { formatearFecha, formatearMonto } from '../utils/format.js';
import { useAsync } from '../hooks/useAsync.js';
import { resolverPeriodo } from '../widgets/periodo.js';
import type { ModoPeriodoWidget } from '../widgets/tipos.js';
import { chatService } from './chatApi.js';
import { categoriaSugerida, periodoDesdeRango } from './chatPeriodo.js';
import type {
  AnalisisIA,
  DatosGasto,
  MensajeChat,
  OpcionesBorrador,
} from './tipos.js';

const CLAVE = (usuarioId?: number | null) =>
  `mangos.chat.${usuarioId ?? 'anon'}`;

const MAX_MENSAJES = 60;

function nuevoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function bienvenida(): MensajeChat {
  return {
    id: 'bienvenida',
    rol: 'asistente',
    tipo: 'texto',
    texto:
      'Hola 👋 Soy el asistente de Mangos. Podés escribir “gasté 1500 en el super”, pedir un resumen, ver el historial o subir una foto de un ticket.',
  };
}

function cargarMensajes(usuarioId?: number | null): MensajeChat[] {
  try {
    const crudo = localStorage.getItem(CLAVE(usuarioId));
    if (!crudo) return [bienvenida()];
    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos) || datos.length === 0) return [bienvenida()];

    const validos = datos.filter(
      (mensaje): mensaje is MensajeChat =>
        Boolean(mensaje) &&
        typeof mensaje === 'object' &&
        typeof (mensaje as { id?: unknown }).id === 'string' &&
        typeof (mensaje as { tipo?: unknown }).tipo === 'string',
    );

    return validos.length ? validos.slice(-MAX_MENSAJES) : [bienvenida()];
  } catch {
    return [bienvenida()];
  }
}

function textoGasto(gasto: Gasto): string {
  return `${gasto.descripcion} · ${formatearMonto(gasto.monto)} · ${formatearFecha(gasto.fecha)}${
    gasto.categoria?.nombre ? ` · ${gasto.categoria.nombre}` : ''
  }`;
}

function analisisVacio(intent: string): AnalisisIA {
  return {
    intent,
    monto: null,
    comercio: null,
    categoria: null,
    descripcion: null,
    fecha: null,
    rango: null,
    recurringHint: null,
    searchHint: null,
    campos: null,
  };
}

export type Chat = ReturnType<typeof useChat>;

export function useChat(usuarioId?: number | null) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() =>
    cargarMensajes(usuarioId),
  );
  const [cargando, setCargando] = useState(false);
  const [modoPeriodo, setModoPeriodo] = useState<ModoPeriodoWidget>('mes');
  const categoriasApi = useAsync(() => categoriasService.listar(), []);
  const categorias = categoriasApi.data ?? [];
  const periodo = resolverPeriodo(modoPeriodo, mesActual());

  useEffect(() => {
    setMensajes(cargarMensajes(usuarioId));
  }, [usuarioId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE(usuarioId),
        JSON.stringify(mensajes.slice(-MAX_MENSAJES)),
      );
    } catch {
      // Sin storage: el chat vive en memoria.
    }
  }, [mensajes, usuarioId]);

  const agregar = useCallback((mensaje: MensajeChat) => {
    setMensajes((previo) => [...previo, mensaje]);
  }, []);

  const responder = useCallback((texto: string) => {
    agregar({ id: nuevoId(), rol: 'asistente', tipo: 'texto', texto });
  }, [agregar]);

  const agregarUsuario = useCallback(
    (texto: string) => {
      agregar({
        id: nuevoId(),
        rol: 'usuario',
        tipo: 'texto',
        texto,
      });
    },
    [agregar],
  );

  const reemplazar = useCallback((id: string, mensaje: MensajeChat) => {
    setMensajes((previo) =>
      previo.map((actual) => (actual.id === id ? mensaje : actual)),
    );
  }, []);

  const cancelar = useCallback((id: string) => {
    reemplazar(id, {
      id,
      rol: 'asistente',
      tipo: 'texto',
      texto: 'Cancelado.',
    });
  }, [reemplazar]);

  const buscarGastos = useCallback(async (analisis: AnalisisIA) => {
    const pagina = await gastosService.listar({ page: 1, limit: 20 });
    const hint = (
      analisis.comercio ??
      analisis.descripcion ??
      analisis.searchHint ??
      analisis.query ??
      ''
    ).toLowerCase();
    const monto = analisis.monto;
    const tokens = hint.split(/\s+/).filter((token) => token.length > 2);
    const pareceUltimo =
      !analisis.comercio &&
      (analisis.target === 'last' || hint === 'ultimo');

    if (pareceUltimo) {
      return pagina.data.slice(0, 1);
    }

    return pagina.data
      .filter((gasto) => {
        const texto =
          `${gasto.descripcion} ${gasto.categoria?.nombre ?? ''}`.toLowerCase();
        const coincideTexto =
          !hint || texto.includes(hint) || tokens.some((token) => texto.includes(token));
        const coincideMonto = monto == null || Number(gasto.monto) === monto;
        return coincideTexto && coincideMonto;
      })
      .slice(0, 5);
  }, []);

  const pedirResumen = useCallback(async () => {
    try {
      const resumen = await resumenService.obtener(periodo.desde, periodo.hasta);
      agregar({
        id: nuevoId(),
        rol: 'asistente',
        tipo: 'resumen',
        periodo,
        resumen,
      });
    } catch {
      responder('No pude obtener el resumen. Probá de nuevo en un momento.');
    }
  }, [agregar, periodo, responder]);

  const pedirHistorial = useCallback(async (pagina = 1) => {
    try {
      const datos = await gastosService.listar({
        page: pagina,
        limit: 5,
        fechaInicio: aDDMMYYYY(periodo.desde),
        fechaFin: aDDMMYYYY(periodo.hasta),
      });
      agregar({
        id: nuevoId(),
        rol: 'asistente',
        tipo: 'historial',
        periodo,
        pagina: datos,
      });
    } catch {
      responder('No pude obtener el historial. Probá de nuevo en un momento.');
    }
  }, [agregar, periodo, responder]);

  const pedirGrafico = useCallback(async () => {
    try {
      const serie = await serieService.obtener(
        periodo.desde,
        periodo.hasta,
        periodo.agrupacion,
      );
      agregar({
        id: nuevoId(),
        rol: 'asistente',
        tipo: 'grafico',
        periodo,
        puntos: serie.puntos,
        agrupacion: serie.agrupacion,
      });
    } catch {
      responder('No pude generar el gráfico. Probá de nuevo en un momento.');
    }
  }, [agregar, periodo, responder]);

  const manejarAnalisis = useCallback(
    async (analisis: AnalisisIA) => {
      const intent = analisis.intent;

      if (
        intent === 'CREATE_EXPENSE' ||
        intent === 'SUGGEST_RECURRING' ||
        intent === 'SET_RECURRING'
      ) {
        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'borrador',
          analisis,
          modo: 'crear',
          categoriaId: categoriaSugerida(analisis, categorias)?.id,
        });
        return;
      }

      if (intent === 'GET_SUMMARY') {
        const objetivo = periodoDesdeRango(analisis.rango, periodo);
        try {
          const resumen = await resumenService.obtener(
            objetivo.desde,
            objetivo.hasta,
          );
          agregar({
            id: nuevoId(),
            rol: 'asistente',
            tipo: 'resumen',
            periodo: objetivo,
            resumen,
          });
        } catch {
          responder('No pude obtener el resumen. Probá de nuevo en un momento.');
        }
        return;
      }

      if (intent === 'DELETE_EXPENSE') {
        const candidatos = await buscarGastos(analisis);
        if (!candidatos.length) {
          responder(
            'No encontré un gasto que coincida. Probá con otra descripción o monto.',
          );
          return;
        }
        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'candidatos',
          accion: 'eliminar',
          gastos: candidatos,
        });
        return;
      }

      if (
        intent === 'EDIT_EXPENSE' ||
        intent === 'UPDATE_EXPENSE' ||
        intent === 'SHOW_EXPENSE'
      ) {
        const candidatos = await buscarGastos(analisis);
        if (!candidatos.length) {
          responder(
            'No encontré un gasto que coincida. Probá con otra descripción o monto.',
          );
          return;
        }

        if (intent === 'SHOW_EXPENSE' && candidatos.length === 1) {
          responder(`Encontré este gasto: ${textoGasto(candidatos[0]!)}.`);
          return;
        }

        if (candidatos.length === 1) {
          agregar({
            id: nuevoId(),
            rol: 'asistente',
            tipo: 'borrador',
            analisis: { ...analisis, ...analisisVacio(analisis.intent) },
            modo: 'editar',
            gasto: candidatos[0],
          });
          return;
        }

        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'candidatos',
          accion: 'editar',
          gastos: candidatos,
        });
        return;
      }

      if (intent === 'CREATE_CATEGORY') {
        const nombre =
          analisis.categoria ??
          analisis.descripcion ??
          analisis.comercio ??
          analisis.query ??
          '';
        if (!nombre.trim()) {
          responder('¿Cómo querés llamar la nueva categoría?');
          return;
        }
        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'categoria',
          nombre: nombre.trim(),
        });
        return;
      }

      responder(
        'No entendí ese pedido. Puedo registrar un gasto, resumir, mostrar el historial, graficar, editar o eliminar gastos y crear categorías.',
      );
    },
    [agregar, buscarGastos, categorias, periodo, responder],
  );

  const enviarTexto = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || cargando) return;

      agregar({
        id: nuevoId(),
        rol: 'usuario',
        tipo: 'texto',
        texto: limpio,
      });
      setCargando(true);
      try {
        const analisis = await chatService.analizar(limpio);
        await manejarAnalisis(analisis);
      } catch {
        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'error',
          texto:
            'No pude analizar el mensaje. Revisá la conexión con el asistente e intentá de nuevo.',
        });
      } finally {
        setCargando(false);
      }
    },
    [agregar, cargando, manejarAnalisis],
  );

  const enviarImagen = useCallback(
    async (archivo: File) => {
      if (cargando) return;
      if (!archivo.type.startsWith('image/')) {
        responder('El archivo tiene que ser una imagen (JPG, PNG, etc.).');
        return;
      }
      if (archivo.size > 10 * 1024 * 1024) {
        responder('La imagen no puede superar los 10 MB.');
        return;
      }

      agregar({
        id: nuevoId(),
        rol: 'usuario',
        tipo: 'imagen',
        nombre: archivo.name,
      });
      setCargando(true);
      try {
        const analisis = await chatService.analizarImagen(archivo);
        await manejarAnalisis(analisis);
      } catch {
        agregar({
          id: nuevoId(),
          rol: 'asistente',
          tipo: 'error',
          texto:
            'No pude leer el comprobante. Probá con otra imagen o cargá el gasto a mano.',
        });
      } finally {
        setCargando(false);
      }
    },
    [agregar, cargando, manejarAnalisis, responder],
  );

  const confirmarBorrador = useCallback(
    async (
      id: string,
      datos: DatosGasto,
      opciones: OpcionesBorrador,
      gasto?: Gasto,
    ) => {
      if (gasto) {
        await gastosService.actualizar(gasto.id, datos);
        reemplazar(id, {
          id,
          rol: 'asistente',
          tipo: 'texto',
          texto: `Listo, actualicé el gasto: ${datos.descripcion} · ${formatearMonto(
            datos.valor,
          )}.`,
        });
        return;
      }

      await gastosService.crear(datos);

      let avisoRecurrente = '';
      if (opciones.recurrente) {
        try {
          await chatService.crearRecurrente({
            monto: datos.valor,
            descripcion: datos.descripcion,
            categoriaId: datos.categoria,
            frecuencia: opciones.frecuencia,
            comercio: datos.descripcion,
          });
          avisoRecurrente = ' También creé la regla recurrente.';
        } catch {
          avisoRecurrente =
            ' El gasto se guardó, pero no se pudo crear la regla recurrente.';
        }
      }

      reemplazar(id, {
        id,
        rol: 'asistente',
        tipo: 'texto',
        texto: `Guardé el gasto: ${datos.descripcion} · ${formatearMonto(
          datos.valor,
        )} · ${formatearFecha(datos.fecha)}.${avisoRecurrente}`,
      });
    },
    [reemplazar],
  );

  const editarDesdeHistorial = useCallback(
    (gasto: Gasto) => {
      agregar({
        id: nuevoId(),
        rol: 'asistente',
        tipo: 'borrador',
        analisis: analisisVacio('EDIT_EXPENSE'),
        modo: 'editar',
        gasto,
      });
    },
    [agregar],
  );

  const eliminarDesdeHistorial = useCallback(
    (gasto: Gasto) => {
      agregar({
        id: nuevoId(),
        rol: 'asistente',
        tipo: 'candidatos',
        accion: 'eliminar',
        gastos: [gasto],
      });
    },
    [agregar],
  );

  const confirmarEliminar = useCallback(
    async (id: string, gasto: Gasto) => {
      await gastosService.eliminar(gasto.id);
      reemplazar(id, {
        id,
        rol: 'asistente',
        tipo: 'texto',
        texto: `Eliminé el gasto: ${textoGasto(gasto)}.`,
      });
    },
    [reemplazar],
  );

  const editarCandidato = useCallback(
    (id: string, gasto: Gasto) => {
      reemplazar(id, {
        id,
        rol: 'asistente',
        tipo: 'borrador',
        analisis: analisisVacio('EDIT_EXPENSE'),
        modo: 'editar',
        gasto,
      });
    },
    [reemplazar],
  );

  const crearCategoria = useCallback(
    async (id: string, nombre: string) => {
      await categoriasService.crear(nombre);
      categoriasApi.recargar();
      reemplazar(id, {
        id,
        rol: 'asistente',
        tipo: 'texto',
        texto: `Creé la categoría “${nombre}”.`,
      });
    },
    [categoriasApi, reemplazar],
  );

  const cargarHistorial = useCallback(
    async (id: string, pagina: number, periodoMensaje: typeof periodo) => {
      const datos = await gastosService.listar({
        page: pagina,
        limit: 5,
        fechaInicio: aDDMMYYYY(periodoMensaje.desde),
        fechaFin: aDDMMYYYY(periodoMensaje.hasta),
      });
      setMensajes((previo) =>
        previo.map((mensaje) =>
          mensaje.id === id && mensaje.tipo === 'historial'
            ? { ...mensaje, pagina: datos }
            : mensaje,
        ),
      );
    },
    [],
  );

  const limpiar = useCallback(() => {
    setMensajes([bienvenida()]);
  }, []);

  return {
    mensajes,
    cargando,
    agregarUsuario,
    categorias,
    categoriasCargando: categoriasApi.cargando,
    categoriasError: categoriasApi.error,
    recargarCategorias: categoriasApi.recargar,
    modoPeriodo,
    setModoPeriodo,
    periodo,
    enviarTexto,
    enviarImagen,
    confirmarBorrador,
    cancelar,
    pedirResumen,
    pedirHistorial,
    pedirGrafico,
    cargarHistorial,
    editarDesdeHistorial,
    eliminarDesdeHistorial,
    confirmarEliminar,
    editarCandidato,
    crearCategoria,
    limpiar,
  };
}
