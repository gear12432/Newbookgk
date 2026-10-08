export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Bank' | 'UPI' | 'Card' | 'Other';

export interface Transaction {
  transactionId: string;
  uid: string;
  bookId?: string;
  type: TransactionType;
  title: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface CashBook {
  bookId: string;
  uid: string;
  name: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  mobile: string;
  profileImage?: string;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  language: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  updatedAt: number;
}

export interface Category {
  categoryId: string;
  uid: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string; // Tailwind color or hex for soft pastel bg
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppNotification {
  notificationId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: number;
}

export type DateFilterOption = 'All Transactions' | 'Income' | 'Expense' | 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom';

export type ScreenName = 
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'home'
  | 'all-transactions'
  | 'reports'
  | 'categories'
  | 'profile'
  | 'settings'
  | 'notifications';
