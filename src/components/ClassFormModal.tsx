import React, { useState, useEffect } from 'react';
import { ClassGroup, Student } from '../types';
import { X, Plus, Trash2, Clock, Calendar, Users, BookOpen, Save, Sparkles, Palette, Check } from 'lucide-react';
import { PRESET_COLORS, getClassColorHex } from '../utils/colorUtils';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (classData: Omit<ClassGroup, 'id' | 'createdAt'>, editingId?: string) => void;
  editingClass?: ClassGroup | null;
}

const WEEKDAY_OPTIONS = [
  { day: 1, label: 'Seg', full: 'Segunda-feira' },
  { day: 2, label: 'Ter', full: 'Terça-feira' },
  { day: 3, label: 'Qua', full: 'Quarta-feira' },
  { day: 4, label: 'Qui', full: 'Quinta-feira' },
  { day: 5, label: 'Sex', full: 'Sexta-feira' },
  { day: 6, label: 'Sáb', full: 'Sábado' }
];

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSaveClass,
  editingClass
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState(editingClass?.code || '');
  const [name, setName] = useState(editingClass?.name || '');
  const [color, setColor] = useState(editingClass?.color || 'blue');
  const [customHex, setCustomHex] = useState(editingClass?.color?.startsWith('#') ? editingClass.color : '#002B49');
  const [showHexInput, setShowHexInput] = useState(editingClass?.color?.startsWith('#') || false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(editingClass?.daysOfWeek || [1, 3]);
  const [startTime, setStartTime] = useState(editingClass?.startTime || '14:00');
  const [endTime, setEndTime] = useState(editingClass?.endTime || '15:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(editingClass?.durationMinutes || 90);
  const [currentLessonPlan, setCurrentLessonPlan] = useState(editingClass?.currentLessonPlan || '');
  
  // Alunos
  const [students, setStudents] = useState<Student[]>(editingClass?.students || []);
  const [newStudentName, setNewStudentName] = useState('');

  // Calcula duração quando os horários mudam
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (endMinutes > startMinutes) {
        setDurationMinutes(endMinutes - startMinutes);
      }
    }
  }, [startTime, endTime]);

  const toggleDayOfWeek = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter(d => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const applySchedulePreset = (type: 'seg-qua' | 'ter-qui' | 'sab') => {
    if (type === 'seg-qua') setDaysOfWeek([1, 3]);
    if (type === 'ter-qui') setDaysOfWeek([2, 4]);
    if (type === 'sab') setDaysOfWeek([6]);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newStudentName.trim()
    };
    setStudents([...students, newStudent]);
    setNewStudentName('');
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onSaveClass(
      {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
        daysOfWeek,
        startTime,
        endTime,
        durationMinutes,
        currentLessonPlan: currentLessonPlan.trim(),
        students
      },
      editingClass?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="class-form-dialog"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#002B49] dark:bg-slate-800 text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 dark:border-slate-700">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 dark:text-sky-400">
              {editingClass ? 'Edição de Turma' : 'Nova Turma CCAA'}
            </span>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">
              {editingClass ? `Editar ${editingClass.code}` : 'Cadastrar Nova Turma'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          
          {/* Identificação da Turma */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Código <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ESPI2, TT8"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-sm font-bold uppercase outline-hidden"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Nome do Curso / Nível <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: English Speaking People 2"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-sm outline-hidden"
                required
              />
            </div>
          </div>

          {/* Cor de Identificação */}
          <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
                Cor de Identificação da Turma
              </label>
              
              <button
                type="button"
                onClick={() => setShowHexInput(!showHexInput)}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showHexInput ? 'Ocultar seletor HEX' : 'Selecionador HEX / Cor Livre'}</span>
              </button>
            </div>

            {/* Paleta com mais opções de cores */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {PRESET_COLORS.map((c) => {
                const isSelected = color === c.id || color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setColor(c.id);
                      setCustomHex(c.hex);
                    }}
                    title={`${c.label} (${c.hex})`}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all flex items-center justify-center text-white relative shadow-xs cursor-pointer ${
                      isSelected
                        ? 'ring-3 ring-offset-2 ring-slate-800 dark:ring-slate-100 scale-110 shadow-sm'
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Painel do Selecionador HEX */}
            {showHexInput && (
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs">
                  {/* Seletor Nativo de Cores do Sistema */}
                  <label className="relative cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span 
                      className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs inline-block shrink-0" 
                      style={{ backgroundColor: customHex }}
                    />
                    <input
                      type="color"
                      value={customHex.startsWith('#') ? customHex : '#002B49'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomHex(val);
                        setColor(val);
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      title="Escolher cor personalizada no seletor"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Abrir seletor</span>
                  </label>

                  <span className="text-slate-300 dark:text-slate-600">|</span>

                  {/* Input de texto HEX */}
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-400">#</span>
                    <input
                      type="text"
                      value={customHex.replace('#', '')}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                        const fullHex = `#${cleaned}`;
                        setCustomHex(fullHex);
                        if (cleaned.length === 6 || cleaned.length === 3) {
                          setColor(fullHex);
                        }
                      }}
                      placeholder="002B49"
                      maxLength={6}
                      className="w-20 px-1 text-xs font-mono font-bold uppercase focus:outline-hidden text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                </div>

                {/* Prévia da Cápsula */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Prévia da turma:</span>
                  <div 
                    className="px-3 py-1 rounded-lg text-white font-extrabold text-[11px] tracking-wide uppercase shadow-2xs"
                    style={{ backgroundColor: getClassColorHex(color) }}
                  >
                    {code || 'TURMA'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DIAS DA SEMANA */}
          <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
                Dias da Semana ({daysOfWeek.length}x na semana)
              </label>
              
              {/* Presets rápidos */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applySchedulePreset('seg-qua')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Seg/Qua (2x)
                </button>
                <button
                  type="button"
                  onClick={() => applySchedulePreset('ter-qui')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Ter/Qui (2x)
                </button>
                <button
                  type="button"
                  onClick={() => applySchedulePreset('sab')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Sáb (1x)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {WEEKDAY_OPTIONS.map((item) => {
                const isSelected = daysOfWeek.includes(item.day);
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => toggleDayOfWeek(item.day)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#002B49] dark:bg-sky-600 text-white border-[#002B49] dark:border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HORÁRIOS DA AULA */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
              Horário da Aula
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Início</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Término</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Duração Calculada</span>
                <div className="flex items-center px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 h-[34px]">
                  {durationMinutes} min ({Math.floor(durationMinutes / 60)}h{durationMinutes % 60 ? ` ${durationMinutes % 60}m` : ''})
                </div>
              </div>
            </div>

            {/* Última Lição Dada (sincronizada com o diário de aula) */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-last-lesson-given" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
                    Última Lição Dada
                  </label>
                  <span className="text-[10px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/80 dark:border-sky-800">
                    Sincronizada com o diário
                  </span>
                </div>

                <input
                  id="input-last-lesson-given"
                  type="text"
                  value={currentLessonPlan}
                  onChange={(e) => setCurrentLessonPlan(e.target.value)}
                  placeholder="Ex: Lesson 1 - Sit. 1 e 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/10 outline-hidden transition-all shadow-2xs"
                />

                {/* Atalhos rápidos no formato CCAA */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-0.5">Atalhos rápidos:</span>
                  {[
                    'Lesson 1 - Sit. 1 e 2',
                    'Lesson 2 - Sit. 1 e 2',
                    'Lesson 4 - Grammar',
                    'Practice Test 1',
                    'Midterm Exam'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCurrentLessonPlan(preset)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Essa informação alimenta o diário de aula. Quando você registrar uma nova aula no diário, este campo é atualizado automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* BASE DE ALUNOS DA TURMA */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
                Alunos Matriculados ({students.length})
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pressione Enter para adicionar
              </span>
            </div>

            {/* Input adicionar aluno */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStudent();
                  }
                }}
                placeholder="Nome do aluno (ex: Lucas Silva)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#002B49] dark:focus:border-sky-400 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddStudent}
                className="px-3.5 py-2 rounded-xl bg-[#002B49] dark:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-[#001f35] dark:hover:bg-sky-500 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* Lista dos alunos */}
            {students.length > 0 ? (
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {students.map((st, idx) => (
                  <div key={st.id} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {idx + 1}. {st.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(st.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Remover aluno"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">
                Nenhum aluno adicionado ainda nesta turma.
              </p>
            )}
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingClass ? 'Salvar Alterações' : 'Cadastrar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
