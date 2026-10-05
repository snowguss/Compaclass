import { WEEKDAYS_SHORT_PT } from './dateUtils';

/**
 * Encontra a próxima data de aula a partir de uma data base e dos dias da semana da turma.
 * Retorna no formato "DD/MM" (ex: "23/09").
 */
export function getNextClassDateFormatted(daysOfWeek: number[], baseDateStr?: string): string {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}`;
  }

  const baseDate = baseDateStr ? new Date(`${baseDateStr}T12:00:00`) : new Date();
  
  // Procura nos próximos 14 dias o primeiro dia que casa com a grade da turma
  for (let i = 1; i <= 14; i++) {
    const candidate = new Date(baseDate);
    candidate.setDate(baseDate.getDate() + i);
    if (daysOfWeek.includes(candidate.getDay())) {
      const d = String(candidate.getDate()).padStart(2, '0');
      const m = String(candidate.getMonth() + 1).padStart(2, '0');
      const dayName = WEEKDAYS_SHORT_PT[candidate.getDay()];
      return `${d}/${m} (${dayName})`;
    }
  }

  const fallback = new Date(baseDate);
  fallback.setDate(baseDate.getDate() + 1);
  const d = String(fallback.getDate()).padStart(2, '0');
  const m = String(fallback.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

export interface WeeklyMessageParams {
  lessonTitle: string; // Ex: "Lesson 2 - Sit. 1 e 2" ou "Lesson 2 - Completamos ✅"
  isCompletedLesson?: boolean;
  hasHomework: boolean;
  homework?: string;
  homeworkDueDate?: string; // Ex: "23/09"
}

/**
 * Gera a mensagem semanal para ser enviada aos alunos / pais pelo WhatsApp
 */
export function generateWeeklyClassMessage(params: WeeklyMessageParams): string {
  const { lessonTitle, isCompletedLesson, hasHomework, homework, homeworkDueDate } = params;

  // Formatação do trecho da Lesson
  let formattedLesson = lessonTitle.trim();
  if (isCompletedLesson && !formattedLesson.includes('Completamos ✅')) {
    // Se marcou que completou e ainda não consta no título
    const match = formattedLesson.match(/Lesson\s*\d+/i);
    if (match) {
      formattedLesson = `${match[0]} - Completamos ✅`;
    } else {
      formattedLesson = `${formattedLesson} - Completamos ✅`;
    }
  }

  if (hasHomework && homework && homework.trim().length > 0) {
    const deliveryPart = homeworkDueDate && homeworkDueDate.trim().length > 0
      ? `, entregar no dia ${homeworkDueDate.trim()}`
      : '';

    return `Oi, pessoal! Como vão? Vamos repassar nossa semana? \n\n📍 ${formattedLesson}\n\nTarefa de casa: Sim! ${homework.trim()}${deliveryPart}\n\nDicas:\n\n- Faça o Listening como se fosse na prova, sem distrações e sem pausas. Assim você vai estar mais preparado!\n\n- Qualquer dúvida sobre a tarefa ou alguma atividade, pode me chamar no privado!\n\nNos vemos na próxima aula!`;
  }

  return `Oi, pessoal! Como vão? Vamos repassar nossa semana? \n\n📍 ${formattedLesson}\n\nTarefa de casa: Não!\n\nNos vemos na próxima aula!`;
}
