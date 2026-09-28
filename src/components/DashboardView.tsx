import React from 'react';
import type {
  RoutineItem,
  BillItem,
  IncomeItem,
  ClientItem,
  GoalItem,
  AppSettings,
  ResponsiblePerson,
} from '../types';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import type { TabType } from './Navbar';

interface DashboardViewProps {
  routines: RoutineItem[];
  bills: BillItem[];
  incomes: IncomeItem[];
  clients: ClientItem[];
  goals: GoalItem[];
  settings: AppSettings;
  userFilter: 'all' | 'ele' | 'ela' | 'ambos';
  setActiveTab: (tab: TabType) => void;
  toggleRoutine: (id: string) => void;
  toggleBill: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  routines,
  bills,
  incomes,
  clients,
  goals,
  settings,
  userFilter,
  setActiveTab,
  toggleRoutine,
  toggleBill,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  // Helper badge component for responsible person
  const renderResponsibleBadge = (resp: ResponsiblePerson) => {
    if (resp === 'ele') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 inline-flex items-center gap-1">
          🙋‍♂️ {settings.husbandName}
        </span>
      );
    }
    if (resp === 'ela') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
          🙋‍♀️ {settings.wifeName}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
        👩‍❤️‍👨 Casal
      </span>
    );
  };

  // Filter items based on active user filter
  const filterByPerson = <T extends { responsible?: ResponsiblePerson; receivedBy?: ResponsiblePerson }>(
    items: T[]
  ): T[] => {
    if (userFilter === 'all') return items;
    return items.filter((item) => {
      const resp = item.responsible || item.receivedBy;
      return resp === userFilter || resp === 'ambos';
    });
  };

  const filteredBills = filterByPerson(bills);
  const filteredIncomes = filterByPerson(incomes);
  const filteredRoutines = filterByPerson(routines);

  // Financial Calculations
  const totalIncomes = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPendingBills = filteredBills
    .filter((b) => !b.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidBills = filteredBills
    .filter((b) => b.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalClientsPending = clients
    .filter((c) => c.status !== 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const projectedBalance = totalIncomes + totalClientsPending - totalPendingBills - totalPaidBills;

  // Urgent Bills (Pending & Due in <= 3 days or overdue)
  const urgentBills = filteredBills.filter((b) => {
    if (b.paid) return false;
    const diff = (new Date(b.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff <= 3;
  });

  const urgentClients = clients.filter((c) => c.status !== 'pago');
  const pendingRoutines = filteredRoutines.filter((r) => !r.completed);
  const activeGoal = goals.find((g) => !g.achieved);

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 w-full max-w-full overflow-x-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-rose-950/40 to-slate-800 p-4 sm:p-5 rounded-2xl border border-rose-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Resumo do Casal
              </span>
              {userFilter !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-amber-300 border border-slate-600">
                  Filtro: {userFilter === 'ele' ? settings.husbandName : userFilter === 'ela' ? settings.wifeName : 'Casal'}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">
              Olá, {settings.husbandName} & {settings.wifeName}! ❤️
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Panorama das contas, afazeres e sonhos de vocês.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('finances')}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-1.5 active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Nova Conta / Receita
          </button>
        </div>
      </div>

      {/* Urgent Alerts Section */}
      {urgentBills.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
            <span>Atenção: Contas Vencendo ou Atrasadas ({urgentBills.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {urgentBills.map((bill) => {
              const isOverdue = bill.dueDate < todayStr;
              return (
                <div
                  key={bill.id}
                  className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-white text-xs sm:text-sm truncate">
                        {bill.description}
                      </span>
                      {isOverdue ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          ATRASADA
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                          Vence {formatDateBR(bill.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-bold text-slate-200">{formatCurrency(bill.amount)}</span>
                      {renderResponsibleBadge(bill.responsible)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBill(bill.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition active:scale-95 whitespace-nowrap shrink-0"
                  >
                    Pagar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Incomes */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Entradas</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-extrabold text-emerald-400 truncate">
              {formatCurrency(totalIncomes)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Salários & Freelas</p>
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Contas a Pagar</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-extrabold text-rose-400 truncate">
              {formatCurrency(totalPendingBills)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {filteredBills.filter((b) => !b.paid).length} pendentes
            </p>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>A Receber</span>
            <Users className="w-4 h-4 text-sky-400 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-extrabold text-sky-400 truncate">
              {formatCurrency(totalClientsPending)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Clientes</p>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Saldo Previsto</span>
            <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div>
            <p
              className={`text-base sm:text-xl font-extrabold truncate ${
                projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(projectedBalance)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Previsão final</p>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Routines List */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-400 shrink-0" /> Rotinas da Casa & Saúde
              </h3>
              <button
                onClick={() => setActiveTab('routines')}
                className="text-xs text-rose-400 hover:underline font-medium"
              >
                Ver todas ({filteredRoutines.length})
              </button>
            </div>

            {pendingRoutines.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1 opacity-80" />
                <p className="text-xs">Tudo concluído por aqui! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRoutines.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-2.5 flex items-center justify-between gap-2.5 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleRoutine(item.id)}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 accent-rose-500 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="capitalize px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                            {item.category}
                          </span>
                          {renderResponsibleBadge(item.responsible)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('routines')}
            className="mt-3 w-full py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition"
          >
            + Adicionar Nova Tarefa
          </button>
        </div>

        {/* Goal Highlight & Pending Clients */}
        <div className="space-y-4 sm:space-y-6">
          {activeGoal && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Próxima Conquista
                </span>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  Ver Objetivos
                </button>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mb-2">{activeGoal.title}</h4>

              {activeGoal.targetAmount && activeGoal.currentAmount !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-medium">
                    <span>{formatCurrency(activeGoal.currentAmount)}</span>
                    <span>Meta: {formatCurrency(activeGoal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-700/70 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-600">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-right text-amber-400 mt-1 font-semibold">
                    {Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}% Alcançado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pending Clients */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400 shrink-0" /> Clientes a Receber
              </h3>
              <button
                onClick={() => setActiveTab('finances')}
                className="text-xs text-sky-400 hover:underline font-medium"
              >
                Gerenciar
              </button>
            </div>

            {urgentClients.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">
                Nenhum pagamento pendente no momento.
              </p>
            ) : (
              <div className="space-y-2">
                {urgentClients.slice(0, 3).map((client) => (
                  <div
                    key={client.id}
                    className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {client.clientName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {client.serviceName} • {formatDateBR(client.expectedDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-sky-400">
                        {formatCurrency(client.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
