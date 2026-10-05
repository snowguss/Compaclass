import React from 'react';
import { ClassGroup, LessonRecord } from '../types';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { getClassColorHex } from '../utils/colorUtils';

interface ClassCardProps {
  classGroup: ClassGroup;
  lastLesson?: LessonRecord;
  todayLesson?: LessonRecord;
  dateStr?: string;
  isToday?: boolean;
  onClick: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classGroup,
  lastLesson,
  todayLesson,
  isToday = false,
  onClick
}) => {
  const bgHex = getClassColorHex(classGroup.color);

  // Determina o texto de exibição da lição
  const displayLessonTitle = isToday
    ? todayLesson?.title || classGroup.currentLessonPlan || (lastLesson ? `Próx: ${lastLesson.title}` : 'Planejar Aula')
    : classGroup.currentLessonPlan || 'Aula Regular';

  const isRecordedToday = !!todayLesson;

  return (
    <div
      onClick={onClick}
      id={`class-card-${classGroup.id}`}
      className="group relative flex items-stretch overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer active:scale-[0.99]"
    >
      {/* Badge da Turma (Estilo Cápsula do Rascunho) */}
      <div
        style={{ backgroundColor: bgHex }}
        className="w-28 sm:w-32 shrink-0 flex flex-col items-center justify-center p-3 text-center text-white transition-colors"
      >
        <span className="text-base sm:text-lg font-extrabold tracking-wide uppercase drop-shadow-2xs">
          {classGroup.code}
        </span>
        <span className="text-[10px] font-medium tracking-tight text-white/90 line-clamp-1 max-w-full px-1">
          {classGroup.students.length} alunos
        </span>
      </div>

      {/* Conteúdo da Aula */}
      <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate group-hover:text-[#002B49] dark:group-hover:text-sky-400 transition-colors">
              {displayLessonTitle}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {classGroup.name}
            </p>
          </div>

          {/* Status para hoje */}
          {isToday && (
            <div>
              {isRecordedToday ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Registrada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Pendente
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metadados: Horário e Ação */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {classGroup.startTime} - {classGroup.endTime}
            </span>
          </div>

          <div className="flex items-center text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            <span className="text-[11px] font-medium mr-0.5 hidden xs:inline">
              {isToday ? (isRecordedToday ? 'Ver diário' : 'Registrar') : 'Detalhes'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
