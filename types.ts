
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  profit: number;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Debt {
  id: string;
  creditor: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'pending' | 'paid';
}

export interface Loan {
  id: string;
  source: string;
  principal: number;
  paidAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  status: 'active' | 'cleared';
}

export interface Equity {
  id: string;
  source: string;
  amount: number;
  date: string;
  type: 'investment' | 'drawal';
}

export interface AppState {
  inventory: InventoryItem[];
  sales: SaleRecord[];
  expenses: Expense[];
  debts: Debt[];
  loans: Loan[];
  equity: Equity[];
}

export type TabType = 'dashboard' | 'inventory' | 'sales' | 'expenses' | 'debts' | 'loans' | 'equity' | 'projections' | 'settings' | 'reports';
