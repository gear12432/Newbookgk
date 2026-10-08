import { Category } from '../types';

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'categoryId' | 'uid' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: 'bg-emerald-100 text-emerald-700', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: 'bg-blue-100 text-blue-700', isDefault: true },
  { name: 'Business', type: 'income', icon: 'Building2', color: 'bg-purple-100 text-purple-700', isDefault: true },
  { name: 'Bonus', type: 'income', icon: 'Gift', color: 'bg-amber-100 text-amber-700', isDefault: true },
  { name: 'Interest', type: 'income', icon: 'TrendingUp', color: 'bg-teal-100 text-teal-700', isDefault: true },
  { name: 'Gift', type: 'income', icon: 'HeartHandshake', color: 'bg-rose-100 text-rose-700', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'PlusCircle', color: 'bg-slate-100 text-slate-700', isDefault: true },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'categoryId' | 'uid' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: 'bg-pink-100 text-pink-700', isDefault: true },
  { name: 'Grocery', type: 'expense', icon: 'ShoppingBag', color: 'bg-orange-100 text-orange-700', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'Tag', color: 'bg-violet-100 text-violet-700', isDefault: true },
  { name: 'Transport', type: 'expense', icon: 'Car', color: 'bg-cyan-100 text-cyan-700', isDefault: true },
  { name: 'Bills', type: 'expense', icon: 'Receipt', color: 'bg-red-100 text-red-700', isDefault: true },
  { name: 'Rent', type: 'expense', icon: 'Home', color: 'bg-indigo-100 text-indigo-700', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Tv', color: 'bg-fuchsia-100 text-fuchsia-700', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: 'Activity', color: 'bg-emerald-100 text-emerald-700', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: 'bg-sky-100 text-sky-700', isDefault: true },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: 'bg-yellow-100 text-yellow-700', isDefault: true },
  { name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: 'bg-slate-100 text-slate-700', isDefault: true },
];
