import { useState } from 'react';
import { mensajeDeError } from '../utils/format.js';
import type { MensajeChat } from './tipos.js';

type CategoriaMensaje = Extract<MensajeChat, { tipo: 'categoria' }>;

export function CategoriaCard({
  mensaje,
  onCrear,
  onCancelar,
}: {
  mensaje: CategoriaMensaje;
  onCrear: (id: string, nombre: string) => Promise<void>;
  onCancelar: (id: string) => void;
}) {
  const [nombre, setNombre] = useState(mensaje.nombre);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nombre.trim().length < 2) {
      setError('El nombre tiene que tener al menos 2 letras.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onCrear(mensaje.id, nombre.trim());
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="chat-card" onSubmit={crear}>
      <p className="chat-card__title">Nueva categoría</p>
      <label className="campo">
        <span className="campo__label">Nombre</span>
        <input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Ej: Mascotas"
          autoFocus
        />
      </label>
      {error ? (
        <p className="alerta" role="alert">
          {error}
        </p>
      ) : null}
      <div className="fila">
        <button
          type="submit"
          className="boton boton--primario boton--chico"
          disabled={guardando}
        >
          {guardando ? 'Creando…' : 'Crear categoría'}
        </button>
        <button
          type="button"
          className="boton boton--fantasma boton--chico"
          onClick={() => onCancelar(mensaje.id)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
