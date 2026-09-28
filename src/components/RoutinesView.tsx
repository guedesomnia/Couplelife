import React, { useState } from 'react';
import type { RoutineItem, CategoryRoutine, ResponsiblePerson, FrequencyType, AppSettings } from '../types';
import { Plus, CheckSquare, Trash2, Edit2, Calendar, Clock, Filter, X } from 'lucide-react';

interface RoutinesViewProps {
  routines: RoutineItem[];
  settings: AppSettings;
  addRoutine: (routine: Omit<RoutineItem, 'id' | 'createdAt'>) => void;
  updateRoutine: (id: string, updated: Partial<RoutineItem>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutine: (id: string) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  settings,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  toggleRoutine,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryRoutine>('casa');
  const [responsible, setResponsible] = useState<ResponsiblePerson>('ambos');
  const [frequency, setFrequency] = useState<FrequencyType>('diaria');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setCategory('casa');
    setResponsible('ambos');
    setFrequency('diaria');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RoutineItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setResponsible(item.responsible);
    setFrequency(item.frequency);
    setDueDate(item.dueDate || '');
    setDueTime(item.dueTime || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateRoutine(editingId, {
        title,
        category,
        responsible,
        frequency,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        notes: notes || undefined,
      });
    } else {
      addRoutine({
        title,
        category,
        responsible,
        frequency,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        completed: false,
        notes: notes || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const filteredRoutines = routines.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterResponsible !== 'all' && item.responsible !== filterResponsible) return false;
    return true;
  });

  const getResponsibleLabel = (resp: ResponsiblePerson) => {
    if (resp === 'ele') return settings.husbandName;
    if (resp === 'ela') return settings.wifeName;
    return 'Ambos';
  };

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-rose-400" /> Rotinas & Tarefas (Casa & Saúde)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Organize afazeres da casa, rotinas diárias, exames e saúde da família.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa / Rotina
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Categoria:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'casa', label: '🏡 Casa' },
            { id: 'saude', label: '🏥 Saúde' },
            { id: 'rotina', label: '🔄 Rotinas' },
            { id: 'outros', label: '📌 Outros' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Responsible Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Responsável:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ele', label: `🙋‍♂️ ${settings.husbandName}` },
            { id: 'ela', label: `🙋‍♀️ ${settings.wifeName}` },
            { id: 'ambos', label: '👩‍❤️‍👨 Ambos' },
          ].map((resp) => (
            <button
              key={resp.id}
              onClick={() => setFilterResponsible(resp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterResponsible === resp.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {resp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Routine List */}
      <div className="space-y-3">
        {filteredRoutines.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl py-12 text-center text-slate-400">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
            <p className="text-sm">Nenhuma tarefa encontrada com estes filtros.</p>
          </div>
        ) : (
          filteredRoutines.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-800/80 border rounded-2xl p-4 transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.completed
                  ? 'border-emerald-500/30 opacity-70 bg-slate-900/40'
                  : 'border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleRoutine(item.id)}
                  className="w-5 h-5 mt-1 rounded text-rose-500 focus:ring-rose-500 accent-rose-500 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm sm:text-base font-semibold ${
                      item.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-rose-300 font-medium border border-slate-700 capitalize">
                      {item.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-medium border border-slate-700">
                      Resp: {getResponsibleLabel(item.responsible)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-300 capitalize">
                      Freq: {item.frequency}
                    </span>
                    {item.dueDate && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateBR(item.dueDate)}
                      </span>
                    )}
                    {item.dueTime && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.dueTime}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      💡 {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRoutine(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Routine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Editar Tarefa / Rotina' : 'Nova Tarefa / Rotina'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Tarefa / Atividade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Trocar lâmpada do corredor, Marcar dentista..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryRoutine)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="casa">🏡 Manutenção da Casa</option>
                    <option value="saude">🏥 Saúde & Bem-estar</option>
                    <option value="rotina">🔄 Rotina Diária/Semanal</option>
                    <option value="outros">📌 Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responsável
                  </label>
                  <select
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value as ResponsiblePerson)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="ambos">👩‍❤️‍👨 Ambos</option>
                    <option value="ele">🙋‍♂️ {settings.husbandName}</option>
                    <option value="ela">🙋‍♀️ {settings.wifeName}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Frequência
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                  >
                    <option value="diaria">Diária</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                    <option value="pontual">Pontual (Uma vez)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações / Detalhes
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções adicionais, lembretes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
