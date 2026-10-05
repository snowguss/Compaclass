import React, { useState, useEffect } from 'react';
import { ClassGroup, LessonRecord, Student } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Save, 
  Users, 
  Layers,
  Edit2,
  Check,
  Copy,
  MessageSquare
} from 'lucide-react';
import { formatShortDate, formatUpcomingDayHeader } from '../utils/dateUtils';
import { getClassColorHex } from '../utils/colorUtils';
import { generateWeeklyClassMessage, getNextClassDateFormatted } from '../utils/messageUtils';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroup;
  targetDate: string; // YYYY-MM-DD
  lastLesson?: LessonRecord;
  existingLessonToday?: LessonRecord;
  onSaveLesson: (lessonData: {
    title: string;
    content: string;
    homework: string;
    homeworkDueDate?: string;
    isCompletedLesson?: boolean;
    absentStudentIds: string[];
    andCopyMessage?: boolean;
    generatedMessage?: string;
  }) => void;
}

interface ParsedLesson {
  mode: 'lesson' | 'exam';
  num: number;
  part: string;
  examName: string;
  title: string;
}

const parseRawLesson = (raw: string): ParsedLesson => {
  if (!raw) {
    return { mode: 'lesson', num: 1, part: 'Sit. 1 e 2', examName: 'Midterm Exam', title: 'Lesson 1 - Sit. 1 e 2' };
  }
  if (/practice\s*test\s*1/i.test(raw)) {
    return { mode: 'exam', num: 7, part: 'Practice Test 1', examName: 'Practice Test 1', title: 'Practice Test 1' };
  }
  if (/practice\s*test\s*2/i.test(raw)) {
    return { mode: 'exam', num: 14, part: 'Practice Test 2', examName: 'Practice Test 2', title: 'Practice Test 2' };
  }
  if (/midterm\s*exam/i.test(raw)) {
    return { mode: 'exam', num: 7, part: 'Midterm Exam', examName: 'Midterm Exam', title: 'Midterm Exam' };
  }
  if (/final\s*exam/i.test(raw)) {
    return { mode: 'exam', num: 14, part: 'Final Exam', examName: 'Final Exam', title: 'Final Exam' };
  }

  const match = raw.match(/lesson\s*(\d+)/i);
  const num = match ? Math.min(14, Math.max(1, parseInt(match[1], 10))) : 1;
  let part = 'Sit. 1 e 2';
  if (/completamos/i.test(raw)) part = 'Completamos ✅';
  else if (/grammar/i.test(raw)) part = 'Grammar';
  else if (/sit\.?\s*1\s*(e|&|and)\s*2/i.test(raw)) part = 'Sit. 1 e 2';
  else if (/sit\.?\s*3\s*(e|&|and)\s*4/i.test(raw)) part = 'Sit. 3 e 4';
  else if (/sit\.?\s*1\s*(a|to|-)\s*4/i.test(raw)) part = 'Sit. 1 a 4';
  else if (/sit\.?\s*1\b/i.test(raw)) part = 'Sit. 1';
  else if (/sit\.?\s*2\b/i.test(raw)) part = 'Sit. 2';
  else if (/sit\.?\s*3\b/i.test(raw)) part = 'Sit. 3';
  else if (/sit\.?\s*4\b/i.test(raw)) part = 'Sit. 4';

  return { mode: 'lesson', num, part, examName: 'Midterm Exam', title: `Lesson ${num} - ${part}` };
};

const getNextSuggestedLesson = (raw: string): ParsedLesson => {
  if (!raw) {
    return { mode: 'lesson', num: 1, part: 'Sit. 1 e 2', examName: 'Midterm Exam', title: 'Lesson 1 - Sit. 1 e 2' };
  }
  const current = parseRawLesson(raw);
  if (current.mode === 'exam') {
    if (current.examName === 'Practice Test 1') {
      return { mode: 'exam', num: 7, part: 'Midterm Exam', examName: 'Midterm Exam', title: 'Midterm Exam' };
    }
    if (current.examName === 'Midterm Exam') {
      return { mode: 'lesson', num: 8, part: 'Sit. 1 e 2', examName: 'Midterm Exam', title: 'Lesson 8 - Sit. 1 e 2' };
    }
    if (current.examName === 'Practice Test 2') {
      return { mode: 'exam', num: 14, part: 'Final Exam', examName: 'Final Exam', title: 'Final Exam' };
    }
    return { mode: 'exam', num: 14, part: 'Final Exam', examName: 'Final Exam', title: 'Final Exam' };
  }

  const { num, part } = current;
  if (part === 'Sit. 1 e 2') {
    return { mode: 'lesson', num, part: 'Sit. 3 e 4', examName: 'Midterm Exam', title: `Lesson ${num} - Sit. 3 e 4` };
  }
  if (part === 'Sit. 3 e 4') {
    return { mode: 'lesson', num, part: 'Grammar', examName: 'Midterm Exam', title: `Lesson ${num} - Grammar` };
  }
  if (part === 'Grammar' || part === 'Completamos ✅') {
    if (num === 7) {
      return { mode: 'exam', num: 7, part: 'Practice Test 1', examName: 'Practice Test 1', title: 'Practice Test 1' };
    }
    if (num === 14) {
      return { mode: 'exam', num: 14, part: 'Practice Test 2', examName: 'Practice Test 2', title: 'Practice Test 2' };
    }
    const nextNum = Math.min(14, num + 1);
    return { mode: 'lesson', num: nextNum, part: 'Sit. 1 e 2', examName: 'Midterm Exam', title: `Lesson ${nextNum} - Sit. 1 e 2` };
  }
  if (part === 'Sit. 1') return { mode: 'lesson', num, part: 'Sit. 2', examName: 'Midterm Exam', title: `Lesson ${num} - Sit. 2` };
  if (part === 'Sit. 2') return { mode: 'lesson', num, part: 'Sit. 3', examName: 'Midterm Exam', title: `Lesson ${num} - Sit. 3` };
  if (part === 'Sit. 3') return { mode: 'lesson', num, part: 'Sit. 4', examName: 'Midterm Exam', title: `Lesson ${num} - Sit. 4` };
  if (part === 'Sit. 4') return { mode: 'lesson', num, part: 'Grammar', examName: 'Midterm Exam', title: `Lesson ${num} - Grammar` };

  return { mode: 'lesson', num, part: 'Sit. 3 e 4', examName: 'Midterm Exam', title: `Lesson ${num} - Sit. 3 e 4` };
};

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  classGroup,
  targetDate,
  lastLesson,
  existingLessonToday,
  onSaveLesson
}) => {
  if (!isOpen) return null;

  // Próximo dia de aula calculado a partir da grade da turma
  const defaultNextClassFormatted = getNextClassDateFormatted(classGroup.daysOfWeek, targetDate);

  // Última lição dada (sincronizada da turma ou do diário anterior)
  const lastTaughtLesson = lastLesson?.title || classGroup.currentLessonPlan || '';

  // Estados modulares do formulário
  const [mode, setMode] = useState<'lesson' | 'exam'>('lesson');
  const [lessonNum, setLessonNum] = useState<number>(1);
  const [lessonPart, setLessonPart] = useState<string>('Sit. 1 e 2');
  const [isCompletedLesson, setIsCompletedLesson] = useState<boolean>(
    existingLessonToday?.isCompletedLesson || existingLessonToday?.title?.includes('Completamos ✅') || false
  );
  const [examName, setExamName] = useState<string>('Midterm Exam');
  const [title, setTitle] = useState<string>('');
  const [hasHomework, setHasHomework] = useState<boolean>(
    !!existingLessonToday?.homework
  );
  const [homework, setHomework] = useState<string>(
    existingLessonToday?.homework || ''
  );
  const [homeworkDueDate, setHomeworkDueDate] = useState<string>(
    existingLessonToday?.homeworkDueDate || defaultNextClassFormatted
  );
  const [absentStudentIds, setAbsentStudentIds] = useState<string[]>(
    existingLessonToday?.absentStudentIds || []
  );
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);

  const applyParsedLesson = (p: ParsedLesson) => {
    setMode(p.mode);
    setLessonNum(p.num);
    setLessonPart(p.part);
    setExamName(p.examName);
    setIsCompletedLesson(p.part === 'Completamos ✅');
    setTitle(p.title);
  };

  // Parse e inicialização inteligente sincronizada com a última aula dada
  useEffect(() => {
    if (existingLessonToday) {
      const parsed = parseRawLesson(existingLessonToday.title);
      applyParsedLesson(parsed);
      setTitle(existingLessonToday.title);
      setIsCompletedLesson(
        !!existingLessonToday.isCompletedLesson || existingLessonToday.title.includes('Completamos ✅')
      );
      setHasHomework(!!existingLessonToday.homework && existingLessonToday.homework.trim().length > 0);
      setHomework(existingLessonToday.homework || '');
      setHomeworkDueDate(existingLessonToday.homeworkDueDate || defaultNextClassFormatted);
      setAbsentStudentIds(existingLessonToday.absentStudentIds || []);
    } else {
      // Inicia sugerindo a próxima lição a partir da última lição dada
      const next = getNextSuggestedLesson(lastTaughtLesson);
      applyParsedLesson(next);
      setHasHomework(false);
      setHomework('');
      setHomeworkDueDate(defaultNextClassFormatted);
      setAbsentStudentIds([]);
    }
  }, [existingLessonToday, classGroup, lastLesson]);

  // Alunos que faltaram na última aula
  const lastLessonAbsentStudents: Student[] = lastLesson
    ? classGroup.students.filter(s => lastLesson.absentStudentIds.includes(s.id))
    : [];

  const handleSelectLessonNum = (num: number) => {
    setLessonNum(num);
    setMode('lesson');
    const newTitle = `Lesson ${num} - ${lessonPart || 'Sit. 1 e 2'}`;
    setTitle(newTitle);
  };

  const handleSelectPart = (part: string) => {
    setLessonPart(part);
    setMode('lesson');
    const isCompleted = part === 'Completamos ✅';
    setIsCompletedLesson(isCompleted);
    const newTitle = `Lesson ${lessonNum} - ${part}`;
    setTitle(newTitle);
  };

  const handleSelectExam = (exam: string) => {
    setExamName(exam);
    setMode('exam');
    setIsCompletedLesson(false);
    setTitle(exam);
  };

  const toggleStudentAttendance = (studentId: string) => {
    setAbsentStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const markAllPresent = () => {
    setAbsentStudentIds([]);
  };

  // Gera a mensagem semanal atualizada
  const currentGeneratedMessage = generateWeeklyClassMessage({
    lessonTitle: title.trim() || (mode === 'lesson' ? `Lesson ${lessonNum} - ${lessonPart}` : examName),
    isCompletedLesson,
    hasHomework,
    homework,
    homeworkDueDate
  });

  const handleQuickCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentGeneratedMessage);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleSave = (andCopyMessage: boolean = false) => {
    if (!title.trim()) {
      alert('Por favor, defina a lição ministrada.');
      return;
    }

    if (andCopyMessage) {
      navigator.clipboard.writeText(currentGeneratedMessage).catch(() => {});
    }

    onSaveLesson({
      title: title.trim(),
      content: '', // Sem descrição conforme solicitado
      homework: hasHomework ? homework.trim() : '',
      homeworkDueDate: hasHomework ? homeworkDueDate.trim() : '',
      isCompletedLesson,
      absentStudentIds,
      andCopyMessage,
      generatedMessage: currentGeneratedMessage
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

  const presentCount = classGroup.students.length - absentStudentIds.length;
  const targetDateObj = new Date(`${targetDate}T12:00:00`);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="lesson-modal-dialog"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header com estilo e cor da turma */}
        <div 
          style={{ backgroundColor: getClassColorHex(classGroup.color) }}
          className="text-white p-5 sm:p-6 relative transition-colors"
        >
          <button
            onClick={onClose}
            id="btn-close-lesson-modal"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-white text-slate-900 shadow-2xs">
              {classGroup.code}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {classGroup.students.length} alunos matriculados
            </span>
            {existingLessonToday ? (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-300 text-amber-950 flex items-center gap-1 shadow-xs">
                <Edit2 className="w-3 h-3" />
                Editando Registro da Aula
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-white border border-white/30">
                Nova Aula
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {classGroup.name}
          </h3>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs sm:text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/80" />
              {formatUpcomingDayHeader(targetDateObj)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/80" />
              {classGroup.startTime} - {classGroup.endTime} ({classGroup.durationMinutes} min)
            </span>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          
          {/* SEÇÃO 1: O QUE FOI DADO NA ÚLTIMA AULA */}
          <div className="rounded-2xl border border-sky-100 dark:border-sky-950/60 bg-sky-50/70 dark:bg-slate-800/80 p-4 sm:p-5">
            {lastTaughtLesson ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    Última Lição Ministrada
                  </span>
                  {lastLesson ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                      {formatShortDate(lastLesson.date)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                      Configurada na turma
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-slate-900 dark:text-white -mt-1 text-base sm:text-lg">
                  {lastTaughtLesson}
                </p>

                {lastLesson?.homework && (
                  <div className="flex items-start gap-2 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/60 p-2.5 rounded-lg text-amber-900 dark:text-amber-300 text-xs">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Tarefa de casa cobrada hoje:</strong> {lastLesson.homework}
                    </div>
                  </div>
                )}

                {/* Alunos que faltaram na última aula (somente se houver faltas) */}
                {lastLesson && lastLessonAbsentStudents.length > 0 && (
                  <div className="pt-2 border-t border-sky-200/60 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Alunos que faltaram na última aula:
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {lastLessonAbsentStudents.map(student => (
                        <span
                          key={student.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          {student.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Nenhuma lição anterior registrada ou configurada para esta turma.
              </div>
            )}
          </div>

          {/* SEÇÃO 2: REGISTRO MODULAR DA AULA E CHAMADA */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#002B49] dark:text-sky-400" />
                Registro da Aula de Hoje
              </h4>
              {existingLessonToday && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Já registrada
                </span>
              )}
            </div>

            {/* SELETOR MODULAR CCAA */}
            <div className="space-y-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Formato de Aula
                </span>
                
                {/* Abas de Modo: Lesson vs Testes/Exames */}
                <div className="flex items-center p-1 bg-slate-200/90 dark:bg-slate-800 rounded-xl text-xs font-bold border border-transparent dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('lesson');
                      const newTitle = `Lesson ${lessonNum} - ${lessonPart || 'Sit. 1 e 2'}`;
                      setTitle(newTitle);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'lesson'
                        ? 'bg-white dark:bg-slate-700 text-[#002B49] dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Lessons (1 a 14)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('exam');
                      setTitle(examName || 'Practice Test 1');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'exam'
                        ? 'bg-white dark:bg-slate-700 text-[#002B49] dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Testes & Provas
                  </button>
                </div>
              </div>

              {mode === 'lesson' ? (
                <div className="space-y-3 pt-1">
                  {/* Número da Lesson (1 a 14) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        1. Número da Lesson
                      </span>
                      <span className="text-xs font-black text-[#002B49] dark:text-sky-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                        Lesson {lessonNum}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                      {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => {
                        const isSelected = lessonNum === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSelectLessonNum(num)}
                            className={`h-9 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#002B49] dark:bg-sky-600 text-white border-[#002B49] dark:border-sky-600 shadow-xs scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Parte da Lesson */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        2. Parte da Lesson
                      </span>
                      <span className="text-xs font-bold text-[#002B49] dark:text-sky-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {lessonPart}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Sit. 1',
                        'Sit. 2',
                        'Sit. 1 e 2',
                        'Sit. 3',
                        'Sit. 4',
                        'Sit. 3 e 4',
                        'Grammar',
                        'Sit. 1 a 4',
                        'Completamos ✅'
                      ].map((part) => {
                        const isSelected = lessonPart === part;
                        const isComplete = part === 'Completamos ✅';
                        return (
                          <button
                            key={part}
                            type="button"
                            onClick={() => handleSelectPart(part)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? isComplete
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-[#002B49] dark:bg-sky-600 text-white border-[#002B49] dark:border-sky-600 shadow-xs'
                                : isComplete
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            {part}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Testes & Provas */
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Selecione o Teste ou Exame
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'Practice Test 1', label: 'Practice Test 1', tag: 'Simulado 1' },
                      { id: 'Midterm Exam', label: 'Midterm Exam', tag: 'Prova Semestral' },
                      { id: 'Practice Test 2', label: 'Practice Test 2', tag: 'Simulado 2' },
                      { id: 'Final Exam', label: 'Final Exam', tag: 'Prova Final' }
                    ].map((item) => {
                      const isSelected = examName === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectExam(item.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#002B49] dark:bg-sky-600 text-white border-[#002B49] dark:border-sky-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                        >
                          <span className="font-extrabold text-xs sm:text-sm">{item.label}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Registro final gerado */}
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="lesson-title-input" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Registro que será gravado:
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Ajuste diretamente se necessário
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="lesson-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Lesson 1 - Sit. 1 e 2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-slate-900 dark:text-white text-sm font-extrabold outline-hidden transition-all shadow-2xs"
                    required
                  />
                  <Edit2 className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Homework */}
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-[#002B49] dark:text-sky-400" />
                  Homework
                </span>

                <div className="inline-flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/70 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setHasHomework(false);
                      setHomework('');
                      setHomeworkDueDate('');
                    }}
                    className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !hasHomework
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasHomework(true);
                      if (!homeworkDueDate) {
                        setHomeworkDueDate(defaultNextClassFormatted);
                      }
                    }}
                    className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hasHomework
                        ? 'bg-[#002B49] dark:bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>

              {hasHomework && (
                <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
                  <div>
                    <label htmlFor="lesson-homework-input" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Informações da Tarefa:
                    </label>
                    <input
                      id="lesson-homework-input"
                      type="text"
                      value={homework}
                      onChange={(e) => setHomework(e.target.value)}
                      placeholder="Ex: Workbook págs. 14 e 15"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                      autoFocus
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="lesson-homework-duedate-input" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Entregar no dia:
                      </label>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Data de entrega da tarefa
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        id="lesson-homework-duedate-input"
                        type="text"
                        value={homeworkDueDate}
                        onChange={(e) => setHomeworkDueDate(e.target.value)}
                        placeholder="Ex: 23/09 ou próxima aula"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                      />
                      {defaultNextClassFormatted && (
                        <button
                          type="button"
                          onClick={() => setHomeworkDueDate(defaultNextClassFormatted)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors whitespace-nowrap text-center cursor-pointer"
                        >
                          Próx. aula: {defaultNextClassFormatted}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CHAMADA / REGISTRO DE FALTAS DE HOJE */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#002B49] dark:text-sky-400" />
                    Presença
                  </h5>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    {presentCount} presentes
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
                    {absentStudentIds.length} faltas
                  </span>
                  <button
                    type="button"
                    onClick={markAllPresent}
                    className="text-xs font-medium text-[#002B49] dark:text-sky-400 hover:underline ml-1 cursor-pointer"
                  >
                    Todos presentes
                  </button>
                </div>
              </div>

              {/* Lista de Alunos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {classGroup.students.map((student) => {
                  const isAbsent = absentStudentIds.includes(student.id);
                  const missedLastLesson = lastLesson?.absentStudentIds.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentAttendance(student.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isAbsent
                          ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-300 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-xs sm:text-sm truncate">
                          {student.name}
                        </div>
                        {missedLastLesson && (
                          <span className="inline-block text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            Faltou na última aula
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            Faltou
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            Presente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PREVIEW DA MENSAGEM DA SEMANA PARA WHATSAPP */}
            <div className="rounded-2xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-slate-850 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#002B49] dark:text-sky-300">
                  <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Mensagem Semanal (WhatsApp)</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickCopy}
                  id="btn-copy-preview-message"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-[#002B49] dark:text-sky-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-all cursor-pointer"
                >
                  {copiedPreview ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#002B49] dark:text-sky-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans leading-relaxed shadow-inner max-h-36 overflow-y-auto">
                {currentGeneratedMessage}
              </div>
            </div>

            {/* Ações de Rodapé */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                id="btn-cancel-lesson"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors text-center cursor-pointer"
              >
                Cancelar
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="btn-save-and-copy-lesson"
                  onClick={() => handleSave(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  title="Salvar aula no diário e copiar a mensagem semanal para a área de transferência"
                >
                  <Copy className="w-4 h-4" />
                  Salvar e Copiar Mensagem
                </button>

                <button
                  type="submit"
                  id="btn-save-lesson"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {existingLessonToday ? 'Salvar Alterações' : 'Salvar no Diário'}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
