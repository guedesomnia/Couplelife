import React, { useState } from 'react';
import type { IncomeItem, ClientItem, AppSettings } from '../types';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyReportViewProps {
  incomes: IncomeItem[];
  clients: ClientItem[];
  settings: AppSettings;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  incomes,
  clients,
  settings,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Helper to filter entries in current month
  const isDateInSelectedMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === month;
  };

  // Weekly breakdown definitions
  const weeks = [
    { name: 'Semana 1 (Dias 1-7)', startDay: 1, endDay: 7 },
    { name: 'Semana 2 (Dias 8-14)', startDay: 8, endDay: 14 },
    { name: 'Semana 3 (Dias 15-21)', startDay: 15, endDay: 21 },
    { name: 'Semana 4 (Dias 22-31)', startDay: 22, endDay: 31 },
  ];

  // Calculate earnings per week
  const weeklyStats = weeks.map((week) => {
    let husbandGains = 0;
    let wifeGains = 0;
    let coupleGains = 0;

    // Filter incomes
    incomes.forEach((inc) => {
      if (isDateInSelectedMonth(inc.date)) {
        const day = parseInt(inc.date.split('-')[2], 10);
        if (day >= week.startDay && day <= week.endDay) {
          if (inc.receivedBy === 'ele') husbandGains += inc.amount;
          else if (inc.receivedBy === 'ela') wifeGains += inc.amount;
          else coupleGains += inc.amount;
        }
      }
    });

    // Filter paid clients
    clients.forEach((c) => {
      const targetDate = c.receivedDate || c.expectedDate;
      if (c.status === 'pago' && isDateInSelectedMonth(targetDate)) {
        const day = parseInt(targetDate.split('-')[2], 10);
        if (day >= week.startDay && day <= week.endDay) {
          if (c.responsible === 'ele') husbandGains += c.amount;
          else if (c.responsible === 'ela') wifeGains += c.amount;
          else coupleGains += c.amount;
        }
      }
    });

    const totalWeekly = husbandGains + wifeGains + coupleGains;

    return {
      ...week,
      husbandGains,
      wifeGains,
      coupleGains,
      totalWeekly,
    };
  });

  const totalMonthGains = weeklyStats.reduce((acc, curr) => acc + curr.totalWeekly, 0);
  const totalHusbandMonth = weeklyStats.reduce((acc, curr) => acc + curr.husbandGains, 0);
  const totalWifeMonth = weeklyStats.reduce((acc, curr) => acc + curr.wifeGains, 0);

  return (
    <div className="space-y-6 pb-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Relatório Semanal de Ganhos
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Acompanhe os ganhos por semana e a divisão dos resultados do casal.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-white px-2 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/60 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Total de Ganhos no Mês</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(totalMonthGains)}</p>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/60 shadow-md">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            🙋‍♂️ Ganhos {settings.husbandName}
          </span>
          <p className="text-xl font-extrabold text-sky-400 mt-1">{formatCurrency(totalHusbandMonth)}</p>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/60 shadow-md">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            🙋‍♀️ Ganhos {settings.wifeName}
          </span>
          <p className="text-xl font-extrabold text-rose-400 mt-1">{formatCurrency(totalWifeMonth)}</p>
        </div>
      </div>

      {/* Weekly Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white">Detalhamento por Semana</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyStats.map((week, idx) => (
            <div
              key={idx}
              className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm sm:text-base">{week.name}</h4>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(week.totalWeekly)}
                </span>
              </div>

              {/* Breakdown by Husband vs Wife */}
              <div className="space-y-2 pt-2 border-t border-slate-700/50 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1 text-sky-300">
                    🙋‍♂️ {settings.husbandName}:
                  </span>
                  <span className="font-bold text-sky-300">{formatCurrency(week.husbandGains)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1 text-rose-300">
                    🙋‍♀️ {settings.wifeName}:
                  </span>
                  <span className="font-bold text-rose-300">{formatCurrency(week.wifeGains)}</span>
                </div>

                {week.coupleGains > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-amber-300">
                      👩‍❤️‍👨 Casal / Ambos:
                    </span>
                    <span className="font-bold text-amber-300">{formatCurrency(week.coupleGains)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar comparison */}
              {week.totalWeekly > 0 && (
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-700">
                  {week.husbandGains > 0 && (
                    <div
                      className="bg-sky-500 h-full"
                      style={{ width: `${(week.husbandGains / week.totalWeekly) * 100}%` }}
                      title={`${settings.husbandName}: ${formatCurrency(week.husbandGains)}`}
                    />
                  )}
                  {week.wifeGains > 0 && (
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(week.wifeGains / week.totalWeekly) * 100}%` }}
                      title={`${settings.wifeName}: ${formatCurrency(week.wifeGains)}`}
                    />
                  )}
                  {week.coupleGains > 0 && (
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(week.coupleGains / week.totalWeekly) * 100}%` }}
                      title={`Casal: ${formatCurrency(week.coupleGains)}`}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
