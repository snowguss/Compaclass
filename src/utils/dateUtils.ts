// Utilitários de manipulação e formatação de datas em Português

export const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
];

/**
 * Retorna a data atual padronizada (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata data como no rascunho do Gustavo:
 * "Hoje é segunda, dia 21 de setembro"
 */
export function formatGreetingDate(date: Date = new Date()): string {
  const dayOfWeek = WEEKDAYS_PT[date.getDay()].toLowerCase().replace('-feira', '');
  const day = date.getDate();
  const month = MONTHS_PT[date.getMonth()];
  return `Hoje é ${dayOfWeek}, dia ${day} de ${month}`;
}

/**
 * Formata cabeçalho para os próximos dias:
 * "terça-feira, dia 22 de setembro"
 */
export function formatUpcomingDayHeader(date: Date): string {
  const dayOfWeek = WEEKDAYS_PT[date.getDay()].toLowerCase();
  const day = date.getDate();
  const month = MONTHS_PT[date.getMonth()];
  return `${dayOfWeek}, dia ${day} de ${month}`;
}

/**
 * Retorna um array com os próximos N dias a partir de amanhã
 */
export function getNextDays(count: number = 3, startDate: Date = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + i);
    days.push(nextDate);
  }
  return days;
}

/**
 * Converte data para string YYYY-MM-DD
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata data ISO para exibição curta: "21/09/2026"
 */
export function formatShortDate(isoDateString: string): string {
  if (!isoDateString) return '';
  const [year, month, day] = isoDateString.split('-');
  return `${day}/${month}/${year}`;
}
