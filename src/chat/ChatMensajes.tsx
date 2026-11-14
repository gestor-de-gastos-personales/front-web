import { BurbujaError, BurbujaImagen, BurbujaTexto } from './ChatBurbujas.js';
import {
  CandidatosCard,
  CategoriaCard,
  ExpenseDraftCard,
  GraficoCard,
  HistorialCard,
  ResumenCard,
} from './ChatTarjetas.js';
import type { Chat } from './useChat.js';
import type { MensajeChat } from './tipos.js';

function Tarjeta({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-msg chat-msg--asistente chat-msg--tarjeta">
      {children}
    </div>
  );
}

/** Lista de mensajes del asistente, incluidas las tarjetas interactivas. */
export function ChatMensajes({
  mensajes,
  chat,
  cargando,
}: {
  mensajes: MensajeChat[];
  chat: Chat;
  cargando: boolean;
}) {
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
          <Tarjeta key={item.id}>
            <ExpenseDraftCard
              mensaje={item}
              categorias={chat.categorias}
              categoriasCargando={chat.categoriasCargando}
              categoriasError={chat.categoriasError}
              onReintentarCategorias={chat.recargarCategorias}
              onConfirmar={chat.confirmarBorrador}
              onCancelar={chat.cancelar}
            />
          </Tarjeta>
        );
      case 'resumen':
        return (
          <Tarjeta key={item.id}>
            <ResumenCard mensaje={item} />
          </Tarjeta>
        );
      case 'grafico':
        return (
          <Tarjeta key={item.id}>
            <GraficoCard mensaje={item} />
          </Tarjeta>
        );
      case 'historial':
        return (
          <Tarjeta key={item.id}>
            <HistorialCard
              mensaje={item}
              onPagina={chat.cargarHistorial}
              onEditar={chat.editarDesdeHistorial}
              onEliminar={chat.eliminarDesdeHistorial}
            />
          </Tarjeta>
        );
      case 'candidatos':
        return (
          <Tarjeta key={item.id}>
            <CandidatosCard
              mensaje={item}
              onEditar={chat.editarCandidato}
              onEliminar={chat.confirmarEliminar}
              onCancelar={chat.cancelar}
            />
          </Tarjeta>
        );
      case 'categoria':
        return (
          <Tarjeta key={item.id}>
            <CategoriaCard
              mensaje={item}
              onCrear={chat.crearCategoria}
              onCancelar={chat.cancelar}
            />
          </Tarjeta>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {mensajes.map(mensaje)}
      {cargando ? (
        <div className="chat-msg chat-msg--asistente chat-typing">
          Analizando…
        </div>
      ) : null}
    </>
  );
}
