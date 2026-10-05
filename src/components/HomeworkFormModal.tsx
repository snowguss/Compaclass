import React, { useState, useEffect } from 'react';
import { ClassGroup, HomeworkAssignment } from '../types';
import { X, BookCheck, Calendar, Save } from 'lucide-react';
import { getClassColorHex } from '../utils/colorUtils';
import { getNextClassDateFormatted } from '../utils/messageUtils';
import { getTodayDateString } from '../utils/dateUtils';

interface HomeworkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: {
      classId: string;
      title: string;
      dueDate: string;
      notes?: string;
      assignedDate?: string;
    },
    editingId?: string
  ) => void;
  editingHomework: HomeworkAssignment | null;
  classes: ClassGroup[];
  preselectedClassId?: string;
}

export const HomeworkFormModal: React.FC<HomeworkFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHomework,
  classes,
  preselectedClassId
}) => {
  const [classId, setClassId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [assignedDate, setAssignedDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingHomework) {
      setClassId(editingHomework.classId);
      setTitle(editingHomework.title);
      setDueDate(editingHomework.dueDate);
      setAssignedDate(editingHomework.assignedDate || getTodayDateString());
      setNotes(editingHomework.notes || '');
    } else {
      const defaultClassId = preselectedClassId || (classes.length > 0 ? classes[0].id : '');
      setClassId(defaultClassId);
      setTitle('');
      setNotes('');
      setAssignedDate(getTodayDateString());

      if (defaultClassId) {
        const cls = classes.find(c => c.id === defaultClassId);
        if (cls) {
          setDueDate(getNextClassDateFormatted(cls.daysOfWeek));
        } else {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    }
  }, [editingHomework, isOpen, preselectedClassId, classes]);

  if (!isOpen) return null;

  const selectedClass = classes.find(c => c.id === classId);

  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    if (!editingHomework) {
      const cls = classes.find(c => c.id === newClassId);
      if (cls) {
        setDueDate(getNextClassDateFormatted(cls.daysOfWeek));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !title.trim()) return;

    onSave(
      {
        classId,
        title: title.trim(),
        dueDate: dueDate.trim() || 'Próxima aula',
        notes: notes.trim() || undefined,
        assignedDate
      },
      editingHomework ? editingHomework.id : undefined
    );
  };

  return (
    <div
      id="homework-form-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
    >
      <div
        id="homework-form-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 transition-colors"
      >
        {/* Top Header */}
        <div className="bg-[#002B49] dark:bg-slate-850 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {editingHomework ? 'Editar Tarefa de Casa' : 'Nova Tarefa de Casa'}
              </h3>
              <p className="text-xs text-sky-200/90 font-medium">
                Controle de entrega e correção por aluno
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            id="btn-close-homework-modal"
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Seleção de Turma */}
          <div>
            <label htmlFor="homework-class-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Turma *
            </label>
            <div className="space-y-2">
              <select
                id="homework-class-select"
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 outline-hidden transition-all shadow-2xs"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.code} — {cls.name} ({cls.students.length} alunos)
                  </option>
                ))}
              </select>

              {selectedClass && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span
                    style={{ backgroundColor: getClassColorHex(selectedClass.color) }}
                    className="w-3 h-3 rounded-full shrink-0"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedClass.students.length} alunos inscritos nesta turma
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Título / Conteúdo da Tarefa */}
          <div>
            <label htmlFor="homework-title-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição da Tarefa *
            </label>
            <input
              type="text"
              id="homework-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Workbook págs. 14 e 15 (exercícios 1 a 4)"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>

          {/* Data em que foi passada & Data de Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="homework-assigned-date" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Passada em:
              </label>
              <input
                type="date"
                id="homework-assigned-date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="homework-due-date" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Data de Entrega *
                </label>
                {selectedClass && (
                  <button
                    type="button"
                    onClick={() => setDueDate(getNextClassDateFormatted(selectedClass.daysOfWeek))}
                    className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sugerir Próx. Aula
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="homework-due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="Ex: 23/09 ou Próxima aula"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label htmlFor="homework-notes-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Instruções (Opcional)
            </label>
            <textarea
              id="homework-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cobrar a pronúncia dos verbos no passado na próxima aula."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs resize-none"
            />
          </div>

          {/* Footer com Ações */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-homework"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-homework"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingHomework ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
