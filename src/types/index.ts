export type CategoryRoutine = 'casa' | 'saude' | 'rotina' | 'outros';
export type ResponsiblePerson = 'ele' | 'ela' | 'ambos';
export type FrequencyType = 'diaria' | 'semanal' | 'mensal' | 'pontual';

export interface RoutineItem {
  id: string;
  title: string;
  category: CategoryRoutine;
  responsible: ResponsiblePerson;
  frequency: FrequencyType;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export type CategoryBill = 'moradia' | 'alimentacao' | 'saude' | 'lazer' | 'servicos' | 'outros';

export interface BillItem {
  id: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: CategoryBill;
  paid: boolean;
  paidAt?: string;
  responsible: ResponsiblePerson;
  recurring: boolean;
  notes?: string;
  createdAt: string;
}

export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: 'salario' | 'freelance' | 'vendas' | 'outros';
  receivedBy: ResponsiblePerson;
  notes?: string;
  createdAt: string;
}

export type ClientStatus = 'pendente' | 'pago' | 'atrasado';

export interface ClientConsumptionLog {
  id: string;
  date: string; // YYYY-MM-DD
  productName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  soldBy: ResponsiblePerson; // 'ele' | 'ela'
  notes?: string;
}

export interface ClientItem {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  expectedDate: string; // YYYY-MM-DD
  status: ClientStatus;
  receivedDate?: string;
  contactInfo?: string;
  responsible: ResponsiblePerson; // 'ele' | 'ela' | 'ambos'
  consumptionHistory?: ClientConsumptionLog[];
  notes?: string;
  createdAt: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  category: 'viagem' | 'casa' | 'saude' | 'reserva' | 'outros';
  achieved: boolean;
  achievedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  husbandName: string;
  wifeName: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}
