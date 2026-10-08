import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const SummaryCard: React.FC = () => {
  const { summary, settings } = useAuth();
  const { totalIncome, totalExpense, balance } = summary;
  const symbol = settings.currencySymbol || '₹';

  return (
    <div className="relative z-20 px-5 -mt-14">
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-indigo-100/60 border border-slate-100/80 transition-all">
        {/* Net Balance Pill Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Balance
            </span>
          </div>
          <span className={`text-base font-extrabold tracking-tight ${balance < 0 ? 'text-[#E91E63]' : 'text-[#14213D]'}`}>
            {formatCurrency(balance, symbol)}
          </span>
        </div>

        {/* Two Columns: Income & Expense */}
        <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
          {/* Income Column */}
          <div className="pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Income</span>
            </div>
            <div className="text-lg font-bold text-[#159447] tracking-tight truncate">
              {formatCurrency(totalIncome, symbol)}
            </div>
          </div>

          {/* Expense Column */}
          <div className="pl-4">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-pink-100 text-[#E91E63] flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Expense</span>
            </div>
            <div className="text-lg font-bold text-[#E91E63] tracking-tight truncate">
              {formatCurrency(totalExpense, symbol)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
