/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClassGroup, LessonRecord, TeacherProfile, TabType, HomeworkAssignment, StudentHomeworkStatus } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ClassesView } from './components/ClassesView';
import { HomeworkView } from './components/HomeworkView';
import { SettingsView } from './components/SettingsView';
import { LessonModal } from './components/LessonModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { ClassFormModal } from './components/ClassFormModal';
import { HomeworkFormModal } from './components/HomeworkFormModal';
import { CopyMessageModal } from './components/CopyMessageModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { getTodayDateString } from './utils/dateUtils';
import { getNextClassDateFormatted } from './utils/messageUtils';

export default function App() {
  // Estados principais
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile>({
    name: 'Gustavo',
    school: 'CCAA',
    role: 'Teacher'
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ccaa_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ccaa_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ccaa_dark_mode', 'false');
    }
  }, [darkMode]);

  // Estados de Modais
  const [lessonModalState, setLessonModalState] = useState<{
    isOpen: boolean;
    classGroup: ClassGroup | null;
    dateStr: string;
  }>({
    isOpen: false,
    classGroup: null,
    dateStr: getTodayDateString()
  });

  const [detailModalClass, setDetailModalClass] = useState<ClassGroup | null>(null);

  const [classFormState, setClassFormState] = useState<{
    isOpen: boolean;
    editingClass: ClassGroup | null;
  }>({
    isOpen: false,
    editingClass: null
  });

  const [homeworkFormState, setHomeworkFormState] = useState<{
    isOpen: boolean;
    editingHomework: HomeworkAssignment | null;
    preselectedClassId?: string;
  }>({
    isOpen: false,
    editingHomework: null
  });

  const [copyMessageState, setCopyMessageState] = useState<{
    isOpen: boolean;
    message: string;
    classGroup: ClassGroup | null;
    lessonTitle: string;
    hasHomework: boolean;
    homework?: string;
    homeworkDueDate?: string;
  }>({
    isOpen: false,
    message: '',
    classGroup: null,
    lessonTitle: '',
    hasHomework: false,
    homework: '',
    homeworkDueDate: ''
  });

  // Carregar dados no mount
  useEffect(() => {
    const loadedClasses = StorageService.getClasses();
    const loadedLessons = StorageService.getLessons();
    const loadedHomework = StorageService.getHomework();
    const loadedTeacher = StorageService.getTeacher();

    setClasses(loadedClasses);
    setLessons(loadedLessons);
    setHomeworkList(loadedHomework);
    setTeacher(loadedTeacher);
  }, []);

  // Notificações Toast
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Salvar aula (Diário de Classe & Chamada)
  const handleSaveLesson = (lessonData: {
    title: string;
    content: string;
    homework: string;
    homeworkDueDate?: string;
    isCompletedLesson?: boolean;
    absentStudentIds: string[];
    andCopyMessage?: boolean;
    generatedMessage?: string;
  }) => {
    if (!lessonModalState.classGroup) return;

    const classGroup = lessonModalState.classGroup;
    const classId = classGroup.id;
    const dateStr = lessonModalState.dateStr;

    // Verifica se já existe registro nesta data para atualizar ou criar novo
    const existingIndex = lessons.findIndex(l => l.classId === classId && l.date === dateStr);

    let updatedLessons: LessonRecord[];
    if (existingIndex >= 0) {
      updatedLessons = [...lessons];
      updatedLessons[existingIndex] = {
        ...updatedLessons[existingIndex],
        title: lessonData.title,
        content: lessonData.content,
        homework: lessonData.homework,
        homeworkDueDate: lessonData.homeworkDueDate,
        isCompletedLesson: lessonData.isCompletedLesson,
        absentStudentIds: lessonData.absentStudentIds
      };
    } else {
      const newRecord: LessonRecord = {
        id: `rec-${Date.now()}`,
        classId,
        date: dateStr,
        title: lessonData.title,
        content: lessonData.content,
        homework: lessonData.homework,
        homeworkDueDate: lessonData.homeworkDueDate,
        isCompletedLesson: lessonData.isCompletedLesson,
        absentStudentIds: lessonData.absentStudentIds,
        createdAt: new Date().toISOString()
      };
      updatedLessons = [newRecord, ...lessons];
    }

    // Atualiza lição planejada na turma
    const updatedClasses = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          currentLessonPlan: lessonData.title
        };
      }
      return c;
    });

    setLessons(updatedLessons);
    setClasses(updatedClasses);
    StorageService.saveLessons(updatedLessons);
    StorageService.saveClasses(updatedClasses);

    // Se estiver no modal de detalhes, atualiza a turma ativa
    if (detailModalClass?.id === classId) {
      setDetailModalClass(updatedClasses.find(c => c.id === classId) || null);
    }

    // Sincroniza tarefa de casa na aba de Tarefas se houver homework preenchido
    if (lessonData.homework && lessonData.homework.trim().length > 0) {
      const hwTitle = lessonData.homework.trim();
      const hwDueDate = lessonData.homeworkDueDate?.trim() || getNextClassDateFormatted(classGroup.daysOfWeek, dateStr);
      const targetRecordId = existingIndex >= 0 ? updatedLessons[existingIndex].id : updatedLessons[0].id;

      // Base de entregas para todos os alunos da turma
      const baseSubmissions: Record<string, StudentHomeworkStatus> = {};
      classGroup.students.forEach(st => {
        baseSubmissions[st.id] = {
          studentId: st.id,
          delivered: false,
          corrected: false
        };
      });

      setHomeworkList(prevHw => {
        const existingHwIndex = prevHw.findIndex(h =>
          (h.lessonId && h.lessonId === targetRecordId) ||
          (h.classId === classId && h.assignedDate === dateStr)
        );

        let newHwList: HomeworkAssignment[];
        if (existingHwIndex >= 0) {
          const existing = prevHw[existingHwIndex];
          newHwList = [...prevHw];
          newHwList[existingHwIndex] = {
            ...existing,
            title: hwTitle,
            dueDate: hwDueDate,
            submissions: {
              ...baseSubmissions,
              ...existing.submissions
            }
          };
        } else {
          const newAssignment: HomeworkAssignment = {
            id: `hw-${Date.now()}`,
            classId,
            lessonId: targetRecordId,
            title: hwTitle,
            assignedDate: dateStr,
            dueDate: hwDueDate,
            submissions: baseSubmissions,
            createdAt: new Date().toISOString()
          };
          newHwList = [newAssignment, ...prevHw];
        }

        StorageService.saveHomework(newHwList);
        return newHwList;
      });
    }

    setLessonModalState({ isOpen: false, classGroup: null, dateStr: getTodayDateString() });

    if (lessonData.andCopyMessage && lessonData.generatedMessage) {
      setCopyMessageState({
        isOpen: true,
        message: lessonData.generatedMessage,
        classGroup,
        lessonTitle: lessonData.title,
        hasHomework: !!lessonData.homework && lessonData.homework.trim().length > 0,
        homework: lessonData.homework,
        homeworkDueDate: lessonData.homeworkDueDate
      });

      addToast(
        'success',
        'Aula Salva e Mensagem Copiada!',
        `A mensagem semanal da turma ${classGroup.code} já está na sua área de transferência.`
      );
    } else {
      addToast(
        'success',
        'Diário da Aula Registrado!',
        `Conteúdo e presença da turma ${classGroup.code} gravados com sucesso.`
      );
    }
  };

  // Salvar Turma (Criar ou Editar)
  const handleSaveClass = (classData: Omit<ClassGroup, 'id' | 'createdAt'>, editingId?: string) => {
    let updatedClasses: ClassGroup[];

    if (editingId) {
      updatedClasses = classes.map(c => {
        if (c.id === editingId) {
          return {
            ...c,
            ...classData
          };
        }
        return c;
      });
      addToast('success', 'Turma atualizada!', `Alterações na turma ${classData.code} foram salvas.`);
    } else {
      const newClass: ClassGroup = {
        ...classData,
        id: `class-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedClasses = [...classes, newClass];
      addToast('success', 'Nova turma criada!', `Turma ${classData.code} adicionada com sucesso.`);
    }

    setClasses(updatedClasses);
    StorageService.saveClasses(updatedClasses);
    setClassFormState({ isOpen: false, editingClass: null });

    if (detailModalClass && editingId === detailModalClass.id) {
      setDetailModalClass(updatedClasses.find(c => c.id === editingId) || null);
    }
  };

  // Excluir Turma
  const handleDeleteClass = (classId: string) => {
    const classToDelete = classes.find(c => c.id === classId);
    const updatedClasses = classes.filter(c => c.id !== classId);
    const updatedLessons = lessons.filter(l => l.classId !== classId);
    const updatedHomework = homeworkList.filter(h => h.classId !== classId);

    setClasses(updatedClasses);
    setLessons(updatedLessons);
    setHomeworkList(updatedHomework);
    StorageService.saveClasses(updatedClasses);
    StorageService.saveLessons(updatedLessons);
    StorageService.saveHomework(updatedHomework);

    if (detailModalClass?.id === classId) {
      setDetailModalClass(null);
    }

    addToast('info', 'Turma removida', `A turma ${classToDelete?.code || ''} foi excluída.`);
  };

  // Salvar Tarefa de Casa (Manual: Criar ou Editar)
  const handleSaveHomeworkManual = (
    data: {
      classId: string;
      title: string;
      dueDate: string;
      notes?: string;
      assignedDate?: string;
    },
    editingId?: string
  ) => {
    const classGroup = classes.find(c => c.id === data.classId);
    if (!classGroup) return;

    let updatedList: HomeworkAssignment[];

    if (editingId) {
      updatedList = homeworkList.map(h => {
        if (h.id === editingId) {
          const updatedSubmissions = { ...h.submissions };
          classGroup.students.forEach(st => {
            if (!updatedSubmissions[st.id]) {
              updatedSubmissions[st.id] = {
                studentId: st.id,
                delivered: false,
                corrected: false
              };
            }
          });

          return {
            ...h,
            classId: data.classId,
            title: data.title,
            dueDate: data.dueDate,
            notes: data.notes,
            assignedDate: data.assignedDate || h.assignedDate,
            submissions: updatedSubmissions
          };
        }
        return h;
      });
      addToast('success', 'Tarefa atualizada!', `Alterações na tarefa da turma ${classGroup.code} foram salvas.`);
    } else {
      const baseSubmissions: Record<string, StudentHomeworkStatus> = {};
      classGroup.students.forEach(st => {
        baseSubmissions[st.id] = {
          studentId: st.id,
          delivered: false,
          corrected: false
        };
      });

      const newHw: HomeworkAssignment = {
        id: `hw-${Date.now()}`,
        classId: data.classId,
        title: data.title,
        dueDate: data.dueDate,
        notes: data.notes,
        assignedDate: data.assignedDate || getTodayDateString(),
        submissions: baseSubmissions,
        createdAt: new Date().toISOString()
      };
      updatedList = [newHw, ...homeworkList];
      addToast('success', 'Nova tarefa criada!', `Tarefa adicionada para a turma ${classGroup.code}.`);
    }

    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
    setHomeworkFormState({ isOpen: false, editingHomework: null });
  };

  // Excluir Tarefa
  const handleDeleteHomework = (homeworkId: string) => {
    const updatedList = homeworkList.filter(h => h.id !== homeworkId);
    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
    addToast('info', 'Tarefa removida', 'A tarefa de casa foi excluída.');
  };

  // Alternar Entrega do Aluno
  const handleToggleStudentDelivered = (homeworkId: string, studentId: string) => {
    const updatedList = homeworkList.map(h => {
      if (h.id === homeworkId) {
        const current = h.submissions[studentId] || { studentId, delivered: false, corrected: false };
        const newDelivered = !current.delivered;
        return {
          ...h,
          submissions: {
            ...h.submissions,
            [studentId]: {
              ...current,
              delivered: newDelivered,
              corrected: newDelivered ? current.corrected : false,
              deliveredAt: newDelivered ? new Date().toISOString() : undefined
            }
          }
        };
      }
      return h;
    });

    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
  };

  // Alternar Correção do Aluno
  const handleToggleStudentCorrected = (homeworkId: string, studentId: string) => {
    const updatedList = homeworkList.map(h => {
      if (h.id === homeworkId) {
        const current = h.submissions[studentId] || { studentId, delivered: false, corrected: false };
        const newCorrected = !current.corrected;
        return {
          ...h,
          submissions: {
            ...h.submissions,
            [studentId]: {
              ...current,
              delivered: newCorrected ? true : current.delivered,
              corrected: newCorrected
            }
          }
        };
      }
      return h;
    });

    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
  };

  // Marcar/Desmarcar todos como entregues
  const handleMarkAllDelivered = (homeworkId: string, delivered: boolean) => {
    const updatedList = homeworkList.map(h => {
      if (h.id === homeworkId) {
        const cls = classes.find(c => c.id === h.classId);
        const students = cls ? cls.students : [];
        const newSubmissions = { ...h.submissions };
        
        students.forEach(st => {
          const curr = newSubmissions[st.id] || { studentId: st.id, delivered: false, corrected: false };
          newSubmissions[st.id] = {
            ...curr,
            delivered,
            corrected: delivered ? curr.corrected : false,
            deliveredAt: delivered ? new Date().toISOString() : undefined
          };
        });

        return {
          ...h,
          submissions: newSubmissions
        };
      }
      return h;
    });

    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
    addToast('info', delivered ? 'Todas entregas marcadas' : 'Entregas desmarcadas');
  };

  // Marcar/Desmarcar todos como corrigidos
  const handleMarkAllCorrected = (homeworkId: string, corrected: boolean) => {
    const updatedList = homeworkList.map(h => {
      if (h.id === homeworkId) {
        const cls = classes.find(c => c.id === h.classId);
        const students = cls ? cls.students : [];
        const newSubmissions = { ...h.submissions };
        
        students.forEach(st => {
          const curr = newSubmissions[st.id] || { studentId: st.id, delivered: false, corrected: false };
          newSubmissions[st.id] = {
            ...curr,
            delivered: corrected ? true : curr.delivered,
            corrected
          };
        });

        return {
          ...h,
          submissions: newSubmissions
        };
      }
      return h;
    });

    setHomeworkList(updatedList);
    StorageService.saveHomework(updatedList);
    addToast('info', corrected ? 'Todas correções marcadas' : 'Correções desmarcadas');
  };

  // Atualizar Perfil do Professor
  const handleSaveTeacher = (updatedTeacher: TeacherProfile) => {
    setTeacher(updatedTeacher);
    StorageService.saveTeacher(updatedTeacher);
    addToast('success', 'Perfil atualizado!', 'Suas preferências foram salvas.');
  };

  // Restaurar dados de exemplo
  const handleResetDefaults = () => {
    StorageService.resetToDefaults();
    setClasses(StorageService.getClasses());
    setLessons(StorageService.getLessons());
    setHomeworkList(StorageService.getHomework());
    setTeacher(StorageService.getTeacher());
    addToast('info', 'Dados restaurados', 'Turmas, registros e tarefas de demonstração recarregados.');
  };

  // Exportar backup JSON
  const handleExportData = () => {
    const data = {
      classes,
      lessons,
      homework: homeworkList,
      teacher,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ccaa_class_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Backup baixado!', 'Seu arquivo de backup foi salvo.');
  };

  // Importar backup JSON
  const handleImportData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.classes)) {
        setClasses(parsed.classes);
        StorageService.saveClasses(parsed.classes);
      }
      if (Array.isArray(parsed.lessons)) {
        setLessons(parsed.lessons);
        StorageService.saveLessons(parsed.lessons);
      }
      if (Array.isArray(parsed.homework)) {
        setHomeworkList(parsed.homework);
        StorageService.saveHomework(parsed.homework);
      }
      if (parsed.teacher) {
        setTeacher(parsed.teacher);
        StorageService.saveTeacher(parsed.teacher);
      }
      addToast('success', 'Backup restaurado com sucesso!', 'Todas as turmas e tarefas foram sincronizadas.');
    } catch (e) {
      console.error(e);
      addToast('error', 'Falha ao importar', 'O arquivo JSON enviado não é válido.');
    }
  };

  // Abre modal de aula para data específica
  const handleOpenLessonModal = (classGroup: ClassGroup, dateStr: string) => {
    setLessonModalState({
      isOpen: true,
      classGroup,
      dateStr
    });
  };

  // Contagem de aulas pendentes hoje
  const todayDayOfWeek = new Date().getDay();
  const todayDateStr = getTodayDateString();
  const todayClasses = classes.filter(c => c.daysOfWeek.includes(todayDayOfWeek));
  const pendingLessonsCount = todayClasses.filter(c => !lessons.some(l => l.classId === c.id && l.date === todayDateStr)).length;

  // Contagem de tarefas pendentes (alunos que faltam entregar ou entregas a corrigir)
  const pendingHomeworkCount = homeworkList.filter(hw => {
    const cls = classes.find(c => c.id === hw.classId);
    const totalStudents = cls ? cls.students.length : Object.keys(hw.submissions).length;
    const subs = Object.values(hw.submissions);
    const deliveredCount = subs.filter(s => s.delivered).length;
    const correctedCount = subs.filter(s => s.corrected).length;
    return totalStudents > 0 && (deliveredCount < totalStudents || correctedCount < deliveredCount);
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Container Responsivo Centralizado com visual de App Profissional */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 shadow-xl min-h-screen pb-20 border-x border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        
        {/* Cabeçalho com identificador perene CCAA Diário do Professor */}
        <Header 
          teacher={teacher} 
          currentDate={new Date()} 
          showGreeting={currentTab === 'home'}
        />

        {/* Conteúdo da Aba Ativa */}
        <main className={`flex-1 px-4 sm:px-6 ${currentTab === 'home' ? 'pt-1' : 'pt-2'}`}>
          {currentTab === 'home' && (
            <HomeView
              classes={classes}
              lessons={lessons}
              currentDate={new Date()}
              onSelectClassForLesson={handleOpenLessonModal}
              onGoToClassesTab={() => setCurrentTab('classes')}
            />
          )}

          {currentTab === 'classes' && (
            <ClassesView
              classes={classes}
              lessons={lessons}
              onOpenClassDetail={(c) => setDetailModalClass(c)}
              onOpenNewClassModal={() => setClassFormState({ isOpen: true, editingClass: null })}
              onOpenLessonModal={handleOpenLessonModal}
            />
          )}

          {currentTab === 'homework' && (
            <HomeworkView
              homeworkList={homeworkList}
              classes={classes}
              onOpenNewHomeworkModal={(preselectedClassId) =>
                setHomeworkFormState({ isOpen: true, editingHomework: null, preselectedClassId })
              }
              onEditHomework={(hw) =>
                setHomeworkFormState({ isOpen: true, editingHomework: hw })
              }
              onDeleteHomework={handleDeleteHomework}
              onToggleStudentDelivered={handleToggleStudentDelivered}
              onToggleStudentCorrected={handleToggleStudentCorrected}
              onMarkAllDelivered={handleMarkAllDelivered}
              onMarkAllCorrected={handleMarkAllCorrected}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              classes={classes}
              teacher={teacher}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(prev => !prev)}
              onSaveTeacher={handleSaveTeacher}
              onOpenNewClassModal={() => setClassFormState({ isOpen: true, editingClass: null })}
              onEditClass={(c) => setClassFormState({ isOpen: true, editingClass: c })}
              onDeleteClass={handleDeleteClass}
              onResetDefaults={handleResetDefaults}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </main>

        {/* Barra de Navegação Inferior (Início, Turmas, Tarefas, Ajustes) */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          pendingLessonsCount={pendingLessonsCount}
          pendingHomeworkCount={pendingHomeworkCount}
        />
      </div>

      {/* Modal: Registro & Histórico da Aula (O que foi dado na última aula + Registro de hoje + Chamada) */}
      {lessonModalState.isOpen && lessonModalState.classGroup && (
        <LessonModal
          isOpen={lessonModalState.isOpen}
          onClose={() => setLessonModalState({ isOpen: false, classGroup: null, dateStr: getTodayDateString() })}
          classGroup={lessonModalState.classGroup}
          targetDate={lessonModalState.dateStr}
          lastLesson={StorageService.getLastLesson(
            lessonModalState.classGroup.id,
            lessons,
            lessonModalState.dateStr
          )}
          existingLessonToday={StorageService.getTodayLesson(
            lessonModalState.classGroup.id,
            lessons,
            lessonModalState.dateStr
          )}
          onSaveLesson={handleSaveLesson}
        />
      )}

      {/* Modal: Detalhes da Turma e Histórico Completo */}
      {detailModalClass && (
        <ClassDetailModal
          isOpen={!!detailModalClass}
          onClose={() => setDetailModalClass(null)}
          classGroup={detailModalClass}
          lessons={lessons}
          onOpenLessonModal={handleOpenLessonModal}
          onEditClass={(c) => {
            setDetailModalClass(null);
            setClassFormState({ isOpen: true, editingClass: c });
          }}
        />
      )}

      {/* Modal: Formulário de Turma (Cadastrar / Editar) */}
      {classFormState.isOpen && (
        <ClassFormModal
          isOpen={classFormState.isOpen}
          onClose={() => setClassFormState({ isOpen: false, editingClass: null })}
          onSaveClass={handleSaveClass}
          editingClass={classFormState.editingClass}
        />
      )}

      {/* Modal: Formulário de Tarefa de Casa (Cadastrar / Editar) */}
      {homeworkFormState.isOpen && (
        <HomeworkFormModal
          isOpen={homeworkFormState.isOpen}
          onClose={() => setHomeworkFormState({ isOpen: false, editingHomework: null })}
          onSave={handleSaveHomeworkManual}
          editingHomework={homeworkFormState.editingHomework}
          classes={classes}
          preselectedClassId={homeworkFormState.preselectedClassId}
        />
      )}

      {/* Modal: Visualizar e Copiar Mensagem Semanal (WhatsApp) */}
      {copyMessageState.isOpen && copyMessageState.classGroup && (
        <CopyMessageModal
          isOpen={copyMessageState.isOpen}
          onClose={() => setCopyMessageState(prev => ({ ...prev, isOpen: false }))}
          message={copyMessageState.message}
          classGroup={copyMessageState.classGroup}
          lessonTitle={copyMessageState.lessonTitle}
          hasHomework={copyMessageState.hasHomework}
          homework={copyMessageState.homework}
          homeworkDueDate={copyMessageState.homeworkDueDate}
        />
      )}

      {/* Container de Toasts / Notificações */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
