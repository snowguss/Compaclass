import React, { useState } from 'react';
import { ClassGroup, LessonRecord } from '../types';
import { Plus, Search, Calendar, Clock, ChevronRight } from 'lucide-react';
import { WEEKDAYS_SHORT_PT } from '../utils/dateUtils';
import { getClassColorHex } from '../utils/colorUtils';

interface ClassesViewProps {
  classes: ClassGroup[];
  lessons: LessonRecord[];
  onOpenClassDetail: (classGroup: ClassGroup) => void;
  onOpenNewClassModal: () => void;
  onOpenLessonModal: (classGroup: ClassGroup, dateStr: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  lessons,
  onOpenClassDetail,
  onOpenNewClassModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.students.some(s => s.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Turmas & Histórico
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {classes.length} {classes.length === 1 ? 'turma cadastrada' : 'turmas cadastradas'}
          </span>
        </div>

        <button
          onClick={onOpenNewClassModal}
          id="btn-add-class"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Turma</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por turma (ESPI2, TT8) ou nome de aluno..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/10 dark:focus:ring-sky-400/20 outline-hidden transition-all shadow-xs"
        />
      </div>

      {/* Lista de Turmas */}
      <div className="space-y-3">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classGroup) => {
            const classLessons = lessons.filter(l => l.classId === classGroup.id);
            const daysLabel = classGroup.daysOfWeek.map(d => WEEKDAYS_SHORT_PT[d]).join(' e ');

            return (
              <div
                key={classGroup.id}
                onClick={() => onOpenClassDetail(classGroup)}
                className="group relative bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div 
                      style={{ backgroundColor: getClassColorHex(classGroup.color) }}
                      className="w-14 h-14 rounded-xl text-white font-extrabold flex flex-col items-center justify-center text-center p-1 shrink-0 shadow-xs"
                    >
                      <span className="text-xs tracking-wider uppercase">{classGroup.code}</span>
                      <span className="text-[9px] font-medium text-white/90">{classGroup.students.length} al.</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-[#002B49] dark:group-hover:text-sky-400 transition-colors truncate">
                        {classGroup.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          {daysLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          {classGroup.startTime} - {classGroup.endTime} ({classGroup.durationMinutes} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 mt-2" />
                </div>

                {/* Rodapé do card: Última lição dada e aulas dadas */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[220px] sm:max-w-md font-medium">
                    <strong className="text-slate-700 dark:text-slate-200 font-semibold">Última dada:</strong> {classGroup.currentLessonPlan || 'Nenhuma registrada'}
                  </span>

                  <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800/60 shrink-0 ml-2">
                    {classLessons.length} {classLessons.length === 1 ? 'aula registrada' : 'aulas registradas'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            Nenhuma turma encontrada com "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
