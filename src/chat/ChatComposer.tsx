import type { RefObject } from 'react';
import { IconoEnviar, IconoImagen } from './ChatBurbujas.js';

/** Caja de texto del asistente: enviar, adjuntar imagen y pegar archivos. */
export function ChatComposer({
  texto,
  onTexto,
  onEnviar,
  onAdjuntar,
  cargando,
  inputRef,
  archivoRef,
}: {
  texto: string;
  onTexto: (valor: string) => void;
  onEnviar: () => void;
  onAdjuntar: (archivo: File | undefined) => void;
  cargando: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  archivoRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="chat-composer">
      <textarea
        ref={inputRef}
        className="chat-input"
        rows={1}
        value={texto}
        placeholder="Ej: gasté 1500 en el super…"
        aria-label="Mensaje para el asistente"
        onChange={(evento) => onTexto(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' && !evento.shiftKey) {
            evento.preventDefault();
            onEnviar();
          }
        }}
        onPaste={(evento) => {
          const archivo = Array.from(evento.clipboardData.files)[0];
          if (archivo) {
            evento.preventDefault();
            onAdjuntar(archivo);
          }
        }}
      />
      <input
        ref={archivoRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(evento) => {
          onAdjuntar(evento.target.files?.[0]);
          evento.target.value = '';
        }}
      />
      <button
        type="button"
        className="chat-icono"
        aria-label="Adjuntar imagen"
        disabled={cargando}
        onClick={() => archivoRef.current?.click()}
      >
        <IconoImagen />
      </button>
      <button
        type="button"
        className="chat-enviar"
        aria-label="Enviar mensaje"
        disabled={!texto.trim() || cargando}
        onClick={onEnviar}
      >
        <IconoEnviar />
      </button>
    </div>
  );
}
