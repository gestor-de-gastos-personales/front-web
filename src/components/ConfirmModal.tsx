import { Modal } from './Modal.js';

interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Diálogo de confirmación para acciones destructivas. */
export function ConfirmModal({
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar} mostrarCerrar={false}>
      <p className="modal__mensaje">{mensaje}</p>
      <div className="modal__acciones">
        <button type="button" className="boton boton--chico" onClick={onCancelar}>
          {textoCancelar}
        </button>
        <button
          type="button"
          className="boton boton--peligro boton--chico"
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
