import React from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  Tag, 
  Car, 
  Receipt, 
  Home, 
  Tv, 
  Activity, 
  GraduationCap, 
  Plane, 
  Briefcase, 
  Laptop, 
  Building2, 
  Gift, 
  TrendingUp, 
  HeartHandshake, 
  MoreHorizontal, 
  PlusCircle, 
  CircleDollarSign,
  LucideIcon
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  ShoppingBag,
  Tag,
  Car,
  Receipt,
  Home,
  Tv,
  Activity,
  GraduationCap,
  Plane,
  Briefcase,
  Laptop,
  Building2,
  Gift,
  TrendingUp,
  HeartHandshake,
  MoreHorizontal,
  PlusCircle,
};

interface TransactionCardProps {
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onClick }) => {
  const { settings } = useAuth();
  const { type, title, category, amount, date, paymentMethod } = transaction;
  const symbol = settings.currencySymbol || '₹';

  // Determine icon
  const IconComponent = iconMap[category] || CircleDollarSign;

  const isIncome = type === 'income';

  return (
    <div
      onClick={() => onClick(transaction)}
      className="group bg-white rounded-2xl p-3.5 mb-2.5 shadow-xs hover:shadow-md border border-slate-100 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
    >
      {/* Category Icon */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          isIncome ? 'bg-emerald-50 text-[#159447]' : 'bg-pink-50 text-[#E91E63]'
        }`}
      >
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Middle Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#14213D] truncate group-hover:text-[#6675E8] transition-colors">
          {title || category}
        </h4>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {formatRelativeDate(date)}
          </span>
          <span className="text-slate-300 text-xs">•</span>
          {/* Type Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              isIncome
                ? 'bg-emerald-100/70 text-[#159447]'
                : 'bg-pink-100/70 text-[#E91E63]'
            }`}
          >
            {type}
          </span>
        </div>
      </div>

      {/* Right Amount & Credit/Debit tag */}
      <div className="text-right shrink-0">
        <div
          className={`text-sm font-extrabold tracking-tight ${
            isIncome ? 'text-[#159447]' : 'text-[#E91E63]'
          }`}
        >
          {isIncome ? `+${formatCurrency(amount, symbol)}` : formatCurrency(amount, symbol)}
        </div>
        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
          {isIncome ? 'Credit' : 'Debit'}
        </div>
      </div>
    </div>
  );
};
