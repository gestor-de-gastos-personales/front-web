import { create } from 'zustand';
import { mesActual } from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';

interface PeriodoState {
  periodo: Periodo;
  setPeriodo: (periodo: Periodo) => void;
}

/** Período global por defecto; total, categorías y evolución pueden tener uno propio. */
export const usePeriodo = create<PeriodoState>((set) => ({
  periodo: mesActual(),
  setPeriodo: (periodo) => set({ periodo }),
}));
