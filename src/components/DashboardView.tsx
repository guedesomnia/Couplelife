import React from 'react';
import type {
  RoutineItem,
  BillItem,
  IncomeItem,
  ClientItem,
  GoalItem,
  AppSettings,
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
  setActiveTab,
  toggleRoutine,
  toggleBill,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for formatting currency
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Helper for date formatting
  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  // Financial Calculations
  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPendingBills = bills
    .filter((b) => !b.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidBills = bills
    .filter((b) => b.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalClientsPending = clients
    .filter((c) => c.status !== 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const projectedBalance = totalIncomes + totalClientsPending - totalPendingBills - totalPaidBills;

  // Urgent Bills (Pending & Due in <= 3 days or already overdue)
  const urgentBills = bills.filter((b) => {
    if (b.paid) return false;
    const diff = (new Date(b.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff <= 3;
  });

  // Pending Clients due soon
  const urgentClients = clients.filter((c) => c.status !== 'pago');

  // Pending Routines
  const pendingRoutines = routines.filter((r) => !r.completed);

  // Top active goal
  const activeGoal = goals.find((g) => !g.achieved);

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-rose-950/40 to-slate-800 p-5 rounded-2xl border border-rose-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              Resumo do Dia
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Olá, {settings.husbandName} & {settings.wifeName}! ❤️
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Aqui está o panorama atual das tarefas, contas e objetivos do casal.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('finances')}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Nova Conta / Receita
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Section */}
      {urgentBills.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>Atenção: Contas Vencendo ou Atrasadas ({urgentBills.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {urgentBills.map((bill) => {
              const isOverdue = bill.dueDate < todayStr;
              return (
                <div
                  key={bill.id}
                  className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm truncate">
                        {bill.description}
                      </span>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          ATRASADA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                          VENCE DIA {formatDateBR(bill.dueDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatCurrency(bill.amount)} • Resp: {bill.responsible === 'ele' ? settings.husbandName : bill.responsible === 'ela' ? settings.wifeName : 'Ambos'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleBill(bill.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition active:scale-95 whitespace-nowrap"
                  >
                    Pagar Agora
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Incomes */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Entradas no Mês</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400">
              {formatCurrency(totalIncomes)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Salários + Freelas</p>
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Contas a Pagar</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-rose-400">
              {formatCurrency(totalPendingBills)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {bills.filter((b) => !b.paid).length} contas pendentes
            </p>
          </div>
        </div>

        {/* Clients to receive */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>A Receber (Clientes)</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-sky-400">
              {formatCurrency(totalClientsPending)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {urgentClients.length} recebimentos aguardados
            </p>
          </div>
        </div>

        {/* Projected Balance */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Saldo Líquido Previsto</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p
              className={`text-lg sm:text-xl font-extrabold ${
                projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(projectedBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Previsão final</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Routines vs Clients & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Routines & House/Health tasks */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-400" /> Rotinas & Pendências da Casa / Saúde
              </h3>
              <button
                onClick={() => setActiveTab('routines')}
                className="text-xs text-rose-400 hover:underline font-medium"
              >
                Ver todas ({routines.length})
              </button>
            </div>

            {pendingRoutines.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm">Todas as rotinas estão concluídas! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingRoutines.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleRoutine(item.id)}
                        className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 accent-rose-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="capitalize px-2 py-0.5 bg-slate-800 rounded-md text-slate-300">
                            {item.category}
                          </span>
                          <span>• Resp: {item.responsible === 'ele' ? settings.husbandName : item.responsible === 'ela' ? settings.wifeName : 'Ambos'}</span>
                          {item.dueDate && <span>• {formatDateBR(item.dueDate)}</span>}
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
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition"
          >
            + Adicionar Nova Tarefa / Rotina
          </button>
        </div>

        {/* Right Column: Clients & Goal Progress */}
        <div className="space-y-6">
          {/* Active Goal Highlight */}
          {activeGoal && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Próxima Conquista do Casal
                </span>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  Ver Objetivos
                </button>
              </div>

              <h4 className="text-base font-bold text-white mb-2">{activeGoal.title}</h4>

              {activeGoal.targetAmount && activeGoal.currentAmount !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span>
                      {formatCurrency(activeGoal.currentAmount)} acumulados
                    </span>
                    <span>Meta: {formatCurrency(activeGoal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-700/70 h-3 rounded-full overflow-hidden p-0.5 border border-slate-600">
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
                  <p className="text-[11px] text-right text-amber-400 mt-1 font-semibold">
                    {Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}% Alcançado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pending Clients */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" /> Clientes a Receber em Breve
              </h3>
              <button
                onClick={() => setActiveTab('finances')}
                className="text-xs text-sky-400 hover:underline font-medium"
              >
                Gerenciar
              </button>
            </div>

            {urgentClients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Nenhum pagamento de cliente pendente no momento.
              </p>
            ) : (
              <div className="space-y-2.5">
                {urgentClients.slice(0, 3).map((client) => (
                  <div
                    key={client.id}
                    className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{client.clientName}</p>
                      <p className="text-xs text-slate-400">
                        {client.serviceName} • Previsto: {formatDateBR(client.expectedDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-sky-400">
                        {formatCurrency(client.amount)}
                      </span>
                      <div>
                        {client.status === 'atrasado' ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                            Atrasado
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Pendente
                          </span>
                        )}
                      </div>
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
