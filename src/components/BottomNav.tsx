import React from 'react';
import { TabType } from '../types';
import { Home, List, CheckSquare, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingLessonsCount?: number;
  pendingHomeworkCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  pendingLessonsCount = 0,
  pendingHomeworkCount = 0
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-lg transition-colors"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {/* Aba Início (Home) */}
        <button
          onClick={() => onChangeTab('home')}
          id="nav-btn-home"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#002B49] dark:text-sky-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 stroke-[2.2]" />
            {pendingLessonsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {pendingLessonsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Início</span>
          {currentTab === 'home' && (
            <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#002B49] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        {/* Aba Turmas & Histórico */}
        <button
          onClick={() => onChangeTab('classes')}
          id="nav-btn-classes"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 cursor-pointer ${
            currentTab === 'classes'
              ? 'text-[#002B49] dark:text-sky-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <List className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] mt-1 tracking-tight">Turmas</span>
          {currentTab === 'classes' && (
            <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#002B49] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        {/* Aba Tarefas (Homework) */}
        <button
          onClick={() => onChangeTab('homework')}
          id="nav-btn-homework"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 cursor-pointer ${
            currentTab === 'homework'
              ? 'text-[#002B49] dark:text-sky-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            {pendingHomeworkCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-sky-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {pendingHomeworkCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Tarefas</span>
          {currentTab === 'homework' && (
            <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#002B49] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        {/* Aba Configurações */}
        <button
          onClick={() => onChangeTab('settings')}
          id="nav-btn-settings"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 cursor-pointer ${
            currentTab === 'settings'
              ? 'text-[#002B49] dark:text-sky-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] mt-1 tracking-tight">Ajustes</span>
          {currentTab === 'settings' && (
            <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#002B49] dark:bg-sky-400 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
