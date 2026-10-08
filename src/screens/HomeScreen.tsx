import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Sparkles } from 'lucide-react';
import { AppHeader, TimeTabType } from '../components/AppHeader';
import { SkeletonTransactionCard } from '../components/SkeletonLoader';
import { AdsterraBanner } from '../components/AdsterraBanner';
import { AllBooksModal } from '../components/AllBooksModal';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType, ScreenName, CashBook } from '../types';
import { subscribeTransactions, subscribeCashBooks } from '../services/dbService';
import { formatNumberWithCommas, formatCashBookDate } from '../utils/formatters';
import { getTranslation } from '../utils/i18n';

interface HomeScreenProps {
  onOpenDrawer: () => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenAddModal: (initialType?: TransactionType, bookId?: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onSuccessToast?: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenDrawer,
  onNavigate,
  onOpenAddModal,
  onSelectTransaction,
  onSuccessToast,
}) => {
  const { user, settings } = useAuth();
  const lang = settings.language || 'English';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [books, setBooks] = useState<CashBook[]>([]);
  const [activeBook, setActiveBook] = useState<CashBook | null>(null);
  const [isAllBooksModalOpen, setIsAllBooksModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time Tab & Date Navigation State
  const [timeTab, setTimeTab] = useState<TimeTabType>('Daily');
  const [dateOffset, setDateOffset] = useState<number>(0);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscribe to user's Cash Books
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCashBooks(user.uid, (bookList) => {
      setBooks(bookList);
      if (bookList.length > 0) {
        setActiveBook((prev) => {
          if (prev && bookList.some((b) => b.bookId === prev.bookId)) {
            return bookList.find((b) => b.bookId === prev.bookId) || bookList[0];
          }
          return bookList[0];
        });
      }
    });
    return () => unsub();
  }, [user]);

  // Subscribe to real-time transactions
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const unsubscribe = subscribeTransactions(user.uid, (list) => {
      setTransactions(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Reset offset when switching tabs
  const handleSelectTimeTab = (tab: TimeTabType) => {
    setTimeTab(tab);
    setDateOffset(0);
  };

  // Target date range calculation
  const getTargetDateRange = () => {
    const now = new Date();
    const target = new Date();

    if (timeTab === 'Daily') {
      target.setDate(now.getDate() + dateOffset);
      const year = target.getFullYear();
      const month = target.getMonth();
      const day = target.getDate();

      const start = new Date(year, month, day, 0, 0, 0, 0);
      const end = new Date(year, month, day, 23, 59, 59, 999);

      let label = t('today');
      if (dateOffset === -1) label = t('yesterday');
      else if (dateOffset !== 0) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${String(day).padStart(2, '0')} ${monthNames[month]} ${year}`;
      }

      return { start, end, label };
    } else if (timeTab === 'Weekly') {
      target.setDate(now.getDate() + dateOffset * 7);
      const dayOfWeek = target.getDay(); // 0 = Sun
      const start = new Date(target);
      start.setDate(target.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      let label = 'This Week';
      if (dateOffset === -1) label = 'Last Week';
      else if (dateOffset !== 0) {
        label = `${start.getDate()} ${start.toLocaleString('en-US', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('en-US', { month: 'short' })}`;
      }

      return { start, end, label };
    } else if (timeTab === 'Monthly') {
      target.setMonth(now.getMonth() + dateOffset);
      const year = target.getFullYear();
      const month = target.getMonth();

      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

      let label = 'This Month';
      if (dateOffset === -1) label = 'Last Month';
      else if (dateOffset !== 0) {
        label = `${target.toLocaleString('en-US', { month: 'short' })} ${year}`;
      }

      return { start, end, label };
    }

    // All
    return { start: new Date(0), end: new Date(8640000000000000), label: t('all') };
  };

  const { start: rangeStart, end: rangeEnd, label: dateLabel } = getTargetDateRange();

  // First filter transactions by active cash book
  const activeBookTransactions = transactions.filter((tx) => {
    if (!activeBook) return true;
    if (tx.bookId) {
      return tx.bookId === activeBook.bookId;
    }
    return activeBook.isDefault || activeBook.bookId.startsWith('default_');
  });

  // Filter transactions in range & search
  const currentPeriodTransactions = activeBookTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const inRange = txDate >= rangeStart && txDate <= rangeEnd;
    if (!inRange && timeTab !== 'All') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchCat && !matchNotes) return false;
    }

    return true;
  });

  // Period Cash In, Cash Out & Net Balance
  const totalCashIn = currentPeriodTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCashOut = currentPeriodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const periodBalance = totalCashIn - totalCashOut;

  return (
    <div className="min-h-screen bg-white pb-48 max-w-md mx-auto relative flex flex-col justify-between font-sans">
      <div>
        {/* Top Cash Book Royal Blue Header */}
        <AppHeader
          onOpenDrawer={onOpenDrawer}
          onNavigate={onNavigate}
          activeTimeTab={timeTab}
          onSelectTimeTab={handleSelectTimeTab}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          isSearchOpen={isSearchOpen}
          activeBookName={activeBook?.name}
          onOpenAllBooksModal={() => setIsAllBooksModalOpen(true)}
        />

        {/* Search Bar Collapsible Input */}
        {isSearchOpen && (
          <div className="bg-[#1E88E5] px-3 pb-3 pt-1 border-t border-white/20 animate-fade-in">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Date Navigator Bar (< Today / Date >) */}
        <div className="bg-[#1565C0] text-white flex items-center justify-between px-3 py-2 text-sm font-semibold shadow-xs">
          <button
            onClick={() => setDateOffset(dateOffset - 1)}
            disabled={timeTab === 'All'}
            className="p-1 rounded-md hover:bg-white/10 active:scale-95 disabled:opacity-40 transition-all"
            aria-label="Previous Period"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm font-bold tracking-wide text-white drop-shadow-xs">
            {dateLabel}
          </span>

          <button
            onClick={() => setDateOffset(dateOffset + 1)}
            disabled={timeTab === 'All'}
            className="p-1 rounded-md hover:bg-white/10 active:scale-95 disabled:opacity-40 transition-all"
            aria-label="Next Period"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Cash Book Ledger Summary Table (Total Cash In | Total Cash Out | Balance) - Placed below Header / Date bar */}
        <div className="bg-slate-50 border-b border-slate-200 text-xs font-bold shadow-xs">
          <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
            <div className="py-2.5 px-1">
              <div className="text-[11px] font-bold text-[#159447]">{t('totalCashIn')}</div>
              <div className="text-sm font-extrabold text-[#159447] mt-0.5">
                {formatNumberWithCommas(totalCashIn)}
              </div>
            </div>

            <div className="py-2.5 px-1">
              <div className="text-[11px] font-bold text-[#E91E63]">{t('totalCashOut')}</div>
              <div className="text-sm font-extrabold text-[#E91E63] mt-0.5">
                {formatNumberWithCommas(totalCashOut)}
              </div>
            </div>

            <div className="py-2.5 px-1">
              <div className="text-[11px] font-bold text-slate-800">{t('balance')}</div>
              <div className={`text-sm font-extrabold mt-0.5 ${periodBalance < 0 ? 'text-[#E91E63]' : 'text-[#159447]'}`}>
                {formatNumberWithCommas(periodBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Table Column Header: Date | Cash In | Cash Out */}
        <div className="bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between text-xs font-extrabold tracking-tight">
          <div className="w-1/2 text-slate-900 uppercase">{t('date')}</div>
          <div className="w-1/4 text-right text-[#159447] uppercase">{t('cashIn')}</div>
          <div className="w-1/4 text-right text-[#E91E63] uppercase">{t('cashOut')}</div>
        </div>

        {/* Transaction Table Rows */}
        <div className="divide-y divide-slate-100 bg-white">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <SkeletonTransactionCard />
              <SkeletonTransactionCard />
              <SkeletonTransactionCard />
            </div>
          ) : currentPeriodTransactions.length === 0 ? (
            /* Empty State */
            <div className="p-10 text-center text-slate-400 my-4">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-blue-300 opacity-80" />
              <p className="text-sm font-bold text-slate-700 mb-1">{t('noEntries')}</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tap <span className="font-bold text-[#159447]">{t('cashIn')}</span> or <span className="font-bold text-[#E91E63]">{t('cashOut')}</span> below to record your entry.
              </p>
            </div>
          ) : (
            /* Cash Book Entries */
            currentPeriodTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.transactionId}
                  onClick={() => onSelectTransaction(tx)}
                  className="px-3 py-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  {/* Left Column: Date & Title */}
                  <div className="w-1/2 pr-2 min-w-0">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">
                      {formatCashBookDate(tx.date, tx.createdAt)}
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {tx.title || tx.category}
                    </div>
                  </div>

                  {/* Middle Column: Cash In Amount */}
                  <div className="w-1/4 text-right font-extrabold text-sm text-[#159447]">
                    {isIncome ? formatNumberWithCommas(tx.amount) : ''}
                  </div>

                  {/* Right Column: Cash Out Amount */}
                  <div className="w-1/4 text-right font-extrabold text-sm text-[#E91E63]">
                    {!isIncome ? formatNumberWithCommas(tx.amount) : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STICKY BOTTOM ACTION & REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        {/* Row 1: Primary Action Buttons (Cash In / Cash Out) */}
        <div className="grid grid-cols-2 gap-2.5 p-2 bg-slate-100/90">
          <button
            onClick={() => onOpenAddModal('income', activeBook?.bookId)}
            className="py-3 px-4 rounded-lg bg-[#28A745] hover:bg-[#218838] text-white font-extrabold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>{t('cashIn')}</span>
          </button>

          <button
            onClick={() => onOpenAddModal('expense', activeBook?.bookId)}
            className="py-3 px-4 rounded-lg bg-[#DC3545] hover:bg-[#C82333] text-white font-extrabold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>{t('cashOut')}</span>
          </button>
        </div>

        {/* Row 2: Adsterra Real-Time Banner Ad */}
        <AdsterraBanner />
      </div>

      {/* All Cash Books Modal */}
      <AllBooksModal
        isOpen={isAllBooksModalOpen}
        onClose={() => setIsAllBooksModalOpen(false)}
        books={books}
        activeBookId={activeBook?.bookId || ''}
        onSelectBook={(selectedBook) => {
          setActiveBook(selectedBook);
        }}
        onSuccessToast={onSuccessToast}
      />
    </div>
  );
};
