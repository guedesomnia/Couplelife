import { useState, useEffect } from 'react';
import type {
  RoutineItem,
  BillItem,
  IncomeItem,
  ClientItem,
  GoalItem,
  AppSettings,
} from './types';
import { getInitialData, saveToStorage } from './utils/storage';
import { getSupabase } from './utils/supabase';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RoutinesView } from './components/RoutinesView';
import { FinancesView } from './components/FinancesView';
import { GoalsView } from './components/GoalsView';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initial State from LocalStorage
  const initial = getInitialData();
  const [routines, setRoutines] = useState<RoutineItem[]>(initial.routines);
  const [bills, setBills] = useState<BillItem[]>(initial.bills);
  const [incomes, setIncomes] = useState<IncomeItem[]>(initial.incomes);
  const [clients, setClients] = useState<ClientItem[]>(initial.clients);
  const [goals, setGoals] = useState<GoalItem[]>(initial.goals);
  const [settings, setSettings] = useState<AppSettings>(initial.settings);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    saveToStorage('casal_routines', routines);
  }, [routines]);

  useEffect(() => {
    saveToStorage('casal_bills', bills);
  }, [bills]);

  useEffect(() => {
    saveToStorage('casal_incomes', incomes);
  }, [incomes]);

  useEffect(() => {
    saveToStorage('casal_clients', clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage('casal_goals', goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage('casal_settings', settings);
  }, [settings]);

  // Optional Supabase Realtime Cloud Sync
  useEffect(() => {
    if (!settings.supabaseUrl || !settings.supabaseKey) return;
    const client = getSupabase(settings.supabaseUrl, settings.supabaseKey);
    if (!client) return;

    // Load cloud data once on mount
    const fetchCloudData = async () => {
      try {
        const { data, error } = await client.from('casal_sync').select('data').eq('id', 'main_data').single();
        if (data && data.data && !error) {
          if (data.data.routines) setRoutines(data.data.routines);
          if (data.data.bills) setBills(data.data.bills);
          if (data.data.incomes) setIncomes(data.data.incomes);
          if (data.data.clients) setClients(data.data.clients);
          if (data.data.goals) setGoals(data.data.goals);
        }
      } catch (err) {
        console.log('Sem dados remotos prévios no Supabase:', err);
      }
    };

    fetchCloudData();
  }, [settings.supabaseUrl, settings.supabaseKey]);

  // Sync state to Supabase when updated
  const syncToCloud = async () => {
    if (!settings.supabaseUrl || !settings.supabaseKey) return;
    const client = getSupabase(settings.supabaseUrl, settings.supabaseKey);
    if (!client) return;

    try {
      await client.from('casal_sync').upsert({
        id: 'main_data',
        data: { routines, bills, incomes, clients, goals },
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erro ao sincronizar com Supabase:', err);
    }
  };

  useEffect(() => {
    syncToCloud();
  }, [routines, bills, incomes, clients, goals]);

  // Handler functions for Routines
  const addRoutine = (newRoutine: Omit<RoutineItem, 'id' | 'createdAt'>) => {
    const item: RoutineItem = {
      ...newRoutine,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRoutines((prev) => [item, ...prev]);
  };

  const updateRoutine = (id: string, updated: Partial<RoutineItem>) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  // Handler functions for Bills
  const addBill = (newBill: Omit<BillItem, 'id' | 'createdAt'>) => {
    const item: BillItem = {
      ...newBill,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBills((prev) => [item, ...prev]);
  };

  const updateBill = (id: string, updated: Partial<BillItem>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBill = (id: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              paid: !b.paid,
              paidAt: !b.paid ? new Date().toISOString().split('T')[0] : undefined,
            }
          : b
      )
    );
  };

  // Handler functions for Incomes
  const addIncome = (newIncome: Omit<IncomeItem, 'id' | 'createdAt'>) => {
    const item: IncomeItem = {
      ...newIncome,
      id: `i-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setIncomes((prev) => [item, ...prev]);
  };

  const updateIncome = (id: string, updated: Partial<IncomeItem>) => {
    setIncomes((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Handler functions for Clients
  const addClient = (newClient: Omit<ClientItem, 'id' | 'createdAt'>) => {
    const item: ClientItem = {
      ...newClient,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [item, ...prev]);
  };

  const updateClient = (id: string, updated: Partial<ClientItem>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Handler functions for Goals
  const addGoal = (newGoal: Omit<GoalItem, 'id' | 'createdAt'>) => {
    const item: GoalItem = {
      ...newGoal,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [item, ...prev]);
  };

  const updateGoal = (id: string, updated: Partial<GoalItem>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleGoalAchieved = (id: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              achieved: !g.achieved,
              achievedDate: !g.achieved ? new Date().toISOString().split('T')[0] : undefined,
            }
          : g
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        husbandName={settings.husbandName}
        wifeName={settings.wifeName}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            routines={routines}
            bills={bills}
            incomes={incomes}
            clients={clients}
            goals={goals}
            settings={settings}
            setActiveTab={setActiveTab}
            toggleRoutine={toggleRoutine}
            toggleBill={toggleBill}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesView
            routines={routines}
            settings={settings}
            addRoutine={addRoutine}
            updateRoutine={updateRoutine}
            deleteRoutine={deleteRoutine}
            toggleRoutine={toggleRoutine}
          />
        )}

        {activeTab === 'finances' && (
          <FinancesView
            bills={bills}
            incomes={incomes}
            clients={clients}
            settings={settings}
            addBill={addBill}
            updateBill={updateBill}
            deleteBill={deleteBill}
            toggleBill={toggleBill}
            addIncome={addIncome}
            updateIncome={updateIncome}
            deleteIncome={deleteIncome}
            addClient={addClient}
            updateClient={updateClient}
            deleteClient={deleteClient}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            settings={settings}
            addGoal={addGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            toggleGoalAchieved={toggleGoalAchieved}
          />
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => setSettings(newSettings)}
          onClose={() => setIsSettingsOpen(false)}
          deferredPrompt={deferredPrompt}
        />
      )}
    </div>
  );
}

export default App;
