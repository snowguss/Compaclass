import React, { useState, useMemo } from 'react';
import { ClassGroup, HomeworkAssignment } from '../types';
import { 
  BookCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  FileCheck2, 
  Users 
} from 'lucide-react';
import { getClassColorHex } from '../utils/colorUtils';
import { formatShortDate } from '../utils/dateUtils';

interface HomeworkViewProps {
  homeworkList: HomeworkAssignment[];
  classes: ClassGroup[];
  onOpenNewHomeworkModal: (preselectedClassId?: string) => void;
  onEditHomework: (homework: HomeworkAssignment) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onToggleStudentDelivered: (homeworkId: string, studentId: string) => void;
  onToggleStudentCorrected: (homeworkId: string, studentId: string) => void;
  onMarkAllDelivered: (homeworkId: string, delivered: boolean) => void;
  onMarkAllCorrected: (homeworkId: string, corrected: boolean) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  homeworkList,
  classes,
  onOpenNewHomeworkModal,
  onEditHomework,
  onDeleteHomework,
  onToggleStudentDelivered,
  onToggleStudentCorrected,
  onMarkAllDelivered,
  onMarkAllCorrected
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_delivery' | 'pending_correction' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedHomeworkIds, setExpandedHomeworkIds] = useState<Record<string, boolean>>({});
  const [homeworkToDelete, setHomeworkToDelete] = useState<HomeworkAssignment | null>(null);

  // Mapeamento rápido de id para ClassGroup
  const classMap = useMemo(() => {
    const map = new Map<string, ClassGroup>();
    classes.forEach(c => map.set(c.id, c));
    return map;
  }, [classes]);

  // Toggle de expansão do card
  const toggleExpand = (hwId: string) => {
    setExpandedHomeworkIds(prev => ({
      ...prev,
      [hwId]: !prev[hwId]
    }));
  };

  // Filtragem
  const filteredHomework = useMemo(() => {
    return homeworkList.filter(hw => {
      // Filtro de turma
      if (selectedClassFilter !== 'all' && hw.classId !== selectedClassFilter) {
        return false;
      }

      const cls = classMap.get(hw.classId);
      const studentCount = cls ? cls.students.length : Object.keys(hw.submissions).length;
      const submissionsList = Object.values(hw.submissions);
      const deliveredCount = submissionsList.filter(s => s.delivered).length;
      const correctedCount = submissionsList.filter(s => s.corrected).length;
      const isComplete = studentCount > 0 && deliveredCount === studentCount && correctedCount === studentCount;
      const hasPendingDelivery = studentCount > 0 && deliveredCount < studentCount;
      const hasPendingCorrection = submissionsList.some(s => s.delivered && !s.corrected);

      // Filtro de status
      if (statusFilter === 'completed' && !isComplete) return false;
      if (statusFilter === 'pending_delivery' && !hasPendingDelivery) return false;
      if (statusFilter === 'pending_correction' && !hasPendingCorrection) return false;

      // Filtro de busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = hw.title.toLowerCase().includes(q);
        const matchesClassCode = cls?.code.toLowerCase().includes(q);
        const matchesClassName = cls?.name.toLowerCase().includes(q);
        const matchesDueDate = hw.dueDate.toLowerCase().includes(q);
        if (!matchesTitle && !matchesClassCode && !matchesClassName && !matchesDueDate) {
          return false;
        }
      }

      return true;
    });
  }, [homeworkList, selectedClassFilter, statusFilter, searchQuery, classMap]);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Controle de Tarefas
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewHomeworkModal(selectedClassFilter !== 'all' ? selectedClassFilter : undefined)}
          id="btn-add-homework"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-xs space-y-3">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tarefa, turma ou data de entrega..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:bg-white dark:focus:bg-slate-800 focus:border-[#002B49] dark:focus:border-sky-400 outline-hidden transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Chips de Turmas */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Filtrar por Turma:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedClassFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                selectedClassFilter === 'all'
                  ? 'bg-[#002B49] dark:bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Todas ({homeworkList.length})
            </button>
            {classes.map((cls) => {
              const count = homeworkList.filter(h => h.classId === cls.id).length;
              const isSelected = selectedClassFilter === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'border-[#002B49] dark:border-sky-500 bg-[#002B49] dark:bg-sky-600 text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    style={{ backgroundColor: getClassColorHex(cls.color) }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                  <span>{cls.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending_delivery')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'pending_delivery'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            Entrega
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending_correction')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'pending_correction'
                ? 'bg-sky-600 text-white'
                : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
            }`}
          >
            Correção
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Concluída
          </button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      {filteredHomework.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#002B49]/10 dark:bg-sky-400/15 text-[#002B49] dark:text-sky-400 flex items-center justify-center mx-auto">
            <BookCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedClassFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros ou termo de busca acima.'
              : 'As tarefas lançadas na tela de Início (com data de entrega) aparecerão aqui automaticamente, ou você pode criar uma agora.'}
          </p>
          <button
            type="button"
            onClick={() => onOpenNewHomeworkModal(selectedClassFilter !== 'all' ? selectedClassFilter : undefined)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Primeira Tarefa
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHomework.map((hw) => {
            const cls = classMap.get(hw.classId);
            const students = cls ? cls.students : [];
            const isExpanded = expandedHomeworkIds[hw.id] ?? false; // por padrão recolhido
            
            const totalStudents = students.length;
            const deliveredCount = students.filter(s => hw.submissions[s.id]?.delivered).length;
            const correctedCount = students.filter(s => hw.submissions[s.id]?.corrected).length;
            const deliveryPercent = totalStudents > 0 ? Math.round((deliveredCount / totalStudents) * 100) : 0;
            const isAllDelivered = totalStudents > 0 && deliveredCount === totalStudents;
            const isAllCorrected = totalStudents > 0 && correctedCount === totalStudents;

            return (
              <div
                key={hw.id}
                id={`homework-card-${hw.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-colors"
              >
                {/* Header do Card */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {cls && (
                        <span
                          style={{ backgroundColor: getClassColorHex(cls.color) }}
                          className="px-2.5 py-1 rounded-lg text-white text-xs font-black uppercase tracking-wider shrink-0 shadow-2xs mt-0.5"
                        >
                          {cls.code}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                            {hw.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cls ? cls.name : 'Turma'}
                        </p>
                      </div>
                    </div>

                    {/* Ações de Edição e Exclusão */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditHomework(hw)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Editar tarefa"
                        aria-label="Editar tarefa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeworkToDelete(hw)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Excluir tarefa"
                        aria-label="Excluir tarefa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Passada em: <strong className="text-slate-700 dark:text-slate-200">{formatShortDate(hw.assignedDate)}</strong></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Entrega: <strong className="text-sky-700 dark:text-sky-300 font-bold">{hw.dueDate}</strong></span>
                    </div>
                  </div>

                  {hw.notes && (
                    <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300">
                      <strong>Obs:</strong> {hw.notes}
                    </div>
                  )}

                  {/* Barra de Progresso de Entregas */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Progresso de Entregas</span>
                      <span>{deliveredCount} de {totalStudents} alunos ({deliveryPercent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isAllDelivered ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${deliveryPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-Header com Ações em Massa e Toggle de Expansão */}
                <div className={`bg-slate-50/70 dark:bg-slate-850 px-4 py-2.5 flex items-center justify-between gap-2 ${isExpanded ? 'border-b border-slate-100 dark:border-slate-700/60' : ''} flex-wrap`}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Lista de Alunos ({students.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onMarkAllDelivered(hw.id, !isAllDelivered)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      {isAllDelivered ? 'Desmarcar Entregas' : 'Todos Entregaram'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onMarkAllCorrected(hw.id, !isAllCorrected)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      {isAllCorrected ? 'Desmarcar Correções' : 'Todos Corrigidos'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(hw.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      title={isExpanded ? 'Recolher lista' : 'Expandir lista'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Lista de Alunos com Controle Individual de Entrega e Correção */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-700/60">
                    {students.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-2 text-center">
                        Nenhum aluno cadastrado nesta turma.
                      </p>
                    ) : (
                      students.map((student) => {
                        const sub = hw.submissions[student.id] || {
                          studentId: student.id,
                          delivered: false,
                          corrected: false
                        };

                        return (
                          <div
                            key={student.id}
                            className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                                {student.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {sub.delivered
                                  ? sub.corrected
                                    ? 'Entregue e Corrigido ✅'
                                    : 'Entregue • Aguardando correção'
                                  : 'Pendente de entrega'}
                              </span>
                            </div>

                            {/* Controles de Entrega e Correção */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Botão Entregou */}
                              <button
                                type="button"
                                onClick={() => onToggleStudentDelivered(hw.id, student.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  sub.delivered
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                                title={sub.delivered ? 'Clique para desmarcar entrega' : 'Clique para marcar como entregue'}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${sub.delivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                                <span className="hidden xs:inline">
                                  {sub.delivered ? 'Entregou' : 'Pendente'}
                                </span>
                              </button>

                              {/* Botão Corrigido */}
                              <button
                                type="button"
                                onClick={() => onToggleStudentCorrected(hw.id, student.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  sub.corrected
                                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                                title={sub.corrected ? 'Clique para desmarcar correção' : 'Clique para marcar como corrigido'}
                              >
                                <FileCheck2 className={`w-3.5 h-3.5 ${sub.corrected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                                <span className="hidden xs:inline">
                                  {sub.corrected ? 'Corrigido' : 'Corrigir'}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação para Exclusão de Tarefa */}
      {homeworkToDelete && (
        <div
          id="confirm-delete-homework-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Excluir Tarefa?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta ação removerá o registro desta tarefa e o histórico de entregas.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              {homeworkToDelete.title} ({homeworkToDelete.dueDate})
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHomeworkToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteHomework(homeworkToDelete.id);
                  setHomeworkToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
