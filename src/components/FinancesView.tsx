import React, { useState } from 'react';
import type {
  BillItem,
  IncomeItem,
  ClientItem,
  CategoryBill,
  ResponsiblePerson,
  ClientStatus,
  AppSettings,
  ClientConsumptionLog,
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
  History,
  ShoppingBag,
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

  // Client History Drawer state
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientItem | null>(null);
  const [historyProductName, setHistoryProductName] = useState('');
  const [historyUnitPrice, setHistoryUnitPrice] = useState('');
  const [historyQuantity, setHistoryQuantity] = useState('1');
  const [historySoldBy, setHistorySoldBy] = useState<ResponsiblePerson>('ele');
  const [historyNotes, setHistoryNotes] = useState('');

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
  const [clientResponsible, setClientResponsible] = useState<ResponsiblePerson>('ele');
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
    setClientResponsible('ele');
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
          responsible: clientResponsible,
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
          responsible: clientResponsible,
          contactInfo: clientContact || undefined,
          notes: clientNotes || undefined,
          consumptionHistory: [],
        });
      }
    }

    setIsModalOpen(false);
  };

  // Add item to client consumption history
  const handleAddConsumptionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForHistory || !historyProductName.trim() || !historyUnitPrice) return;

    const uPrice = parseFloat(historyUnitPrice);
    const qty = parseInt(historyQuantity, 10) || 1;
    if (isNaN(uPrice)) return;

    const total = uPrice * qty;
    const newLog: ClientConsumptionLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      productName: historyProductName.trim(),
      unitPrice: uPrice,
      quantity: qty,
      totalAmount: total,
      soldBy: historySoldBy,
      notes: historyNotes || undefined,
    };

    const updatedHistory = [...(selectedClientForHistory.consumptionHistory || []), newLog];
    const newTotalAmount = updatedHistory.reduce((acc, curr) => acc + curr.totalAmount, 0);

    updateClient(selectedClientForHistory.id, {
      consumptionHistory: updatedHistory,
      amount: newTotalAmount, // Automatically update total amount from consumption logs!
    });

    setSelectedClientForHistory({
      ...selectedClientForHistory,
      consumptionHistory: updatedHistory,
      amount: newTotalAmount,
    });

    setHistoryProductName('');
    setHistoryUnitPrice('');
    setHistoryQuantity('1');
    setHistoryNotes('');
  };

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBillsPending = bills.filter((b) => !b.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalBillsPaid = bills.filter((b) => b.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalClientsToReceive = clients
    .filter((c) => c.status !== 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Gestão Financeira do Casal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Controle de contas a pagar, salários e consumo de produtos de clientes.
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
          <span>Contas ({bills.filter((b) => !b.paid).length})</span>
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
          <span>Entradas</span>
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
          <span>Clientes & Consumo</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONTAS A PAGAR */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
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
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                      <span className="text-base font-extrabold text-white">
                        {formatCurrency(bill.amount)}
                      </span>
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-emerald-400">
                      +{formatCurrency(inc.amount)}
                    </span>
                    <button
                      onClick={() => deleteIncome(inc.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
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

      {/* SUB-TAB 3: CLIENTES & CONSUMO / HISTÓRICO */}
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
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 rounded text-amber-300 border border-slate-700">
                        Atendido por: {c.responsible === 'ele' ? settings.husbandName : c.responsible === 'ela' ? settings.wifeName : 'Ambos'}
                      </span>
                      {c.status === 'pago' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                          RECEBIDO/PAGO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-sky-500/20 text-sky-300 rounded-full">
                          PENDENTE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{c.serviceName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Previsto: {formatDateBR(c.expectedDate)} • Consumos salvos: {c.consumptionHistory?.length || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                    <span className="text-base font-extrabold text-sky-400 mr-2">
                      {formatCurrency(c.amount)}
                    </span>

                    <button
                      onClick={() => setSelectedClientForHistory(c)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold flex items-center gap-1 border border-sky-500/30"
                      title="Ver Histórico de Consumo"
                    >
                      <History className="w-3.5 h-3.5" /> Consumo & Histórico
                    </button>

                    <button
                      onClick={() => deleteClient(c.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
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
                  : 'Cadastrar Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              {modalType === 'bill' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição da Conta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Aluguel, Luz..."
                      value={billDesc}
                      onChange={(e) => setBillDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Vencimento *</label>
                      <input
                        type="date"
                        required
                        value={billDueDate}
                        onChange={(e) => setBillDueDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'income' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição da Receita *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Salário..."
                      value={incDesc}
                      onChange={(e) => setIncDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={incAmount}
                        onChange={(e) => setIncAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Quem Recebeu</label>
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
                </>
              )}

              {modalType === 'client' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Ana..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Inicial (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={clientAmount}
                        onChange={(e) => setClientAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Quem Atende (Modo)</label>
                      <select
                        value={clientResponsible}
                        onChange={(e) => setClientResponsible(e.target.value as ResponsiblePerson)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="ele">🙋‍♂️ Modo {settings.husbandName}</option>
                        <option value="ela">🙋‍♀️ Modo {settings.wifeName}</option>
                        <option value="ambos">👩‍❤️‍👨 Ambos</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT CONSUMPTION & HISTORY DRAWER */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-sky-400" />
                  Histórico de Consumo: {selectedClientForHistory.clientName}
                </h3>
                <p className="text-xs text-slate-400">
                  Cadastre produtos/serviços consumidos no modo {settings.husbandName} ou {settings.wifeName}.
                </p>
              </div>
              <button onClick={() => setSelectedClientForHistory(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Add Product Consumed */}
            <form onSubmit={handleAddConsumptionLog} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                + Adicionar Item / Produto Consumido
              </h4>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Nome do Produto / Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consultoria, Produto X..."
                  value={historyProductName}
                  onChange={(e) => setHistoryProductName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Valor Unitário *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={historyUnitPrice}
                    onChange={(e) => setHistoryUnitPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={historyQuantity}
                    onChange={(e) => setHistoryQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Vendido por</label>
                  <select
                    value={historySoldBy}
                    onChange={(e) => setHistorySoldBy(e.target.value as ResponsiblePerson)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="ele">🙋‍♂️ {settings.husbandName}</option>
                    <option value="ela">🙋‍♀️ {settings.wifeName}</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                + Registrar Consumo no Histórico
              </button>
            </form>

            {/* Consumption History List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex justify-between items-center">
                <span>Histórico Registrado ({selectedClientForHistory.consumptionHistory?.length || 0})</span>
                <span className="text-sky-400 font-extrabold">
                  Total: {formatCurrency(selectedClientForHistory.amount)}
                </span>
              </h4>

              {(!selectedClientForHistory.consumptionHistory || selectedClientForHistory.consumptionHistory.length === 0) ? (
                <p className="text-center py-6 text-slate-400 text-xs">Nenhum consumo individual registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {selectedClientForHistory.consumptionHistory.map((log) => (
                    <div key={log.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-white">{log.productName}</p>
                        <p className="text-[10px] text-slate-400">
                          {log.quantity}x {formatCurrency(log.unitPrice)} • {formatDateBR(log.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sky-300">{formatCurrency(log.totalAmount)}</span>
                        <div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-amber-300 border border-slate-700">
                            Vendido por: {log.soldBy === 'ele' ? settings.husbandName : settings.wifeName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
