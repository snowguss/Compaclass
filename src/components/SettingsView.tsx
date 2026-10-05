import React, { useState } from 'react';
import { ClassGroup, TeacherProfile } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Calendar, 
  Clock, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { WEEKDAYS_SHORT_PT } from '../utils/dateUtils';
import { getClassColorHex } from '../utils/colorUtils';

interface SettingsViewProps {
  classes: ClassGroup[];
  teacher: TeacherProfile;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onSaveTeacher: (teacher: TeacherProfile) => void;
  onOpenNewClassModal: () => void;
  onEditClass: (classGroup: ClassGroup) => void;
  onDeleteClass: (classId: string) => void;
  onResetDefaults: () => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  classes,
  teacher,
  darkMode = false,
  onToggleDarkMode,
  onSaveTeacher,
  onOpenNewClassModal,
  onEditClass,
  onDeleteClass,
  onResetDefaults,
  onExportData,
  onImportData
}) => {
  const [teacherName, setTeacherName] = useState(teacher.name);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isSavedTeacher, setIsSavedTeacher] = useState(false);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassGroup | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTeacher({
      ...teacher,
      name: teacherName.trim(),
    });
    setIsSavedTeacher(true);
    setIsTeacherOpen(false);
    setTimeout(() => setIsSavedTeacher(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-12 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configurações & Gestão de Turmas
        </h2>
      </div>

      {/* SEÇÃO 1: PERFIL DO PROFESSOR (TOGGLE / RETRÁTIL ACIMA DE TURMAS CADASTRADAS) */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setIsTeacherOpen(!isTeacherOpen)}
          aria-expanded={isTeacherOpen}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#002B49]/10 dark:bg-sky-400/15 text-[#002B49] dark:text-sky-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Professor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold truncate max-w-[200px]">
                  {teacher.name || teacherName || 'Não informado'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {isTeacherOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {isTeacherOpen && (
          <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-3 border-t border-slate-100 dark:border-slate-700/60">
            <form onSubmit={handleTeacherSubmit} className="space-y-3 pt-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nome do Professor
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Nome do professor"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:border-[#002B49] dark:focus:border-sky-400 outline-hidden transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsTeacherOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#001f35] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* SEÇÃO 2: ALIMENTAR / GERENCIAR BASE DE DADOS DAS TURMAS (TOGGLE/RETRÁTIL) */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setIsClassesOpen(!isClassesOpen)}
          aria-expanded={isClassesOpen}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#002B49]/10 dark:bg-sky-400/15 text-[#002B49] dark:text-sky-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Turmas cadastradas
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  {classes.length} {classes.length === 1 ? 'turma' : 'turmas'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {isClassesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {isClassesOpen && (
          <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-4 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {classes.length} turmas ativas na base de dados
              </span>
              <button
                type="button"
                onClick={onOpenNewClassModal}
                id="btn-new-class-settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#002B49] hover:bg-[#001f35] text-white font-bold text-xs shadow-xs transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Nova Turma
              </button>
            </div>

            {/* Lista de Turmas Configuradas */}
            <div className="space-y-2.5">
              {classes.map((cls) => {
                const daysLabel = cls.daysOfWeek.map(d => WEEKDAYS_SHORT_PT[d]).join(' e ');

                return (
                  <div
                    key={cls.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        style={{ backgroundColor: getClassColorHex(cls.color) }}
                        className="w-12 h-10 rounded-lg text-white text-xs font-black flex items-center justify-center uppercase tracking-wider shrink-0 shadow-2xs"
                      >
                        {cls.code}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {cls.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {daysLabel} ({cls.daysOfWeek.length}x/sem)
                          </span>
                          <span>•</span>
                          <span>
                            {cls.startTime} às {cls.endTime} ({cls.durationMinutes} min)
                          </span>
                          <span>•</span>
                          <span>{cls.students.length} alunos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => onEditClass(cls)}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#002B49] dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Editar dias, horários e alunos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClassToDelete(cls);
                        }}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs cursor-pointer"
                        title="Excluir turma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* SEÇÃO 3: MODO NOTURNO (LIGA E DESLIGA) */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-sky-400/15 text-amber-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Modo Noturno
              </h3>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={onToggleDarkMode}
            id="toggle-dark-mode-btn"
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              darkMode ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* SEÇÃO 4: BACKUP E RESTAURAÇÃO DE DADOS */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Gerenciamento e Backup dos Dados
        </h3>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={onExportData}
            id="btn-export-backup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
            Exportar Backup (JSON)
          </button>

          <label 
            id="label-import-backup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
            Importar Backup (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-semibold text-xs transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Restaurar Demonstração CCAA
          </button>
        </div>
      </section>

      {/* Modal de Confirmação para Exclusão de Turma */}
      {classToDelete && (
        <div 
          id="confirm-delete-class-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  Excluir turma {classToDelete.code}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {classToDelete.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 rounded-2xl p-3.5 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                <span>⚠️</span> Aviso importante:
              </p>
              <p className="leading-relaxed text-rose-800 dark:text-rose-300">
                Ao excluir esta turma, <strong>todas as aulas lançadas, chamadas e diários registrados para ela serão apagados permanentemente</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete-class"
                onClick={() => {
                  onDeleteClass(classToDelete.id);
                  setClassToDelete(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Sim, apagar turma e aulas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Restaurar Demonstração */}
      {showResetConfirm && (
        <div 
          id="confirm-reset-demo-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  Restaurar dados de demonstração?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Esta ação substituirá os dados atuais pelos exemplos padrão do CCAA.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-3 rounded-2xl">
              Suas turmas e histórico atuais serão substituídos pelas turmas de teste do CCAA. Recomendamos exportar um backup antes caso deseje guardar seus dados.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDefaults();
                  setShowResetConfirm(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Demonstração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
