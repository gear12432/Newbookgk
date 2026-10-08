import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Transaction, ScreenName } from '../types';
import { subscribeTransactions } from '../services/dbService';
import { formatCurrency } from '../utils/formatters';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface ReportsScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
}

type PeriodFilter = 'This Month' | 'Last Month' | 'This Year' | 'All Time';

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onNavigate, onGoBack }) => {
  const { user, settings } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('This Month');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const symbol = settings.currencySymbol || '₹';

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('home');
    }
  };

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsub = subscribeTransactions(user.uid, (list) => {
      setTransactions(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Filter transactions by period
  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.date);
    const today = new Date();

    if (period === 'This Month') {
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    } else if (period === 'Last Month') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    } else if (period === 'This Year') {
      return d.getFullYear() === today.getFullYear();
    }
    return true; // All Time
  });

  // Calculate Income, Expense, Balance
  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  // Category breakdown for Expenses
  const categoryMap: Record<string, number> = {};
  filtered
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalSumForBar = Math.max(totalIncome, totalExpense, 1);
  const incomeWidth = Math.round((totalIncome / totalSumForBar) * 100);
  const expenseWidth = Math.round((totalExpense / totalSumForBar) * 100);

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-28 max-w-md mx-auto relative">
      {/* Header with Royal Blue Gradient */}
      <div className="bg-[#1E88E5] text-white p-4 shadow-md sticky top-0 z-20 select-none">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-black text-white">Financial Reports</h2>
        </div>

        {/* Period Filter Buttons */}
        <div className="grid grid-cols-4 p-1 bg-black/15 rounded-xl text-[11px] font-bold">
          {(['This Month', 'Last Month', 'This Year', 'All Time'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`py-1.5 rounded-lg transition-all ${
                period === p ? 'bg-white text-[#1E88E5] shadow-xs font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-5">
        {/* Total Summary Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4 text-[#159447]" />
              <span>Total Income</span>
            </div>
            <div className="text-lg font-extrabold text-[#159447] truncate">
              {formatCurrency(totalIncome, symbol)}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <TrendingDown className="w-4 h-4 text-[#E91E63]" />
              <span>Total Expense</span>
            </div>
            <div className="text-lg font-extrabold text-[#E91E63] truncate">
              {formatCurrency(totalExpense, symbol)}
            </div>
          </div>
        </div>

        {/* Income vs Expense Comparative Bar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4">
            Income vs Expense Ratio
          </h3>

          <div className="space-y-4">
            {/* Income Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#159447]">Income</span>
                <span className="text-slate-700">{formatCurrency(totalIncome, symbol)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-[#159447] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, incomeWidth))}%` }}
                />
              </div>
            </div>

            {/* Expense Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#E91E63]">Expense</span>
                <span className="text-slate-700">{formatCurrency(totalExpense, symbol)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-[#E91E63] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, expenseWidth))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Net Savings */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Net Surplus</span>
            <span className={`text-sm font-extrabold ${netBalance >= 0 ? 'text-[#159447]' : 'text-[#E91E63]'}`}>
              {formatCurrency(netBalance, symbol)}
            </span>
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Expense by Category
            </h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No expenses recorded for this period.
            </p>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[#14213D]">{item.category}</span>
                    <div className="space-x-2">
                      <span className="text-[#E91E63]">{formatCurrency(item.amount, symbol)}</span>
                      <span className="text-slate-400">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1E88E5] to-[#E91E63] h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        <AdsterraBanner />
      </div>
    </div>
  );
};
