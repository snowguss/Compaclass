import React from 'react';
import { formatGreetingDate } from '../utils/dateUtils';
import { TeacherProfile } from '../types';

interface HeaderProps {
  teacher: TeacherProfile;
  currentDate?: Date;
  showGreeting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  teacher, 
  currentDate = new Date(),
  showGreeting = true
}) => {
  return (
    <header className={`pt-6 px-4 sm:px-6 ${showGreeting ? 'pb-4' : 'pb-2'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#002B49] dark:bg-sky-600 text-white shadow-xs">
              {teacher.school || 'CCAA'}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Diário do Professor
            </span>
          </div>
          
          {/* Saudação com tipografia moderna exibida apenas na tela inicial */}
          {showGreeting && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Olá, {teacher.name || 'Professor'}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                {formatGreetingDate(currentDate)}
              </p>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
