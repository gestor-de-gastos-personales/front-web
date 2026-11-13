import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatPanel } from './ChatPanel.js';

function IconoChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 9 9 0 0 1-3.2-.6L4 21l1.7-4.3A8.4 8.4 0 1 1 21 11.5Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  );
}

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();

  if (location.pathname === '/asistente') return null;

  return (
    <>
      {abierto ? (
        <>
          <div
            className="chat-backdrop"
            role="presentation"
            onClick={() => setAbierto(false)}
          />
          <div className="chat-drawer" role="dialog" aria-label="Asistente">
            <ChatPanel modo="drawer" onCerrar={() => setAbierto(false)} />
          </div>
        </>
      ) : null}

      {!abierto ? (
        <button
          type="button"
          className="chat-fab"
          aria-label="Abrir asistente"
          aria-expanded={abierto}
          onClick={() => setAbierto(true)}
        >
          <IconoChat />
        </button>
      ) : null}
    </>
  );
}
