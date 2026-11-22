// Escolhe texto escuro ou claro para ler bem sobre a cor do cliente
export function corDoTexto(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminosidade = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminosidade > 0.6 ? '#20252d' : '#ffffff';
}

export const CORES_SUGERIDAS = ['#D6BD87', '#E27D60', '#E8A87C', '#C38D9E', '#8E8DBE', '#6C9BCF', '#41B3A3', '#85CDCA', '#A3C97A', '#F2C14E'];
