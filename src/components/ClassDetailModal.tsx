import React, { useState } from 'react';
import { ClassGroup, LessonRecord } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Plus, 
  Edit3, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { WEEKDAYS_SHORT_PT, formatShortDate } from '../utils/dateUtils';
import { getClassColorHex } from '../utils/colorUtils';
import { generateWeeklyClassMessage, getNextClassDateFormatted } from '../utils/messageUtils';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroup | null;
  lessons: LessonRecord[];
  onOpenLessonModal: (classGroup: ClassGroup, dateStr: string) => void;
  onEditClass: (classGroup: ClassGroup) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classGroup,
  lessons,
  onOpenLessonModal,
  onEditClass
}) => {
  if (!isOpen || !classGroup) return null;

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'students'>('history');
  const [copiedLessonId, setCopiedLessonId] = useState<string | null>(null);

  const handleCopyLessonMessage = async (lesson: LessonRecord) => {
    const isCompletedLesson = !!lesson.isCompletedLesson || lesson.title.includes('Completamos ✅');
    const hasHomework = !!lesson.homework && lesson.homework.trim().length > 0;
    const defaultDueDate = getNextClassDateFormatted(classGroup.daysOfWeek, lesson.date);

    const message = generateWeeklyClassMessage({
      lessonTitle: lesson.title,
      isCompletedLesson,
      hasHomework,
      homework: lesson.homework,
      homeworkDueDate: lesson.homeworkDueDate || defaultDueDate
    });

    try {
      await navigator.clipboard.writeText(message);
      setCopiedLessonId(lesson.id);
      setTimeout(() => setCopiedLessonId(null), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  // Filtrar e ordenar as aulas desta turma
  const classLessons = lessons
    .filter(l => l.classId === classGroup.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Dias da semana formatados
  const formattedDays = classGroup.daysOfWeek
    .map(d => WEEKDAYS_SHORT_PT[d])
    .join(' e ');

  // Cálculo de faltas por aluno
  const studentAbsenceMap = new Map<string, number>();
  classGroup.students.forEach(s => studentAbsenceMap.set(s.id, 0));
  classLessons.forEach(lesson => {
    lesson.absentStudentIds.forEach(id => {
      studentAbsenceMap.set(id, (studentAbsenceMap.get(id) || 0) + 1);
    });
  });

  const totalLessonsCount = classLessons.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const hasLessonToday = classLessons.some(l => l.date === todayStr);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="class-detail-dialog"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div 
          style={{ backgroundColor: getClassColorHex(classGroup.color) }}
          className="text-white p-5 sm:p-6 relative transition-colors"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-white text-slate-900 shadow-2xs">
              {classGroup.code}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {classGroup.daysOfWeek.length}x na semana ({formattedDays})
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {classGroup.name}
          </h3>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs text-white/90">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/80" />
              {classGroup.startTime} - {classGroup.endTime} ({classGroup.durationMinutes} min/aula)
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-white/80" />
              {classGroup.students.length} alunos
            </span>
            {classGroup.currentLessonPlan && (
              <span className="flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-lg font-bold">
                <BookOpen className="w-3.5 h-3.5 text-white/90" />
                Última lição: {classGroup.currentLessonPlan}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                onOpenLessonModal(classGroup, todayStr);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {hasLessonToday ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Editar Aula de Hoje
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Lançar Aula Hoje
                </>
              )}
            </button>
            <button
              onClick={() => onEditClass(classGroup)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Turma
            </button>
          </div>
        </div>

        {/* Sub-Abas do Modal: Histórico de Aulas vs Alunos & Presenças */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50 dark:bg-slate-850 gap-4">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === 'history'
                ? 'border-[#002B49] dark:border-sky-400 text-[#002B49] dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Histórico do Diário ({classLessons.length} aulas)
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === 'students'
                ? 'border-[#002B49] dark:border-sky-400 text-[#002B49] dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Lista de Alunos & Faltas ({classGroup.students.length})
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          {activeSubTab === 'history' ? (
            <div className="space-y-3">
              {classLessons.length > 0 ? (
                classLessons.map((lesson) => {
                  const absentStudents = classGroup.students.filter(s =>
                    lesson.absentStudentIds.includes(s.id)
                  );

                  return (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          {formatShortDate(lesson.date)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {classGroup.students.length - lesson.absentStudentIds.length} presentes • {lesson.absentStudentIds.length} faltas
                          </span>

                          <button
                            type="button"
                            id={`btn-copy-lesson-msg-${lesson.id}`}
                            onClick={() => handleCopyLessonMessage(lesson)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-2xs cursor-pointer"
                            title="Copiar mensagem semanal da aula para WhatsApp"
                          >
                            {copiedLessonId === lesson.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-700 dark:text-emerald-400">Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#002B49] dark:text-sky-400" />
                                <span>Copiar Msg</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            id={`btn-edit-lesson-${lesson.id}`}
                            onClick={() => onOpenLessonModal(classGroup, lesson.date)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 transition-all active:scale-95 shadow-2xs cursor-pointer"
                            title="Editar esta aula"
                            aria-label={`Editar aula do dia ${formatShortDate(lesson.date)}`}
                          >
                            <Edit3 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {lesson.title}
                      </h4>

                      {lesson.homework && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-100 dark:border-amber-900/60">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span><strong className="font-semibold">Homework:</strong> {lesson.homework}</span>
                        </div>
                      )}

                      {/* Alunos que faltaram */}
                      <div className="pt-1 text-xs">
                        {absentStudents.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">Faltas:</span>
                            {absentStudents.map(s => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-medium border border-rose-200 dark:border-rose-900/60"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            100% de presença
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Nenhuma aula registrada ainda para esta turma. Clique em "Lançar Aula Hoje" para começar!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Acompanhamento acumulado de frequência com base nas {totalLessonsCount} aulas registradas:
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {classGroup.students.map((student) => {
                  const absences = studentAbsenceMap.get(student.id) || 0;
                  const presences = totalLessonsCount > 0 ? totalLessonsCount - absences : 0;
                  const presencePct = totalLessonsCount > 0 
                    ? Math.round((presences / totalLessonsCount) * 100) 
                    : 100;

                  return (
                    <div key={student.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {presences} presenças • {absences} faltas
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            presencePct >= 85
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              : presencePct >= 75
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {totalLessonsCount > 0 ? `${presencePct}% freq.` : '100%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
