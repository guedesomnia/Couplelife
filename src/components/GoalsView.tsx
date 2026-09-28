import React, { useState } from 'react';
import type { GoalItem, AppSettings } from '../types';
import { Target, Plus, Award, Trash2, Edit2, CheckCircle2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoalsViewProps {
  goals: GoalItem[];
  settings: AppSettings;
  addGoal: (goal: Omit<GoalItem, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updated: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalAchieved: (id: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  addGoal,
  updateGoal,
  deleteGoal,
  toggleGoalAchieved,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState<'viagem' | 'casa' | 'saude' | 'reserva' | 'outros'>('viagem');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setCategory('viagem');
    setTargetDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: GoalItem) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount ? String(goal.targetAmount) : '');
    setCurrentAmount(goal.currentAmount ? String(goal.currentAmount) : '0');
    setCategory(goal.category);
    setTargetDate(goal.targetDate || '');
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleAchieveClick = (goal: GoalItem) => {
    if (!goal.achieved) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    toggleGoalAchieved(goal.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tAmount = targetAmount ? parseFloat(targetAmount) : undefined;
    const cAmount = currentAmount ? parseFloat(currentAmount) : undefined;

    if (editingId) {
      updateGoal(editingId, {
        title,
        targetAmount: tAmount,
        currentAmount: cAmount,
        category,
        targetDate: targetDate || undefined,
        notes: notes || undefined,
      });
    } else {
      addGoal({
        title,
        targetAmount: tAmount,
        currentAmount: cAmount,
        category,
        targetDate: targetDate || undefined,
        achieved: false,
        notes: notes || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) => g.achieved);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-amber-950/30 to-slate-800 p-5 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-400" /> Mural de Conquistas & Objetivos do Casal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Planejem viagens, reformas da casa, reserva de emergência e comemorem cada vitória!
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Novo Objetivo
        </button>
      </div>

      {/* Active Goals Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Objetivos em Andamento ({activeGoals.length})
        </h3>

        {activeGoals.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl py-10 text-center text-slate-400">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm">Nenhum objetivo ativo no momento. Adicione um novo sonho!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progressPct =
                goal.targetAmount && goal.currentAmount !== undefined
                  ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                  : null;

              return (
                <div
                  key={goal.id}
                  className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-white">{goal.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-300 border border-slate-700 capitalize">
                        {goal.category}
                      </span>
                    </div>

                    {goal.targetDate && (
                      <p className="text-xs text-slate-400 mt-1">
                        Meta para: {formatDateBR(goal.targetDate)}
                      </p>
                    )}

                    {goal.notes && (
                      <p className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        💡 {goal.notes}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Amount Inputs */}
                  {goal.targetAmount && goal.currentAmount !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300">
                          {formatCurrency(goal.currentAmount)} acumulados
                        </span>
                        <span className="text-amber-400">Meta: {formatCurrency(goal.targetAmount)}</span>
                      </div>

                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div
                          className="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{progressPct}% Concluído</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const step = 100;
                              updateGoal(goal.id, {
                                currentAmount: (goal.currentAmount || 0) + step,
                              });
                            }}
                            className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold"
                          >
                            + R$ 100
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => handleAchieveClick(goal)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Award className="w-4 h-4" /> Marcar como Conquistado! 🎉
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achieved Goals Section */}
      {achievedGoals.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Conquistas Alcançadas do Casal 🎉 ({achievedGoals.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {goal.title} <span className="text-xs text-emerald-400">✅ ALCANÇADO</span>
                  </h4>
                  {goal.targetAmount && (
                    <p className="text-xs text-slate-300 mt-1">
                      Valor Conquistado: {formatCurrency(goal.targetAmount)}
                    </p>
                  )}
                  {goal.achievedDate && (
                    <p className="text-[11px] text-slate-400">
                      Conquistado em: {formatDateBR(goal.achievedDate)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAchieveClick(goal)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Reabrir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Editar Objetivo' : 'Novo Objetivo do Casal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Sonho / Objetivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem para a praia, Trocar a geladeira..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Meta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Já Guardado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1200.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as 'viagem' | 'casa' | 'saude' | 'reserva' | 'outros')
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="viagem">✈️ Viagem & Lazer</option>
                    <option value="casa">🏡 Reformas & Casa</option>
                    <option value="reserva">🛡️ Reserva de Emergência</option>
                    <option value="saude">🏥 Saúde & Bem-estar</option>
                    <option value="outros">📌 Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Alvo (Opcional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Salvar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
