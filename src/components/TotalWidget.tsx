import type { Resumen } from '../services/resumen.service.js';
import { formatearFecha, formatearMonto } from '../utils/format.js';
import { Widget } from './Widget.js';

interface TotalWidgetProps {
  resumen: Resumen;
}

export function TotalWidget({ resumen }: TotalWidgetProps) {
  return (
    <Widget titulo="Total del período" tag={`${resumen.cantidad} gastos`} className="span-4">
      <p className="total">{formatearMonto(resumen.totalGeneral)}</p>
      <p className="total__meta">
        {resumen.porCategoria.length} categorías con movimiento
      </p>

      {resumen.mayorGasto ? (
        <p className="mono" style={{ marginTop: 16 }}>
          Mayor: {resumen.mayorGasto.descripcion} ·{' '}
          {formatearMonto(resumen.mayorGasto.monto)} ·{' '}
          {formatearFecha(resumen.mayorGasto.fecha)}
        </p>
      ) : (
        <p className="mono" style={{ marginTop: 16 }}>
          Sin gastos en el período.
        </p>
      )}
    </Widget>
  );
}
