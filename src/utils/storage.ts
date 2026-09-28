import type { RoutineItem, BillItem, IncomeItem, ClientItem, GoalItem, AppSettings } from '../types';

const INITIAL_SETTINGS: AppSettings = {
  husbandName: 'Ele',
  wifeName: 'Ela',
  supabaseUrl: '',
  supabaseKey: '',
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const today = getTodayString();

const INITIAL_ROUTINES: RoutineItem[] = [
  {
    id: 'r-1',
    title: 'Trocar o filtro de água da cozinha',
    category: 'casa',
    responsible: 'ambos',
    frequency: 'mensal',
    dueDate: addDays(today, 2),
    completed: false,
    notes: 'Comprar refil novo no mercado ou online',
    createdAt: today,
  },
  {
    id: 'r-2',
    title: 'Caminhada / Exercício juntos',
    category: 'saude',
    responsible: 'ambos',
    frequency: 'diaria',
    dueDate: today,
    dueTime: '18:00',
    completed: false,
    notes: 'Manter meta de 30 minutos por dia',
    createdAt: today,
  },
  {
    id: 'r-3',
    title: 'Revisão do carro e calibrar pneus',
    category: 'casa',
    responsible: 'ele',
    frequency: 'mensal',
    dueDate: addDays(today, 5),
    completed: false,
    notes: 'Checar óleo e água antes da viagem',
    createdAt: today,
  },
  {
    id: 'r-4',
    title: 'Consulta médica de rotina / Exames',
    category: 'saude',
    responsible: 'ela',
    frequency: 'pontual',
    dueDate: addDays(today, 10),
    completed: false,
    notes: 'Levar os exames anteriores',
    createdAt: today,
  },
];

const INITIAL_BILLS: BillItem[] = [
  {
    id: 'b-1',
    description: 'Aluguel / Condomínio',
    amount: 1850.00,
    dueDate: addDays(today, 3),
    category: 'moradia',
    paid: false,
    responsible: 'ambos',
    recurring: true,
    notes: 'Pagar via PIX com desconto até o vencimento',
    createdAt: today,
  },
  {
    id: 'b-2',
    description: 'Conta de Luz (Enel / Light)',
    amount: 220.50,
    dueDate: addDays(today, 7),
    category: 'servicos',
    paid: false,
    responsible: 'ele',
    recurring: true,
    notes: 'Débito automático ativado',
    createdAt: today,
  },
  {
    id: 'b-3',
    description: 'Internet Fibra',
    amount: 120.00,
    dueDate: addDays(today, -1),
    category: 'servicos',
    paid: true,
    paidAt: today,
    responsible: 'ela',
    recurring: true,
    createdAt: today,
  },
  {
    id: 'b-4',
    description: 'Plano de Saúde Familiar',
    amount: 680.00,
    dueDate: addDays(today, 12),
    category: 'saude',
    paid: false,
    responsible: 'ambos',
    recurring: true,
    createdAt: today,
  },
];

const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'i-1',
    description: 'Salário Mensal',
    amount: 4500.00,
    date: addDays(today, -3),
    category: 'salario',
    receivedBy: 'ele',
    notes: 'Depósito em conta corrente',
    createdAt: today,
  },
  {
    id: 'i-2',
    description: 'Projeto Freelance Design',
    amount: 1200.00,
    date: today,
    category: 'freelance',
    receivedBy: 'ela',
    notes: 'Primeira parcela recebida via PIX',
    createdAt: today,
  },
];

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: 'c-1',
    clientName: 'Dra. Ana Paula (Clínica)',
    serviceName: 'Consultoria & Gestão Social Media',
    amount: 1500.00,
    expectedDate: addDays(today, 4),
    status: 'pendente',
    contactInfo: '(11) 98765-4321',
    responsible: 'ela',
    notes: 'Enviar nota fiscal após confirmação do depósito',
    createdAt: today,
    consumptionHistory: [
      {
        id: 'log-1',
        date: addDays(today, -10),
        productName: 'Pacote Mensal Social Media',
        unitPrice: 1500.00,
        quantity: 1,
        totalAmount: 1500.00,
        soldBy: 'ela',
        notes: 'Atendimento feito por Ela',
      },
    ],
  },
  {
    id: 'c-2',
    clientName: 'Marcos Silva (Academia)',
    serviceName: 'Criação de Site Institucional',
    amount: 2800.00,
    expectedDate: addDays(today, -2),
    status: 'atrasado',
    contactInfo: 'marcos@academia.com',
    responsible: 'ele',
    notes: 'Cobrar segunda parcela que venceu anteontem',
    createdAt: today,
    consumptionHistory: [
      {
        id: 'log-2',
        date: addDays(today, -15),
        productName: 'Desenvolvimento do Web Site',
        unitPrice: 2800.00,
        quantity: 1,
        totalAmount: 2800.00,
        soldBy: 'ele',
        notes: 'Atendimento feito por Ele',
      },
    ],
  },
  {
    id: 'c-3',
    clientName: 'Escritório Contábil Rios',
    serviceName: 'Manutenção Mensal de TI',
    amount: 850.00,
    expectedDate: addDays(today, -5),
    status: 'pago',
    receivedDate: addDays(today, -4),
    contactInfo: 'financeiro@rioscontabil.com.br',
    responsible: 'ele',
    createdAt: today,
    consumptionHistory: [
      {
        id: 'log-3',
        date: addDays(today, -20),
        productName: 'Suporte Técnico Presencial',
        unitPrice: 850.00,
        quantity: 1,
        totalAmount: 850.00,
        soldBy: 'ele',
      },
    ],
  },
];

const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'g-1',
    title: 'Viagem de Férias para a Praia 🏖️',
    targetAmount: 4000.00,
    currentAmount: 2600.00,
    targetDate: addDays(today, 60),
    category: 'viagem',
    achieved: false,
    notes: 'Passagens e hospedagem para 7 dias',
    createdAt: today,
  },
  {
    id: 'g-2',
    title: 'Reserva de Emergência da Casa 🛡️',
    targetAmount: 10000.00,
    currentAmount: 6500.00,
    category: 'reserva',
    achieved: false,
    notes: 'Guardar em CDB de liquidez diária',
    createdAt: today,
  },
  {
    id: 'g-3',
    title: 'Comprar Air Fryer Grande de Inox 🍟',
    targetAmount: 450.00,
    currentAmount: 450.00,
    category: 'casa',
    achieved: true,
    achievedDate: addDays(today, -10),
    notes: 'Comprada na promoção!',
    createdAt: today,
  },
];

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Erro ao carregar do localStorage (${key}):`, err);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao salvar no localStorage (${key}):`, err);
  }
};

export const getInitialData = () => ({
  routines: loadFromStorage<RoutineItem[]>('casal_routines', INITIAL_ROUTINES),
  bills: loadFromStorage<BillItem[]>('casal_bills', INITIAL_BILLS),
  incomes: loadFromStorage<IncomeItem[]>('casal_incomes', INITIAL_INCOMES),
  clients: loadFromStorage<ClientItem[]>('casal_clients', INITIAL_CLIENTS),
  goals: loadFromStorage<GoalItem[]>('casal_goals', INITIAL_GOALS),
  settings: loadFromStorage<AppSettings>('casal_settings', INITIAL_SETTINGS),
});

export const exportAppDataJSON = (): string => {
  const data = getInitialData();
  return JSON.stringify(data, null, 2);
};

export const importAppDataJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.routines) saveToStorage('casal_routines', parsed.routines);
    if (parsed.bills) saveToStorage('casal_bills', parsed.bills);
    if (parsed.incomes) saveToStorage('casal_incomes', parsed.incomes);
    if (parsed.clients) saveToStorage('casal_clients', parsed.clients);
    if (parsed.goals) saveToStorage('casal_goals', parsed.goals);
    if (parsed.settings) saveToStorage('casal_settings', parsed.settings);
    return true;
  } catch (err) {
    console.error('Erro ao importar JSON:', err);
    return false;
  }
};
