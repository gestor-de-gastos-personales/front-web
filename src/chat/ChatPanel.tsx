import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../state/auth.store.js';
import { WidgetPeriodoSelector } from '../widgets/WidgetPeriodoSelector.js';
import { mensajeDeError } from '../utils/format.js';
import { useChat } from './useChat.js';
import {
  CandidatosCard,
  CategoriaCard,
  ExpenseDraftCard,
  GraficoCard,
  HistorialCard,
  ResumenCard,
} from './ChatTarjetas.js';
import type { MensajeChat } from './tipos.js';

type Modo = 'drawer' | 'pagina';

interface ChatPanelProps {
  modo: Modo;
  onCerrar?: () => void;
}

function IconoEnviar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function IconoImagen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BurbujaTexto({
  mensaje,
}: {
  mensaje: Extract<MensajeChat, { tipo: 'texto' }>;
}) {
  return (
    <div className={`chat-msg chat-msg--${mensaje.rol}`}>
      <p>{mensaje.texto}</p>
    </div>
  );
}

function BurbujaImagen({
  mensaje,
}: {
  mensaje: Extract<MensajeChat, { tipo: 'imagen' }>;
}) {
  return (
    <div className="chat-msg chat-msg--usuario">
      <p>📎 {mensaje.nombre}</p>
    </div>
  );
}

function BurbujaError({
  mensaje,
}: {
  mensaje: Extract<MensajeChat, { tipo: 'error' }>;
}) {
  return (
    <div className="chat-msg chat-msg--asistente">
      <p className="alerta" role="alert">
        {mensaje.texto}
      </p>
    </div>
  );
}

export function ChatPanel({ modo, onCerrar }: ChatPanelProps) {
  const usuarioId = useAuth((estado) => estado.usuario?.id ?? null);
  const chat = useChat(usuarioId);
  const [texto, setTexto] = useState('');
  const [accionCargando, setAccionCargando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const archivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [chat.mensajes, chat.cargando]);

  const enviar = () => {
    if (!texto.trim() || chat.cargando) return;
    const valor = texto;
    setTexto('');
    void chat.enviarTexto(valor);
  };

  const adjuntar = (archivo: File | undefined) => {
    if (!archivo) return;
    void chat.enviarImagen(archivo);
  };

  const ejecutar = async (accion: () => Promise<void>) => {
    if (chat.cargando || accionCargando) return;
    setAccionCargando(true);
    try {
      await accion();
    } finally {
      setAccionCargando(false);
    }
  };

  const resumen = () =>
    ejecutar(async () => {
      chat.agregarUsuario(`Resumen de ${chat.periodo.etiqueta}`);
      await chat.pedirResumen();
    });

  const historial = () =>
    ejecutar(async () => {
      chat.agregarUsuario(`Historial de ${chat.periodo.etiqueta}`);
      await chat.pedirHistorial(1);
    });

  const grafico = () =>
    ejecutar(async () => {
      chat.agregarUsuario(`Gráfico de ${chat.periodo.etiqueta}`);
      await chat.pedirGrafico();
    });

  const limpiar = () => {
    if (window.confirm('¿Querés limpiar el historial del chat?')) {
      chat.limpiar();
    }
  };

  const mensaje = (item: MensajeChat) => {
    switch (item.tipo) {
      case 'texto':
        return <BurbujaTexto key={item.id} mensaje={item} />;
      case 'imagen':
        return <BurbujaImagen key={item.id} mensaje={item} />;
      case 'error':
        return <BurbujaError key={item.id} mensaje={item} />;
      case 'borrador':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <ExpenseDraftCard
              mensaje={item}
              categorias={chat.categorias}
              categoriasCargando={chat.categoriasCargando}
              categoriasError={chat.categoriasError}
              onReintentarCategorias={chat.recargarCategorias}
              onConfirmar={chat.confirmarBorrador}
              onCancelar={chat.cancelar}
            />
          </div>
        );
      case 'resumen':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <ResumenCard mensaje={item} />
          </div>
        );
      case 'grafico':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <GraficoCard mensaje={item} />
          </div>
        );
      case 'historial':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <HistorialCard
              mensaje={item}
              onPagina={chat.cargarHistorial}
              onEditar={chat.editarDesdeHistorial}
              onEliminar={chat.eliminarDesdeHistorial}
            />
          </div>
        );
      case 'candidatos':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <CandidatosCard
              mensaje={item}
              onEditar={chat.editarCandidato}
              onEliminar={chat.confirmarEliminar}
              onCancelar={chat.cancelar}
            />
          </div>
        );
      case 'categoria':
        return (
          <div className="chat-msg chat-msg--asistente chat-msg--tarjeta" key={item.id}>
            <CategoriaCard
              mensaje={item}
              onCrear={chat.crearCategoria}
              onCancelar={chat.cancelar}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className={`chat-panel chat-panel--${modo}`} aria-label="Asistente">
      <header className="chat-head">
        <div>
          <h2 className="chat-head__titulo">Asistente</h2>
          <p className="meta">
            {chat.cargando ? 'Analizando…' : 'Gastos en lenguaje natural'}
          </p>
        </div>
        <div className="chat-head__acciones">
          <WidgetPeriodoSelector
            valor={chat.modoPeriodo}
            onCambiar={chat.setModoPeriodo}
            etiqueta="Período del asistente"
          />
          <button
            type="button"
            className="boton boton--fantasma boton--chico"
            onClick={limpiar}
          >
            Limpiar
          </button>
          {modo === 'drawer' && onCerrar ? (
            <button
              type="button"
              className="chat-cerrar"
              aria-label="Cerrar asistente"
              onClick={onCerrar}
            >
              <IconoCerrar />
            </button>
          ) : null}
        </div>
      </header>

      <div className="chat-chips" aria-label="Acciones rápidas">
        <button
          type="button"
          className="chat-chip"
          onClick={() => inputRef.current?.focus()}
        >
          Nuevo gasto
        </button>
        <button type="button" className="chat-chip" onClick={() => void resumen()}>
          Resumen
        </button>
        <button type="button" className="chat-chip" onClick={() => void historial()}>
          Historial
        </button>
        <button type="button" className="chat-chip" onClick={() => void grafico()}>
          Gráfico
        </button>
        <button
          type="button"
          className="chat-chip"
          onClick={() => void chat.enviarTexto('Quiero crear una categoría')}
        >
          Categoría
        </button>
      </div>

      <div
        className={`chat-body${arrastrando ? ' chat-body--drag' : ''}`}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(evento) => {
          evento.preventDefault();
          setArrastrando(false);
          adjuntar(evento.dataTransfer.files[0]);
        }}
      >
        {chat.mensajes.map(mensaje)}
        {chat.cargando || accionCargando ? (
          <div className="chat-msg chat-msg--asistente chat-typing">
            Analizando…
          </div>
        ) : null}
        <div ref={finRef} />
      </div>

      <div className="chat-composer">
        <textarea
          ref={inputRef}
          className="chat-input"
          rows={1}
          value={texto}
          placeholder="Ej: gasté 1500 en el super…"
          aria-label="Mensaje para el asistente"
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' && !evento.shiftKey) {
              evento.preventDefault();
              enviar();
            }
          }}
          onPaste={(evento) => {
            const archivo = Array.from(evento.clipboardData.files)[0];
            if (archivo) {
              evento.preventDefault();
              adjuntar(archivo);
            }
          }}
        />
        <input
          ref={archivoRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(evento) => {
            adjuntar(evento.target.files?.[0]);
            evento.target.value = '';
          }}
        />
        <button
          type="button"
          className="chat-icono"
          aria-label="Adjuntar imagen"
          disabled={chat.cargando}
          onClick={() => archivoRef.current?.click()}
        >
          <IconoImagen />
        </button>
        <button
          type="button"
          className="chat-enviar"
          aria-label="Enviar mensaje"
          disabled={!texto.trim() || chat.cargando}
          onClick={enviar}
        >
          <IconoEnviar />
        </button>
      </div>

      {chat.categoriasError ? (
        <p className="chat-nota" role="status">
          No se pudieron cargar las categorías. {mensajeDeError(chat.categoriasError)}
        </p>
      ) : null}
    </section>
  );
}
