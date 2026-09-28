import { useState, useEffect, useRef } from 'react';
import type {
  RoutineItem,
  BillItem,
  IncomeItem,
  ClientItem,
  GoalItem,
  AppSettings,
} from './types';
import { getInitialData, saveToStorage, parseWhatsAppSyncLink } from './utils/storage';
import { getSupabase } from './utils/supabase';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RoutinesView } from './components/RoutinesView';
import { FinancesView } from './components/FinancesView';
import { GoalsView } from './components/GoalsView';
import { CalendarView } from './components/CalendarView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { SettingsModal } from './components/SettingsModal';

export type SyncStatusType = 'offline' | 'synced' | 'syncing' | 'error';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'ele' | 'ela' | 'ambos'>('all');

  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [linkSyncBanner, setLinkSyncBanner] = useState<string | null>(null);

  // Initial State from LocalStorage
  const initial = getInitialData();
  const [routines, setRoutines] = useState<RoutineItem[]>(initial.routines);
  const [bills, setBills] = useState<BillItem[]>(initial.bills);
  const [incomes, setIncomes] = useState<IncomeItem[]>(initial.incomes);
  const [clients, setClients] = useState<ClientItem[]>(initial.clients);
  const [goals, setGoals] = useState<GoalItem[]>(initial.goals);
  const [settings, setSettings] = useState<AppSettings>(initial.settings);

  // Ref to always hold the latest state synchronously to prevent stale closures during cloud push
  const appDataRef = useRef({ routines, bills, incomes, clients, goals });
  useEffect(() => {
    appDataRef.current = { routines, bills, incomes, clients, goals };
  }, [routines, bills, incomes, clients, goals]);

  // Flag to avoid recursive cloud push when updating local state from cloud
  const isReceivingRemoteData = useRef(false);

  // Helper to merge array items by unique ID (preserves unsynced local items)
  const mergeById = <T extends { id: string }>(local: T[], remote: T[]): T[] => {
    const map = new Map<string, T>();
    remote.forEach((item) => map.set(item.id, item));
    local.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  };

  // Check for 1-Click WhatsApp Sync Link in URL hash
  useEffect(() => {
    if (window.location.hash.includes('#syncData=')) {
      const parsedData = parseWhatsAppSyncLink(window.location.hash);
      if (parsedData) {
        isReceivingRemoteData.current = true;
        const newRoutines = parsedData.routines ? mergeById(routines, parsedData.routines) : routines;
        const newBills = parsedData.bills ? mergeById(bills, parsedData.bills) : bills;
        const newIncomes = parsedData.incomes ? mergeById(incomes, parsedData.incomes) : incomes;
        const newClients = parsedData.clients ? mergeById(clients, parsedData.clients) : clients;
        const newGoals = parsedData.goals ? mergeById(goals, parsedData.goals) : goals;

        if (parsedData.routines) setRoutines(newRoutines);
        if (parsedData.bills) setBills(newBills);
        if (parsedData.incomes) setIncomes(newIncomes);
        if (parsedData.clients) setClients(newClients);
        if (parsedData.goals) setGoals(newGoals);

        setLinkSyncBanner('✅ Dados sincronizados com sucesso via Link do WhatsApp!');
        setTimeout(() => {
          isReceivingRemoteData.current = false;
          window.history.replaceState(null, '', window.location.pathname);
          // Push merged data to cloud if connected
          pushToCloud({
            routines: newRoutines,
            bills: newBills,
            incomes: newIncomes,
            clients: newClients,
            goals: newGoals,
          });
        }, 1000);
      }
    }
  }, []);

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

  // Save to LocalStorage
  useEffect(() => { saveToStorage('casal_routines', routines); }, [routines]);
  useEffect(() => { saveToStorage('casal_bills', bills); }, [bills]);
  useEffect(() => { saveToStorage('casal_incomes', incomes); }, [incomes]);
  useEffect(() => { saveToStorage('casal_clients', clients); }, [clients]);
  useEffect(() => { saveToStorage('casal_goals', goals); }, [goals]);
  useEffect(() => { saveToStorage('casal_settings', settings); }, [settings]);

  // Fetch Cloud Data from Supabase
  const fetchCloudData = async (client: any) => {
    if (!client) return;
    try {
      setSyncStatus('syncing');
      const { data, error } = await client
        .from('casal_sync')
        .select('data, updated_at')
        .eq('id', 'main_data')
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar dados no Supabase:', error);
        setSyncStatus('error');
        return;
      }

      if (data && data.data) {
        isReceivingRemoteData.current = true;

        if (Array.isArray(data.data.routines)) setRoutines(data.data.routines);
        if (Array.isArray(data.data.bills)) setBills(data.data.bills);
        if (Array.isArray(data.data.incomes)) setIncomes(data.data.incomes);
        if (Array.isArray(data.data.clients)) setClients(data.data.clients);
        if (Array.isArray(data.data.goals)) setGoals(data.data.goals);

        setSyncStatus('synced');
        setLastSyncTime(
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );

        setTimeout(() => {
          isReceivingRemoteData.current = false;
        }, 300);
      } else {
        // If main_data does not exist on Supabase, initialize it with local data
        await pushToCloud(appDataRef.current);
        setSyncStatus('synced');
      }
    } catch (err) {
      console.error('Erro de conexão ao Supabase:', err);
      setSyncStatus('error');
    }
  };

  // Push Data to Cloud
  const pushToCloud = async (overrideData?: {
    routines?: RoutineItem[];
    bills?: BillItem[];
    incomes?: IncomeItem[];
    clients?: ClientItem[];
    goals?: GoalItem[];
  }) => {
    if (!settings.supabaseUrl || !settings.supabaseKey) {
      setSyncStatus('offline');
      return;
    }

    if (isReceivingRemoteData.current) return;

    const client = getSupabase(settings.supabaseUrl, settings.supabaseKey);
    if (!client) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');
      const current = appDataRef.current;
      const payload = {
        routines: overrideData?.routines ?? current.routines,
        bills: overrideData?.bills ?? current.bills,
        incomes: overrideData?.incomes ?? current.incomes,
        clients: overrideData?.clients ?? current.clients,
        goals: overrideData?.goals ?? current.goals,
      };

      const { error } = await client.from('casal_sync').upsert({
        id: 'main_data',
        data: payload,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setSyncStatus('synced');
        setLastSyncTime(
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } else {
        console.error('Erro ao salvar no Supabase:', error);
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Erro de rede ao conectar Supabase:', err);
      setSyncStatus('error');
    }
  };

  // Supabase Initial Connect, Realtime Subscription & Polling
  useEffect(() => {
    if (!settings.supabaseUrl || !settings.supabaseKey) {
      setSyncStatus('offline');
      return;
    }

    const client = getSupabase(settings.supabaseUrl, settings.supabaseKey);
    if (!client) {
      setSyncStatus('offline');
      return;
    }

    // Initial fetch on mount or settings update
    fetchCloudData(client);

    // Polling fallback every 3 seconds
    const interval = setInterval(() => {
      fetchCloudData(client);
    }, 3000);

    // Supabase Realtime postgres_changes subscription
    const channel = client
      .channel('casal_sync_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'casal_sync' },
        (payload: any) => {
          if (payload.new && payload.new.data && !isReceivingRemoteData.current) {
            isReceivingRemoteData.current = true;
            const remoteData = payload.new.data;
            if (Array.isArray(remoteData.routines)) setRoutines(remoteData.routines);
            if (Array.isArray(remoteData.bills)) setBills(remoteData.bills);
            if (Array.isArray(remoteData.incomes)) setIncomes(remoteData.incomes);
            if (Array.isArray(remoteData.clients)) setClients(remoteData.clients);
            if (Array.isArray(remoteData.goals)) setGoals(remoteData.goals);

            setSyncStatus('synced');
            setLastSyncTime(
              new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );

            setTimeout(() => {
              isReceivingRemoteData.current = false;
            }, 300);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      client.removeChannel(channel);
    };
  }, [settings.supabaseUrl, settings.supabaseKey]);

  const manualSync = () => {
    if (!settings.supabaseUrl || !settings.supabaseKey) return;
    const client = getSupabase(settings.supabaseUrl, settings.supabaseKey);
    if (client) {
      fetchCloudData(client);
    }
  };

  // Handlers for Routines
  const addRoutine = (newRoutine: Omit<RoutineItem, 'id' | 'createdAt'>) => {
    const item: RoutineItem = {
      ...newRoutine,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [item, ...routines];
    setRoutines(next);
    pushToCloud({ routines: next });
  };

  const updateRoutine = (id: string, updated: Partial<RoutineItem>) => {
    const next = routines.map((r) => (r.id === id ? { ...r, ...updated } : r));
    setRoutines(next);
    pushToCloud({ routines: next });
  };

  const deleteRoutine = (id: string) => {
    const next = routines.filter((r) => r.id !== id);
    setRoutines(next);
    pushToCloud({ routines: next });
  };

  const toggleRoutine = (id: string) => {
    const next = routines.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    setRoutines(next);
    pushToCloud({ routines: next });
  };

  // Handlers for Bills
  const addBill = (newBill: Omit<BillItem, 'id' | 'createdAt'>) => {
    const item: BillItem = {
      ...newBill,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [item, ...bills];
    setBills(next);
    pushToCloud({ bills: next });
  };

  const updateBill = (id: string, updated: Partial<BillItem>) => {
    const next = bills.map((b) => (b.id === id ? { ...b, ...updated } : b));
    setBills(next);
    pushToCloud({ bills: next });
  };

  const deleteBill = (id: string) => {
    const next = bills.filter((b) => b.id !== id);
    setBills(next);
    pushToCloud({ bills: next });
  };

  const toggleBill = (id: string) => {
    const next = bills.map((b) =>
      b.id === id
        ? {
            ...b,
            paid: !b.paid,
            paidAt: !b.paid ? new Date().toISOString().split('T')[0] : undefined,
          }
        : b
    );
    setBills(next);
    pushToCloud({ bills: next });
  };

  // Handlers for Incomes
  const addIncome = (newIncome: Omit<IncomeItem, 'id' | 'createdAt'>) => {
    const item: IncomeItem = {
      ...newIncome,
      id: `i-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [item, ...incomes];
    setIncomes(next);
    pushToCloud({ incomes: next });
  };

  const updateIncome = (id: string, updated: Partial<IncomeItem>) => {
    const next = incomes.map((i) => (i.id === id ? { ...i, ...updated } : i));
    setIncomes(next);
    pushToCloud({ incomes: next });
  };

  const deleteIncome = (id: string) => {
    const next = incomes.filter((i) => i.id !== id);
    setIncomes(next);
    pushToCloud({ incomes: next });
  };

  // Handlers for Clients
  const addClient = (newClient: Omit<ClientItem, 'id' | 'createdAt'>) => {
    const item: ClientItem = {
      ...newClient,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [item, ...clients];
    setClients(next);
    pushToCloud({ clients: next });
  };

  const updateClient = (id: string, updated: Partial<ClientItem>) => {
    const next = clients.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setClients(next);
    pushToCloud({ clients: next });
  };

  const deleteClient = (id: string) => {
    const next = clients.filter((c) => c.id !== id);
    setClients(next);
    pushToCloud({ clients: next });
  };

  // Handlers for Goals
  const addGoal = (newGoal: Omit<GoalItem, 'id' | 'createdAt'>) => {
    const item: GoalItem = {
      ...newGoal,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [item, ...goals];
    setGoals(next);
    pushToCloud({ goals: next });
  };

  const updateGoal = (id: string, updated: Partial<GoalItem>) => {
    const next = goals.map((g) => (g.id === id ? { ...g, ...updated } : g));
    setGoals(next);
    pushToCloud({ goals: next });
  };

  const deleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    pushToCloud({ goals: next });
  };

  const toggleGoalAchieved = (id: string) => {
    const next = goals.map((g) =>
      g.id === id
        ? {
            ...g,
            achieved: !g.achieved,
            achievedDate: !g.achieved ? new Date().toISOString().split('T')[0] : undefined,
          }
        : g
    );
    setGoals(next);
    pushToCloud({ goals: next });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-full overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        husbandName={settings.husbandName}
        wifeName={settings.wifeName}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        manualSync={manualSync}
      />

      {linkSyncBanner && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 px-4 shadow">
          {linkSyncBanner}
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            routines={routines}
            bills={bills}
            incomes={incomes}
            clients={clients}
            goals={goals}
            settings={settings}
            userFilter={userFilter}
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

        {activeTab === 'calendar' && (
          <CalendarView
            routines={routines}
            bills={bills}
            incomes={incomes}
            clients={clients}
            settings={settings}
            toggleRoutine={toggleRoutine}
            toggleBill={toggleBill}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReportView
            incomes={incomes}
            clients={clients}
            settings={settings}
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
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            if (newSettings.supabaseUrl && newSettings.supabaseKey) {
              const client = getSupabase(newSettings.supabaseUrl, newSettings.supabaseKey);
              if (client) fetchCloudData(client);
            }
          }}
          onClose={() => setIsSettingsOpen(false)}
          deferredPrompt={deferredPrompt}
          syncStatus={syncStatus}
          manualSync={manualSync}
        />
      )}
    </div>
  );
}

export default App;
