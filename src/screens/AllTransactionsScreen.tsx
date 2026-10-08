import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react';
import { TransactionCard } from '../components/TransactionCard';
import { SkeletonTransactionCard } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType, ScreenName } from '../types';
import { subscribeTransactions } from '../services/dbService';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface AllTransactionsScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const AllTransactionsScreen: React.FC<AllTransactionsScreenProps> = ({
  onNavigate,
  onGoBack,
  onSelectTransaction,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsub = subscribeTransactions(user.uid, (list) => {
      setTransactions(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('home');
    }
  };

  const filtered = transactions.filter((tx) => {
    if (activeTab === 'income' && tx.type !== 'income') return false;
    if (activeTab === 'expense' && tx.type !== 'expense') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchCategory = tx.category.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchCategory && !matchNotes) return false;
    }
    return true;
  });

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
          <h2 className="text-lg font-black text-white">All Transactions</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, category, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-none text-xs font-medium bg-white text-slate-900 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filter Segment Tabs */}
        <div className="grid grid-cols-3 p-1 bg-black/15 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-[#1E88E5] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'income'
                ? 'bg-[#159447] text-white shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'expense'
                ? 'bg-[#E91E63] text-white shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonTransactionCard />
            <SkeletonTransactionCard />
            <SkeletonTransactionCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 my-8">
            <p className="text-sm font-semibold text-slate-500">
              No transactions match your query.
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionCard
              key={tx.transactionId}
              transaction={tx}
              onClick={onSelectTransaction}
            />
          ))
        )}
      </div>

      {/* STICKY BOTTOM REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        <AdsterraBanner />
      </div>
    </div>
  );
};
