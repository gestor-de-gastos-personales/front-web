import type { Categoria, Gasto, GastoEntrada } from '../services/gastos.service.js';
import { Modal } from '../components/Modal.js';
import { ExpenseForm } from '../components/ExpenseForm.js';

/** Modal de alta o edición de un gasto. */
export function GastosFormulario({
  formulario,
  categorias,
  guardando,
  error,
  onGuardar,
  onCerrar,
}: {
  formulario: Gasto | 'nuevo';
  categorias: Categoria[];
  guardando: boolean;
  error: string | null;
  onGuardar: (datos: GastoEntrada) => Promise<void>;
  onCerrar: () => void;
}) {
  return (
    <Modal
      titulo={formulario === 'nuevo' ? 'Nuevo gasto' : 'Editar gasto'}
      onCerrar={onCerrar}
    >
      <ExpenseForm
        categorias={categorias}
        inicial={formulario === 'nuevo' ? null : formulario}
        guardando={guardando}
        error={error}
        onGuardar={onGuardar}
        onCancelar={onCerrar}
      />
    </Modal>
  );
}
