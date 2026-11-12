export type Agrupacion = 'dia' | 'semana' | 'mes';

export interface Periodo {
  desde: string;
  hasta: string;
  etiqueta: string;
  agrupacion: Agrupacion;
}

const iso = (fecha: Date) => fecha.toISOString().slice(0, 10);

const isoLocal = (fecha: Date) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const primerDia = (anio: number, mes: number) =>
  iso(new Date(Date.UTC(anio, mes, 1)));

const ultimoDia = (anio: number, mes: number) =>
  iso(new Date(Date.UTC(anio, mes + 1, 0)));

const nombreMes = (anio: number, mes: number) =>
  new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(anio, mes, 1)));

/** Período del mes actual. */
export function mesActual(hoy = new Date()): Periodo {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  return {
    desde: primerDia(anio, mes),
    hasta: ultimoDia(anio, mes),
    etiqueta: nombreMes(anio, mes),
    agrupacion: 'dia',
  };
}

/** Período de un solo día: hoy. */
export function hoyPeriodo(hoy = new Date()): Periodo {
  const fecha = isoLocal(hoy);
  return {
    desde: fecha,
    hasta: fecha,
    etiqueta: 'Hoy',
    agrupacion: 'dia',
  };
}

/** Semana calendario actual, de lunes a domingo. */
export function estaSemana(hoy = new Date()): Periodo {
  const desplazamiento = (hoy.getDay() + 6) % 7; // lunes = 0
  const inicio = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() - desplazamiento,
  );
  const fin = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate() + 6,
  );

  return {
    desde: isoLocal(inicio),
    hasta: isoLocal(fin),
    etiqueta: 'Esta semana',
    agrupacion: 'dia',
  };
}

/** Últimos N días incluyendo hoy. */
export function ultimosDias(cantidad: number, hoy = new Date()): Periodo {
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicio = new Date(
    fin.getFullYear(),
    fin.getMonth(),
    fin.getDate() - (cantidad - 1),
  );

  return {
    desde: isoLocal(inicio),
    hasta: isoLocal(fin),
    etiqueta: `Últimos ${cantidad} días`,
    agrupacion: 'dia',
  };
}

/** Período del mes anterior. */
export function mesAnterior(hoy = new Date()): Periodo {
  const fecha = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth() - 1, 1));
  const anio = fecha.getUTCFullYear();
  const mes = fecha.getUTCMonth();
  return {
    desde: primerDia(anio, mes),
    hasta: ultimoDia(anio, mes),
    etiqueta: nombreMes(anio, mes),
    agrupacion: 'dia',
  };
}

/** Últimos N meses (incluyendo el actual). */
export function ultimosMeses(cantidad: number, hoy = new Date()): Periodo {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  return {
    desde: primerDia(anio, mes - (cantidad - 1)),
    hasta: ultimoDia(anio, mes),
    etiqueta: `Últimos ${cantidad} meses`,
    agrupacion: cantidad > 3 ? 'mes' : 'semana',
  };
}

/** Año calendario actual. */
export function anioActual(hoy = new Date()): Periodo {
  const anio = hoy.getFullYear();
  return {
    desde: primerDia(anio, 0),
    hasta: ultimoDia(anio, 11),
    etiqueta: `Año ${anio}`,
    agrupacion: 'mes',
  };
}

/** Período a partir de dos fechas ISO (input type=date). */
export function periodoPersonalizado(desde: string, hasta: string): Periodo | null {
  if (!desde || !hasta || desde > hasta) return null;
  return {
    desde,
    hasta,
    etiqueta: `${desde.split('-').reverse().join('/')} — ${hasta
      .split('-')
      .reverse()
      .join('/')}`,
    agrupacion: 'dia',
  };
}

/** Convierte ISO (YYYY-MM-DD) al formato DD-MM-YYYY que espera /gastos. */
export function aDDMMYYYY(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}-${mes}-${anio}`;
}

/** Mes y año numéricos de un período (para presupuestos). */
export function mesYAnio(periodo: Periodo): { mes: number; anio: number } {
  const [anio, mes] = periodo.hasta.split('-').map(Number);
  return { mes, anio };
}
