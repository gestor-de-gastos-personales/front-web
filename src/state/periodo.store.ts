import { create } from 'zustand';
import { mesActual } from '../utils/periodo.js';
import type { Periodo } from '../utils/periodo.js';

interface PeriodoState {
  periodo: Periodo;
  setPeriodo: (periodo: Periodo) => void;
}

/** Período global que alimenta todos los widgets del dashboard. */
export const usePeriodo = create<PeriodoState>((set) => ({
  periodo: mesActual(),
  setPeriodo: (periodo) => set({ periodo }),
}));
