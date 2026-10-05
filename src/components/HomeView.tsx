import React from 'react';
import { ClassGroup, LessonRecord } from '../types';
import { ClassCard } from './ClassCard';
import { getNextDays, formatUpcomingDayHeader, toISODate, getTodayDateString } from '../utils/dateUtils';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  classes: ClassGroup[];
  lessons: LessonRecord[];
  currentDate?: Date;
  onSelectClassForLesson: (classGroup: ClassGroup, dateStr: string) => void;
  onGoToClassesTab: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  classes,
  lessons,
  currentDate = new Date(),
  onSelectClassForLesson,
  onGoToClassesTab
}) => {
  const todayDayOfWeek = currentDate.getDay();
  const todayDateStr = getTodayDateString();

  // Turmas de hoje
  const todayClasses = classes
    .filter(c => c.daysOfWeek.includes(todayDayOfWeek))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Próximo dia com turmas (ou próximo dia se não houver turmas agendadas)
  const nextDayDate = React.useMemo(() => {
    const upcomingDays = getNextDays(7, currentDate);
    const dayWithClasses = upcomingDays.find(d => 
      classes.some(c => c.daysOfWeek.includes(d.getDay()))
    );
    return dayWithClasses || upcomingDays[0];
  }, [classes, currentDate]);

  // Helper para buscar última aula
  const getLastLessonForClass = (classId: string, beforeDate?: string) => {
    const classLessons = lessons.filter(l => l.classId === classId);
    if (classLessons.length === 0) return undefined;
    const sorted = [...classLessons].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (beforeDate) {
      const beforeTime = new Date(beforeDate).getTime();
      return sorted.find(l => new Date(l.date).getTime() < beforeTime);
    }
    return sorted[0];
  };

  // Helper para buscar aula de hoje
  const getTodayLessonForClass = (classId: string) => {
    return lessons.find(l => l.classId === classId && l.date === todayDateStr);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* SEÇÃO: Turmas de Hoje */}
      <section id="section-today-classes">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Turmas de Hoje
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#002B49] dark:bg-sky-600 text-white">
              {todayClasses.length}
            </span>
          </div>

          {todayClasses.length > 0 && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {todayClasses.filter(c => getTodayLessonForClass(c.id)).length} de {todayClasses.length} registradas
            </span>
          )}
        </div>

        {todayClasses.length > 0 ? (
          <div className="space-y-2.5">
            {todayClasses.map((classGroup) => {
              const lastLesson = getLastLessonForClass(classGroup.id, todayDateStr);
              const todayLesson = getTodayLessonForClass(classGroup.id);

              return (
                <ClassCard
                  key={`today-${classGroup.id}`}
                  classGroup={classGroup}
                  lastLesson={lastLesson}
                  todayLesson={todayLesson}
                  dateStr={todayDateStr}
                  isToday={true}
                  onClick={() => onSelectClassForLesson(classGroup, todayDateStr)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 text-center shadow-xs transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-700 text-[#002B49] dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
              Nenhuma turma para hoje
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Você não tem aulas agendadas para este dia. Aproveite para planejar os próximos dias!
            </p>
            <button
              onClick={onGoToClassesTab}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#002B49] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Ver todas as turmas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* SEÇÃO: Próximas turmas (Próximo dia) */}
      <section id="section-upcoming-classes">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Próximas turmas
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Próximo dia
          </span>
        </div>

        {(() => {
          const dayOfWeek = nextDayDate.getDay();
          const dateStr = toISODate(nextDayDate);
          const dayClasses = classes
            .filter(c => c.daysOfWeek.includes(dayOfWeek))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={dateStr} className="space-y-2">
              {/* Subtítulo da data: e.g. "terça-feira, dia 22 de setembro" */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 capitalize">
                  {formatUpcomingDayHeader(nextDayDate)}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {dayClasses.length} {dayClasses.length === 1 ? 'aula' : 'aulas'}
                </span>
              </div>

              {dayClasses.length > 0 ? (
                <div className="space-y-2">
                  {dayClasses.map((classGroup) => {
                    const lastLesson = getLastLessonForClass(classGroup.id, dateStr);
                    const existingRecordForDay = lessons.find(l => l.classId === classGroup.id && l.date === dateStr);

                    return (
                      <ClassCard
                        key={`${dateStr}-${classGroup.id}`}
                        classGroup={classGroup}
                        lastLesson={lastLesson}
                        todayLesson={existingRecordForDay}
                        dateStr={dateStr}
                        isToday={false}
                        onClick={() => onSelectClassForLesson(classGroup, dateStr)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Sem aulas agendadas para este dia
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
};
