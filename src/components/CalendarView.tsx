import React, { useState } from 'react';
import type { RoutineItem, BillItem, IncomeItem, ClientItem, AppSettings } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, CreditCard, ArrowUpRight, Users } from 'lucide-react';

interface CalendarViewProps {
  routines: RoutineItem[];
  bills: BillItem[];
  incomes: IncomeItem[];
  clients: ClientItem[];
  settings: AppSettings;
  toggleRoutine: (id: string) => void;
  toggleBill: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  routines,
  bills,
  incomes,
  clients,
  settings,
  toggleRoutine,
  toggleBill,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to format date key YYYY-MM-DD
  const makeDateKey = (dayNum: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Group events by date string YYYY-MM-DD
  const getEventsForDate = (dateKey: string) => {
    const dayBills = bills.filter((b) => b.dueDate === dateKey);
    const dayIncomes = incomes.filter((i) => i.date === dateKey);
    const dayClients = clients.filter((c) => c.expectedDate === dateKey);
    const dayRoutines = routines.filter((r) => r.dueDate === dateKey);

    return { dayBills, dayIncomes, dayClients, dayRoutines };
  };

  const selectedDayEvents = selectedDay ? getEventsForDate(selectedDay) : null;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-6 w-full max-w-full overflow-x-hidden">
      {/* Calendar Header */}
      <div className="bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-400" /> Calendário Mensal do Casal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Veja vencimentos, recebimentos e tarefas dia a dia.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-white px-2 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 sm:p-4 shadow-xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2 pb-2 border-b border-slate-700/60">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-24 bg-slate-900/30 rounded-xl opacity-30" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = makeDateKey(dayNum);
            const { dayBills, dayIncomes, dayClients, dayRoutines } = getEventsForDate(dateKey);

            const isToday = dateKey === todayStr;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDay(dateKey)}
                className={`h-16 sm:h-24 p-1.5 rounded-xl border transition cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                  isToday
                    ? 'bg-rose-950/40 border-rose-500/80 shadow-md ring-1 ring-rose-500/50'
                    : selectedDay === dateKey
                    ? 'bg-slate-700/80 border-slate-500'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && <span className="text-[9px] text-rose-300 font-semibold hidden sm:inline">Hoje</span>}
                </div>

                {/* Event Indicators/Badges */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayBills.length > 0 && (
                    <div className="flex items-center gap-1 bg-red-500/20 text-red-300 px-1 py-0.5 rounded text-[9px] font-bold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="truncate">{dayBills.length} Contas</span>
                    </div>
                  )}
                  {dayIncomes.length > 0 && (
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded text-[9px] font-bold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">+{formatCurrency(dayIncomes.reduce((a, b) => a + b.amount, 0))}</span>
                    </div>
                  )}
                  {dayClients.length > 0 && (
                    <div className="flex items-center gap-1 bg-sky-500/20 text-sky-300 px-1 py-0.5 rounded text-[9px] font-bold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{dayClients.length} Clientes</span>
                    </div>
                  )}
                  {dayRoutines.length > 0 && (
                    <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded text-[9px] font-bold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span className="truncate">{dayRoutines.length} Rotinas</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Drawer / Modal */}
      {selectedDay && selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-400" />
                Eventos do Dia {selectedDay.split('-').reverse().join('/')}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for selected day */}
            <div className="space-y-4 text-xs">
              {/* Bills on this day */}
              {selectedDayEvents.dayBills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-rose-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Contas a Pagar ({selectedDayEvents.dayBills.length})
                  </h4>
                  {selectedDayEvents.dayBills.map((b) => (
                    <div key={b.id} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{b.description}</p>
                        <p className="text-[10px] text-slate-400">
                          Resp: {b.responsible === 'ele' ? settings.husbandName : b.responsible === 'ela' ? settings.wifeName : 'Ambos'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-300">{formatCurrency(b.amount)}</span>
                        <button
                          onClick={() => toggleBill(b.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            b.paid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {b.paid ? 'PAGO' : 'Pagar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Incomes on this day */}
              {selectedDayEvents.dayIncomes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Entradas de Dinheiro ({selectedDayEvents.dayIncomes.length})
                  </h4>
                  {selectedDayEvents.dayIncomes.map((i) => (
                    <div key={i.id} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{i.description}</p>
                        <p className="text-[10px] text-slate-400">
                          Recebido por: {i.receivedBy === 'ele' ? settings.husbandName : i.receivedBy === 'ela' ? settings.wifeName : 'Ambos'}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-400">+{formatCurrency(i.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Clients on this day */}
              {selectedDayEvents.dayClients.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sky-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Clientes a Receber ({selectedDayEvents.dayClients.length})
                  </h4>
                  {selectedDayEvents.dayClients.map((c) => (
                    <div key={c.id} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{c.clientName}</p>
                        <p className="text-[10px] text-slate-400">{c.serviceName}</p>
                      </div>
                      <span className="font-bold text-sky-400">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Routines on this day */}
              {selectedDayEvents.dayRoutines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Rotinas & Tarefas ({selectedDayEvents.dayRoutines.length})
                  </h4>
                  {selectedDayEvents.dayRoutines.map((r) => (
                    <div key={r.id} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={r.completed}
                          onChange={() => toggleRoutine(r.id)}
                          className="w-4 h-4 rounded text-rose-500"
                        />
                        <p className={`font-medium ${r.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {r.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayEvents.dayBills.length === 0 &&
                selectedDayEvents.dayIncomes.length === 0 &&
                selectedDayEvents.dayClients.length === 0 &&
                selectedDayEvents.dayRoutines.length === 0 && (
                  <p className="text-center py-6 text-slate-400">Nenhum evento agendado para este dia.</p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
