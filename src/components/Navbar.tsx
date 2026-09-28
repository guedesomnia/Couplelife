import React from 'react';
import { Home, CheckSquare, DollarSign, Target, Settings, Heart } from 'lucide-react';

export type TabType = 'dashboard' | 'routines' | 'finances' | 'goals';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openSettings: () => void;
  husbandName: string;
  wifeName: string;
  userFilter: 'all' | 'ele' | 'ela' | 'ambos';
  setUserFilter: (filter: 'all' | 'ele' | 'ela' | 'ambos') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  husbandName,
  wifeName,
  userFilter,
  setUserFilter,
}) => {
  return (
    <>
      {/* Top Header with iOS Safe Area Top padding */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3 pt-safe pb-2.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-1 truncate">
                <span className="text-sky-400">{husbandName}</span>
                <span className="text-rose-400 font-serif">&</span>
                <span className="text-pink-400">{wifeName}</span>
              </h1>
              <p className="text-[10px] text-slate-400 truncate">Planejador do Casal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Person Toggle Filter */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700/60">
              <button
                onClick={() => setUserFilter('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  userFilter === 'all'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ver Tudo"
              >
                Tudo
              </button>
              <button
                onClick={() => setUserFilter('ele')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  userFilter === 'ele'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow'
                    : 'text-slate-400 hover:text-sky-300'
                }`}
                title={`Apenas ${husbandName}`}
              >
                🙋‍♂️ {husbandName}
              </button>
              <button
                onClick={() => setUserFilter('ela')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  userFilter === 'ela'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
                title={`Apenas ${wifeName}`}
              >
                🙋‍♀️ {wifeName}
              </button>
            </div>

            <button
              onClick={openSettings}
              className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition active:scale-95 border border-slate-700/60 shrink-0"
              title="Configurações & Sync"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Bar with iOS Safe Area Bottom padding */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-1.5 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition active:scale-95 ${
              activeTab === 'dashboard'
                ? 'text-rose-400 bg-rose-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('routines')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition active:scale-95 ${
              activeTab === 'routines'
                ? 'text-rose-400 bg-rose-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px]">Rotinas</span>
          </button>

          <button
            onClick={() => setActiveTab('finances')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition active:scale-95 ${
              activeTab === 'finances'
                ? 'text-rose-400 bg-rose-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px]">Finanças</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition active:scale-95 ${
              activeTab === 'goals'
                ? 'text-rose-400 bg-rose-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px]">Objetivos</span>
          </button>
        </div>
      </nav>
    </>
  );
};
