const FUSO = 'America/Sao_Paulo';

const formatoDia = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' });
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

// Datas "AAAA-MM-DD" no horário de Brasília

export function chaveDia(data: string | Date): string {
  return formatoDia.format(typeof data === 'string' ? new Date(data) : data);
}

export function hojeIso(): string {
  return chaveDia(new Date());
}

function emUtc(dia: string): Date {
  const [ano, mes, dd] = dia.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dd));
}

export function somarDias(dia: string, quantidade: number): string {
  const data = emUtc(dia);
  data.setUTCDate(data.getUTCDate() + quantidade);
  return data.toISOString().slice(0, 10);
}

export function inicioDaSemana(dia: string): string {
  const diaDaSemana = emUtc(dia).getUTCDay(); // 0 = domingo
  return somarDias(dia, -((diaDaSemana + 6) % 7));
}

// Formatação para exibir

export function formatarHora(iso: string): string {
  return formatoHora.format(new Date(iso));
}

export function formatarDiaCurto(dia: string): string {
  return emUtc(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '');
}

export function formatarDiaLongo(dia: string): string {
  return emUtc(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatarIntervaloSemana(dia: string): string {
  const inicio = inicioDaSemana(dia);
  const fim = somarDias(inicio, 6);
  const opcoes: Intl.DateTimeFormatOptions = { timeZone: 'UTC', day: 'numeric', month: 'short' };
  const a = emUtc(inicio).toLocaleDateString('pt-BR', opcoes).replace(/\./g, '');
  const b = emUtc(fim).toLocaleDateString('pt-BR', opcoes).replace(/\./g, '');
  return `${a} a ${b}`;
}

export function formatarDataHora(iso: string): string {
  return `${formatarDiaCurto(chaveDia(iso))}, ${formatarHora(iso)}`;
}

// "em 2 dias", "hoje", "atrasado há 1 dia"
export function prazoRelativo(iso: string): { texto: string; atrasado: boolean } {
  const dias = Math.round((emUtc(chaveDia(iso)).getTime() - emUtc(hojeIso()).getTime()) / 86400000);
  if (dias === 0) return { texto: 'hoje', atrasado: false };
  if (dias === 1) return { texto: 'amanhã', atrasado: false };
  if (dias > 1) return { texto: `em ${dias} dias`, atrasado: false };
  return { texto: `atrasado há ${-dias} ${dias === -1 ? 'dia' : 'dias'}`, atrasado: true };
}

// Valor de <input type="datetime-local"> ("2026-11-20T09:00") para o formato que a API espera
export function paraIsoBrasilia(valorLocal: string): string {
  return `${valorLocal}:00-03:00`;
}

// Gravação de dia inteiro: começa à meia-noite e dura 24 horas
export function ehDiaInteiro(inicioIso: string, fimIso: string): boolean {
  const inicio = new Date(inicioIso);
  const fim = new Date(fimIso);
  return formatoHora.format(inicio) === '00:00' && fim.getTime() - inicio.getTime() === 86400000;
}

export function formatarHorario(inicioIso: string, fimIso: string): string {
  return ehDiaInteiro(inicioIso, fimIso) ? 'Dia inteiro' : `${formatarHora(inicioIso)} às ${formatarHora(fimIso)}`;
}

// Calendário mensal

export function inicioDoMes(dia: string): string {
  return `${dia.slice(0, 7)}-01`;
}

export function somarMeses(dia: string, quantidade: number): string {
  const [ano, mes] = dia.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1 + quantidade, 1)).toISOString().slice(0, 10);
}

export function formatarMes(dia: string): string {
  return emUtc(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}

export function numeroDoDia(dia: string): number {
  return Number(dia.slice(8, 10));
}

// 6 semanas (42 dias) começando na segunda-feira da semana do dia 1
export function gradeDoMes(dia: string): string[] {
  const primeira = inicioDaSemana(inicioDoMes(dia));
  return Array.from({ length: 42 }, (_, i) => somarDias(primeira, i));
}
