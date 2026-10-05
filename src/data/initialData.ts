import { ClassGroup, LessonRecord, TeacherProfile, HomeworkAssignment } from '../types';

export const INITIAL_TEACHER_PROFILE: TeacherProfile = {
  name: 'Gustavo',
  school: 'CCAA',
  role: 'Teacher'
};

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'class-espi2-afternoon',
    code: 'ESPI2',
    name: 'English Speaking People 2',
    color: 'blue',
    daysOfWeek: [1, 3], // Segundas e Quartas
    startTime: '14:00',
    endTime: '15:30',
    durationMinutes: 90,
    semesterHours: 60,
    room: 'Sala 02',
    currentLessonPlan: 'Lesson 1 - Sit. 1 and 2',
    createdAt: '2026-08-01',
    students: [
      { id: 'st-1', name: 'Lucas Silva' },
      { id: 'st-2', name: 'Mariana Costa' },
      { id: 'st-3', name: 'Pedro Henrique' },
      { id: 'st-4', name: 'Beatriz Lima' },
      { id: 'st-5', name: 'Gabriel Santos' },
      { id: 'st-6', name: 'Larissa Rocha' }
    ]
  },
  {
    id: 'class-tt8-evening',
    code: 'TT8',
    name: 'Teen Talk 8',
    color: 'sky',
    daysOfWeek: [1, 3], // Segundas e Quartas
    startTime: '16:00',
    endTime: '17:30',
    durationMinutes: 90,
    semesterHours: 60,
    room: 'Sala 04',
    currentLessonPlan: 'Lesson 4 - Grammar',
    createdAt: '2026-08-01',
    students: [
      { id: 'st-7', name: 'Enzo Ferreira' },
      { id: 'st-8', name: 'Sophia Martins' },
      { id: 'st-9', name: 'Davi Oliveira' },
      { id: 'st-10', name: 'Isabella Souza' },
      { id: 'st-11', name: 'Matheus Ribeiro' }
    ]
  },
  {
    id: 'class-pt3-tuesday',
    code: 'PT3',
    name: 'Pre-Teen 3',
    color: 'indigo',
    daysOfWeek: [2, 4], // Terças e Quintas
    startTime: '15:00',
    endTime: '16:30',
    durationMinutes: 90,
    semesterHours: 60,
    room: 'Sala 01',
    currentLessonPlan: 'Lesson 2 - Oral Practice & Games',
    createdAt: '2026-08-01',
    students: [
      { id: 'st-12', name: 'Arthur Mendes' },
      { id: 'st-13', name: 'Alice Guimarães' },
      { id: 'st-14', name: 'Bernardo Castro' },
      { id: 'st-15', name: 'Helena Duarte' }
    ]
  },
  {
    id: 'class-tt6-tuesday',
    code: 'TT6',
    name: 'Teen Talk 6',
    color: 'cyan',
    daysOfWeek: [2, 4], // Terças e Quintas
    startTime: '17:00',
    endTime: '18:30',
    durationMinutes: 90,
    semesterHours: 60,
    room: 'Sala 03',
    currentLessonPlan: 'Lesson 3 - Sit. 1 and Vocabulary',
    createdAt: '2026-08-01',
    students: [
      { id: 'st-16', name: 'Guilherme Neves' },
      { id: 'st-17', name: 'Manuela Farias' },
      { id: 'st-18', name: 'Cauã Moreira' },
      { id: 'st-19', name: 'Lívia Pires' }
    ]
  },
  {
    id: 'class-kids2-saturday',
    code: 'Kids 2',
    name: 'Kids\' Course 2',
    color: 'amber',
    daysOfWeek: [6], // Sábados (1x por semana)
    startTime: '09:00',
    endTime: '11:00',
    durationMinutes: 120,
    semesterHours: 45,
    room: 'Sala Kids',
    currentLessonPlan: 'Unit 5 - Colors and Animals Story',
    createdAt: '2026-08-01',
    students: [
      { id: 'st-20', name: 'Theo Barbosa' },
      { id: 'st-21', name: 'Laura Camargo' },
      { id: 'st-22', name: 'Noah Peixoto' }
    ]
  }
];

export const INITIAL_LESSON_RECORDS: LessonRecord[] = [
  {
    id: 'rec-espi2-last',
    classId: 'class-espi2-afternoon',
    date: '2026-09-16', // Quarta anterior
    title: 'Lesson 1 - Warm up & Sit. 1',
    content: 'Introdução da lição 1, vocabulário inicial de apresentações e Situação 1 com repetição em duplas e áudio nativo.',
    homework: 'Workbook pág. 8 (exercícios 1 ao 3)',
    homeworkDueDate: '21/09',
    absentStudentIds: ['st-3'], // Pedro Henrique
    createdAt: '2026-09-16T15:35:00'
  },
  {
    id: 'rec-tt8-last',
    classId: 'class-tt8-evening',
    date: '2026-09-16',
    title: 'Lesson 3 - Sit. 2 & Listening Lab',
    content: 'Situação 2 lida e interpretada. Prática de listening com áudio rápido e exercícios do livro.',
    homework: 'Write 5 sentences using used to + Workbook p. 24',
    homeworkDueDate: '21/09',
    absentStudentIds: ['st-8'], // Sophia Martins
    createdAt: '2026-09-16T17:35:00'
  },
  {
    id: 'rec-pt3-last',
    classId: 'class-pt3-tuesday',
    date: '2026-09-17',
    title: 'Lesson 1 - Review & Storytelling',
    content: 'Revisão dos cartões de vocabulário e leitura dramática da história.',
    homework: 'Pintar e completar pág. 14',
    homeworkDueDate: '22/09',
    absentStudentIds: ['st-14'], // Bernardo Castro
    createdAt: '2026-09-17T16:32:00'
  }
];

export const INITIAL_HOMEWORK_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: 'hw-espi2-p8',
    classId: 'class-espi2-afternoon',
    lessonId: 'rec-espi2-last',
    title: 'Workbook pág. 8 (exercícios 1 ao 3)',
    assignedDate: '2026-09-16',
    dueDate: '21/09',
    notes: 'Exercícios práticos de introdução e cumprimentos',
    createdAt: '2026-09-16T15:35:00',
    submissions: {
      'st-1': { studentId: 'st-1', delivered: true, corrected: true },
      'st-2': { studentId: 'st-2', delivered: true, corrected: true },
      'st-3': { studentId: 'st-3', delivered: false, corrected: false },
      'st-4': { studentId: 'st-4', delivered: true, corrected: false },
      'st-5': { studentId: 'st-5', delivered: true, corrected: true },
      'st-6': { studentId: 'st-6', delivered: false, corrected: false }
    }
  },
  {
    id: 'hw-tt8-sentences',
    classId: 'class-tt8-evening',
    lessonId: 'rec-tt8-last',
    title: 'Write 5 sentences using used to + Workbook p. 24',
    assignedDate: '2026-09-16',
    dueDate: '21/09',
    notes: 'Atenção especial à estrutura do used to no passado',
    createdAt: '2026-09-16T17:35:00',
    submissions: {
      'st-7': { studentId: 'st-7', delivered: true, corrected: true },
      'st-8': { studentId: 'st-8', delivered: false, corrected: false },
      'st-9': { studentId: 'st-9', delivered: true, corrected: false },
      'st-10': { studentId: 'st-10', delivered: true, corrected: false },
      'st-11': { studentId: 'st-11', delivered: true, corrected: true }
    }
  },
  {
    id: 'hw-pt3-p14',
    classId: 'class-pt3-tuesday',
    lessonId: 'rec-pt3-last',
    title: 'Pintar e completar pág. 14',
    assignedDate: '2026-09-17',
    dueDate: '22/09',
    notes: 'Ilustrações de animais e cores',
    createdAt: '2026-09-17T16:32:00',
    submissions: {
      'st-12': { studentId: 'st-12', delivered: true, corrected: true },
      'st-13': { studentId: 'st-13', delivered: true, corrected: true },
      'st-14': { studentId: 'st-14', delivered: false, corrected: false },
      'st-15': { studentId: 'st-15', delivered: true, corrected: false }
    }
  }
];
