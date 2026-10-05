export interface Student {
  id: string;
  name: string;
}

export interface LessonRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g., "Lesson 1 - Sit. 1 and 2"
  content?: string; // detailed topics covered
  homework?: string; // tarefinha de casa
  homeworkDueDate?: string; // data de entrega da tarefa (ex: 23/09)
  isCompletedLesson?: boolean; // completou a lesson
  absentStudentIds: string[]; // IDs dos alunos que faltaram
  createdAt: string;
}

export interface ClassGroup {
  id: string;
  code: string; // e.g., "ESPI2", "TT8"
  name: string; // e.g., "English Speaking People 2"
  color: string; // Tailwind color theme identifier (e.g. 'blue', 'indigo', 'emerald', 'sky', 'rose')
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  startTime: string; // e.g. "14:00"
  endTime: string; // e.g. "15:30"
  durationMinutes: number; // e.g. 90
  semesterHours?: number; // e.g. 60
  room?: string; // e.g. "Sala 02"
  currentLessonPlan?: string; // Próxima lição planejada e.g. "Lesson 1 - Sit. 1 and 2"
  students: Student[];
  createdAt: string;
}

export interface TeacherProfile {
  name: string;
  school: string;
  role: string;
}

export interface StudentHomeworkStatus {
  studentId: string;
  delivered: boolean;
  deliveredAt?: string;
  corrected: boolean;
  note?: string;
}

export interface HomeworkAssignment {
  id: string;
  classId: string;
  lessonId?: string;
  title: string; // Ex: "Workbook págs. 14 e 15"
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // Ex: "23/09" ou "2026-09-24"
  notes?: string;
  submissions: Record<string, StudentHomeworkStatus>; // studentId -> status
  createdAt: string;
}

export type TabType = 'home' | 'classes' | 'homework' | 'settings';

