import React, { useState } from 'react';
import type {
  BillItem,
  IncomeItem,
  ClientItem,
  CategoryBill,
  ResponsiblePerson,
  ClientStatus,
  AppSettings,
} from '../types';
import {
  DollarSign,
  Plus,
  CreditCard,
  ArrowUpRight,
  Users,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react';

interface FinancesViewProps {
  bills: BillItem[];
  incomes: IncomeItem[];
  clients: ClientItem[];
  settings: AppSettings;
  addBill: (bill: Omit<BillItem, 'id' | 'createdAt'>) => void;
  updateBill: (id: string, updated: Partial<BillItem>) => void;
  deleteBill: (id: string) => void;
  toggleBill: (id: string) => void;
  addIncome: (income: Omit<IncomeItem, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, updated: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;
  addClient: (client: Omit<ClientItem, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updated: Partial<ClientItem>) => void;
  deleteClient: (id: string) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  bills,
  incomes,
  clients,
  settings,
  addBill,
  updateBill,
  deleteBill,
  toggleBill,
  addIncome,

  deleteIncome,
  addClient,
  updateClient,
  deleteClient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'incomes' | 'clients'>('bills');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'bill' | 'income' | 'client'>('bill');
  const [editingId, setEditingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Bill Form state
  const [billDesc, setBillDesc] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(todayStr);
  const [billCategory, setBillCategory] = useState<CategoryBill>('moradia');
  const [billResponsible, setBillResponsible] = useState<ResponsiblePerson>('ambos');
  const [billRecurring, setBillRecurring] = useState(true);
  const [billNotes, setBillNotes] = useState('');

  // Income Form state
  const [incDesc, setIncDesc] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState(todayStr);
  const [incCategory, setIncCategory] = useState<'salario' | 'freelance' | 'vendas' | 'outros'>('salario');
  const [incReceivedBy, setIncReceivedBy] = useState<ResponsiblePerson>('ele');
  const [incNotes, setIncNotes] = useState('');

  // Client Form state
  const [clientName, setClientName] = useState('');
  const [clientService, setClientService] = useState('');
  const [clientAmount, setClientAmount] = useState('');
  const [clientExpectedDate, setClientExpectedDate] = useState(todayStr);
  const [clientStatus, setClientStatus] = useState<ClientStatus>('pendente');
  const [clientContact, setClientContact] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  const handleOpenAddBill = () => {
    setModalType('bill');
    setEditingId(null);
    setBillDesc('');
    setBillAmount('');
    setBillDueDate(todayStr);
    setBillCategory('moradia');
    setBillResponsible('ambos');
    setBillRecurring(true);
    setBillNotes('');
    setIsModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setModalType('income');
    setEditingId(null);
    setIncDesc('');
    setIncAmount('');
    setIncDate(todayStr);
    setIncCategory('salario');
    setIncReceivedBy('ele');
    setIncNotes('');
    setIsModalOpen(true);
  };

  const handleOpenAddClient = () => {
    setModalType('client');
    setEditingId(null);
    setClientName('');
    setClientService('');
    setClientAmount('');
    setClientExpectedDate(todayStr);
    setClientStatus('pendente');
    setClientContact('');
    setClientNotes('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'bill') {
      if (!billDesc.trim() || !billAmount) return;
      const numAmount = parseFloat(billAmount);
      if (isNaN(numAmount)) return;

      if (editingId) {
        updateBill(editingId, {
          description: billDesc,
          amount: numAmount,
          dueDate: billDueDate,
          category: billCategory,
          responsible: billResponsible,
          recurring: billRecurring,
          notes: billNotes || undefined,
        });
      } else {
        addBill({
          description: billDesc,
          amount: numAmount,
          dueDate: billDueDate,
          category: billCategory,
          paid: false,
          responsible: billResponsible,
          recurring: billRecurring,
          notes: billNotes || undefined,
        });
      }
    } else if (modalType === 'income') {
      if (!incDesc.trim() || !incAmount) return;
      const numAmount = parseFloat(incAmount);
      if (isNaN(numAmount)) return;

      addIncome({
        description: incDesc,
        amount: numAmount,
        date: incDate,
        category: incCategory,
        receivedBy: incReceivedBy,
        notes: incNotes || undefined,
      });
    } else if (modalType === 'client') {
      if (!clientName.trim() || !clientAmount) return;
      const numAmount = parseFloat(clientAmount);
      if (isNaN(numAmount)) return;

      if (editingId) {
        updateClient(editingId, {
          clientName,
          serviceName: clientService,
          amount: numAmount,
          expectedDate: clientExpectedDate,
          status: clientStatus,
          contactInfo: clientContact || undefined,
          notes: clientNotes || undefined,
        });
      } else {
        addClient({
          clientName,
          serviceName: clientService,
          amount: numAmount,
          expectedDate: clientExpectedDate,
          status: clientStatus,
          contactInfo: clientContact || undefined,
          notes: clientNotes || undefined,
        });
      }
    }

    setIsModalOpen(false);
  };

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBillsPending = bills.filter((b) => !b.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalBillsPaid = bills.filter((b) => b.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalClientsToReceive = clients
    .filter((c) => c.status !== 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Gestão Financeira do Casal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Controle de contas a pagar, salários/entradas e clientes a receber.
          </p>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'bills' && (
            <button
              onClick={handleOpenAddBill}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nova Conta
            </button>
          )}
          {activeSubTab === 'incomes' && (
            <button
              onClick={handleOpenAddIncome}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nova Entrada
            </button>
          )}
          {activeSubTab === 'clients' && (
            <button
              onClick={handleOpenAddClient}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-sky-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Selector */}
      <div className="flex rounded-2xl bg-slate-800/90 p-1.5 border border-slate-700/60 shadow-md">
        <button
          onClick={() => setActiveSubTab('bills')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'bills'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Contas a Pagar ({bills.filter((b) => !b.paid).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('incomes')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'incomes'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Entradas / Receitas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clients')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'clients'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes & Recebimentos</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONTAS A PAGAR */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          {/* Totalizer Header */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400">Total Pendente</span>
              <p className="text-base font-bold text-rose-400">{formatCurrency(totalBillsPending)}</p>
            </div>
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400">Total Já Pago</span>
              <p className="text-base font-bold text-emerald-400">{formatCurrency(totalBillsPaid)}</p>
            </div>
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400">Total de Contas</span>
              <p className="text-base font-bold text-white">{bills.length}</p>
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            {bills.length === 0 ? (
              <p className="text-center py-8 text-slate-400">Nenhuma conta cadastrada.</p>
            ) : (
              bills.map((bill) => {
                const isOverdue = !bill.paid && bill.dueDate < todayStr;
                return (
                  <div
                    key={bill.id}
                    className={`bg-slate-800/90 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-md ${
                      bill.paid
                        ? 'border-emerald-500/30 opacity-75'
                        : isOverdue
                        ? 'border-red-500/50 bg-red-950/20'
                        : 'border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleBill(bill.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition mt-0.5 ${
                          bill.paid
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-slate-500 text-transparent hover:border-slate-300'
                        }`}
                        title={bill.paid ? 'Marcar como Pendente' : 'Marcar como Paga'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`font-semibold text-sm sm:text-base ${
                              bill.paid ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {bill.description}
                          </h3>
                          {bill.paid ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                              PAGA
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                              ATRASADA
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-700 text-slate-300 rounded-full">
                              Vence {formatDateBR(bill.dueDate)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="capitalize px-2 py-0.5 bg-slate-900 rounded text-slate-300">
                            {bill.category}
                          </span>
                          <span>
                            • Resp:{' '}
                            {bill.responsible === 'ele'
                              ? settings.husbandName
                              : bill.responsible === 'ela'
                              ? settings.wifeName
                              : 'Ambos'}
                          </span>
                          {bill.recurring && <span>• Recorrente</span>}
                        </div>

                        {bill.notes && (
                          <p className="text-xs text-slate-400 mt-1">💡 {bill.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                      <span className="text-base font-extrabold text-white">
                        {formatCurrency(bill.amount)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteBill(bill.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ENTRADAS / RECEITAS */}
      {activeSubTab === 'incomes' && (
        <div className="space-y-4">
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              Total de Entradas Cadastradas
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatCurrency(totalIncomes)}
            </span>
          </div>

          <div className="space-y-3">
            {incomes.length === 0 ? (
              <p className="text-center py-8 text-slate-400">Nenhuma entrada cadastrada.</p>
            ) : (
              incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md"
                >
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">
                      {inc.description}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-900 rounded text-slate-300 capitalize">
                        {inc.category}
                      </span>
                      <span>
                        • Recebido por:{' '}
                        {inc.receivedBy === 'ele'
                          ? settings.husbandName
                          : inc.receivedBy === 'ela'
                          ? settings.wifeName
                          : 'Ambos'}
                      </span>
                      <span>• Data: {formatDateBR(inc.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-emerald-400">
                      +{formatCurrency(inc.amount)}
                    </span>
                    <button
                      onClick={() => deleteIncome(inc.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLIENTES & RECEBIMENTOS */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              Total a Receber de Clientes
            </span>
            <span className="text-lg font-extrabold text-sky-400">
              {formatCurrency(totalClientsToReceive)}
            </span>
          </div>

          <div className="space-y-3">
            {clients.length === 0 ? (
              <p className="text-center py-8 text-slate-400">Nenhum cliente cadastrado.</p>
            ) : (
              clients.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {c.clientName}
                      </h3>
                      {c.status === 'pago' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          RECEBIDO/PAGO
                        </span>
                      ) : c.status === 'atrasado' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          ATRASADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30">
                          PENDENTE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{c.serviceName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Previsto para: {formatDateBR(c.expectedDate)}{' '}
                      {c.contactInfo && `• Contato: ${c.contactInfo}`}
                    </p>
                    {c.notes && <p className="text-xs text-slate-400 mt-1">💡 {c.notes}</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                    <span className="text-base font-extrabold text-sky-400">
                      {formatCurrency(c.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const nextStatus: ClientStatus =
                            c.status === 'pendente'
                              ? 'pago'
                              : c.status === 'pago'
                              ? 'atrasado'
                              : 'pendente';
                          updateClient(c.id, { status: nextStatus });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-medium transition"
                      >
                        Alterar Status
                      </button>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Add Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {modalType === 'bill'
                  ? 'Cadastrar Conta a Pagar'
                  : modalType === 'income'
                  ? 'Cadastrar Entrada de Dinheiro'
                  : 'Cadastrar Cliente / Recebimento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              {modalType === 'bill' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Descrição da Conta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Aluguel, Luz, Internet..."
                      value={billDesc}
                      onChange={(e) => setBillDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Data de Vencimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={billDueDate}
                        onChange={(e) => setBillDueDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={billCategory}
                        onChange={(e) => setBillCategory(e.target.value as CategoryBill)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="moradia">🏠 Moradia</option>
                        <option value="alimentacao">🛒 Alimentação</option>
                        <option value="saude">🏥 Saúde</option>
                        <option value="servicos">⚡ Serviços & TI</option>
                        <option value="lazer">🌴 Lazer</option>
                        <option value="outros">📌 Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Responsável
                      </label>
                      <select
                        value={billResponsible}
                        onChange={(e) => setBillResponsible(e.target.value as ResponsiblePerson)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="ambos">👩‍❤️‍👨 Ambos</option>
                        <option value="ele">🙋‍♂️ {settings.husbandName}</option>
                        <option value="ela">🙋‍♀️ {settings.wifeName}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="billRecurring"
                      checked={billRecurring}
                      onChange={(e) => setBillRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 accent-rose-500"
                    />
                    <label htmlFor="billRecurring" className="text-xs text-slate-300 font-medium">
                      Conta Recorrente (Mensal)
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Observações
                    </label>
                    <input
                      type="text"
                      placeholder="Detalhes adicionais..."
                      value={billNotes}
                      onChange={(e) => setBillNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              {modalType === 'income' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Descrição da Receita *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Salário, Projeto Extra..."
                      value={incDesc}
                      onChange={(e) => setIncDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={incAmount}
                        onChange={(e) => setIncAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Data do Recebimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={incDate}
                        onChange={(e) => setIncDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={incCategory}
                        onChange={(e) =>
                          setIncCategory(e.target.value as 'salario' | 'freelance' | 'vendas' | 'outros')
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="salario">💼 Salário</option>
                        <option value="freelance">🚀 Freelance</option>
                        <option value="vendas">🛒 Vendas</option>
                        <option value="outros">📌 Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Quem Recebeu
                      </label>
                      <select
                        value={incReceivedBy}
                        onChange={(e) => setIncReceivedBy(e.target.value as ResponsiblePerson)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="ele">🙋‍♂️ {settings.husbandName}</option>
                        <option value="ela">🙋‍♀️ {settings.wifeName}</option>
                        <option value="ambos">👩‍❤️‍👨 Ambos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Observações
                    </label>
                    <input
                      type="text"
                      placeholder="Detalhes adicionais..."
                      value={incNotes}
                      onChange={(e) => setIncNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              {modalType === 'client' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Ana, Empresa X..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Serviço / Produto Prestado
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Consultoria, Criação de Site..."
                      value={clientService}
                      onChange={(e) => setClientService(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={clientAmount}
                        onChange={(e) => setClientAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Data Prevista *
                      </label>
                      <input
                        type="date"
                        required
                        value={clientExpectedDate}
                        onChange={(e) => setClientExpectedDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contato / Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 99999-8888"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Observações
                    </label>
                    <input
                      type="text"
                      placeholder="Detalhes..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
