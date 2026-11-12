/** Paleta compartida por los gráficos del tablero (marca Mangos + acentos). */
export const PALETA_GRAFICOS = [
  '#00a3e8',
  '#ffa726',
  '#2fbf71',
  '#ff4d4d',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];

export function colorGrafico(indice: number): string {
  return PALETA_GRAFICOS[indice % PALETA_GRAFICOS.length]!;
}
