import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../state/auth.store.js';
import { mensajeDeError } from '../utils/format.js';
import { useChat } from './useChat.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMensajes } from './ChatMensajes.js';
import { ChatComposer } from './ChatComposer.js';

type Modo = 'drawer' | 'pagina';

interface ChatPanelProps {
  modo: Modo;
  onCerrar?: () => void;
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

  return (
    <section className={`chat-panel chat-panel--${modo}`} aria-label="Asistente">
      <ChatHeader
        modo={modo}
        cargando={chat.cargando}
        modoPeriodo={chat.modoPeriodo}
        onCambiarPeriodo={chat.setModoPeriodo}
        onLimpiar={limpiar}
        onCerrar={onCerrar}
      />

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
        <ChatMensajes
          mensajes={chat.mensajes}
          chat={chat}
          cargando={chat.cargando || accionCargando}
        />
        <div ref={finRef} />
      </div>

      <ChatComposer
        texto={texto}
        onTexto={setTexto}
        onEnviar={enviar}
        onAdjuntar={adjuntar}
        cargando={chat.cargando}
        inputRef={inputRef}
        archivoRef={archivoRef}
      />

      {chat.categoriasError ? (
        <p className="chat-nota" role="status">
          No se pudieron cargar las categorías. {mensajeDeError(chat.categoriasError)}
        </p>
      ) : null}
    </section>
  );
}
