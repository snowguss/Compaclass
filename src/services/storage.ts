import { ClassGroup, LessonRecord, TeacherProfile, HomeworkAssignment } from '../types';
import { INITIAL_CLASSES, INITIAL_LESSON_RECORDS, INITIAL_TEACHER_PROFILE, INITIAL_HOMEWORK_ASSIGNMENTS } from '../data/initialData';

const STORAGE_KEYS = {
  CLASSES: 'ccaa_classes_v1',
  LESSONS: 'ccaa_lessons_v1',
  TEACHER: 'ccaa_teacher_v1',
  HOMEWORK: 'ccaa_homework_v1'
};

export const StorageService = {
  getClasses(): ClassGroup[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler turmas do storage', e);
    }
    this.saveClasses(INITIAL_CLASSES);
    return INITIAL_CLASSES;
  },

  saveClasses(classes: ClassGroup[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Erro ao salvar turmas', e);
    }
  },

  getLessons(): LessonRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler lições do storage', e);
    }
    this.saveLessons(INITIAL_LESSON_RECORDS);
    return INITIAL_LESSON_RECORDS;
  },

  saveLessons(lessons: LessonRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (e) {
      console.error('Erro ao salvar lições', e);
    }
  },

  getHomework(): HomeworkAssignment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler tarefas do storage', e);
    }
    this.saveHomework(INITIAL_HOMEWORK_ASSIGNMENTS);
    return INITIAL_HOMEWORK_ASSIGNMENTS;
  },

  saveHomework(homework: HomeworkAssignment[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homework));
    } catch (e) {
      console.error('Erro ao salvar tarefas', e);
    }
  },

  getTeacher(): TeacherProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEACHER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler perfil do professor', e);
    }
    this.saveTeacher(INITIAL_TEACHER_PROFILE);
    return INITIAL_TEACHER_PROFILE;
  },

  saveTeacher(teacher: TeacherProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(teacher));
    } catch (e) {
      console.error('Erro ao salvar professor', e);
    }
  },

  /**
   * Retorna a última aula registrada para uma turma específica
   */
  getLastLesson(classId: string, lessons: LessonRecord[], beforeDate?: string): LessonRecord | undefined {
    const classLessons = lessons.filter(l => l.classId === classId);
    if (classLessons.length === 0) return undefined;

    // Ordena por data decrescente
    const sorted = [...classLessons].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    if (beforeDate) {
      const beforeTime = new Date(beforeDate).getTime();
      return sorted.find(l => new Date(l.date).getTime() < beforeTime);
    }

    return sorted[0];
  },

  /**
   * Verifica se uma aula já foi registrada hoje para uma turma
   */
  getTodayLesson(classId: string, lessons: LessonRecord[], todayDateStr: string): LessonRecord | undefined {
    return lessons.find(l => l.classId === classId && l.date === todayDateStr);
  },

  /**
   * Reseta todos os dados para o padrão inicial
   */
  resetToDefaults() {
    this.saveClasses(INITIAL_CLASSES);
    this.saveLessons(INITIAL_LESSON_RECORDS);
    this.saveTeacher(INITIAL_TEACHER_PROFILE);
    this.saveHomework(INITIAL_HOMEWORK_ASSIGNMENTS);
  }
};
