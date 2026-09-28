import React from 'react';
import { Home, CheckSquare, DollarSign, Target, Settings, Heart } from 'lucide-react';

export type TabType = 'dashboard' | 'routines' | 'finances' | 'goals';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openSettings: () => void;
  husbandName: string;
  wifeName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  husbandName,
  wifeName,
}) => {
  return (
    <>
      {/* Top Header for Mobile & Desktop */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight flex items-center gap-1.5">
                {husbandName} <span className="text-rose-400 font-serif">&</span> {wifeName}
              </h1>
              <p className="text-xs text-slate-400">Nossa Vida em Casal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openSettings}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition active:scale-95 flex items-center gap-1.5 text-xs font-medium border border-slate-700/50"
              title="Configurações & Backup"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Ajustes & Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar (Fixed for Mobile & Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-rose-400 bg-rose-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px]">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('routines')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'routines'
                ? 'text-rose-400 bg-rose-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[11px]">Rotinas</span>
          </button>

          <button
            onClick={() => setActiveTab('finances')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'finances'
                ? 'text-rose-400 bg-rose-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[11px]">Finanças</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'goals'
                ? 'text-rose-400 bg-rose-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[11px]">Objetivos</span>
          </button>
        </div>
      </nav>
    </>
  );
};
