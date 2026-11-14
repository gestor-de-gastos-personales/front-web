import type { MensajeChat } from './tipos.js';

export function IconoEnviar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconoImagen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function IconoCerrar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function BurbujaTexto({
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

export function BurbujaImagen({
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

export function BurbujaError({
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
