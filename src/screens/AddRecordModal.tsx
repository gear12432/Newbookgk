import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType, PaymentMethod, Category } from '../types';
import { addTransaction, updateTransaction, subscribeCategories, addCategory } from '../services/dbService';
import { getTodayDateString } from '../utils/formatters';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  initialType?: TransactionType;
  activeBookId?: string;
  onSuccess: (message: string) => void;
}

const paymentMethods: PaymentMethod[] = ['Cash', 'Bank', 'UPI', 'Card', 'Other'];

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  editTransaction = null,
  initialType = 'expense',
  activeBookId,
  onSuccess,
}) => {
  const { user, settings } = useAuth();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Add New Custom Category state
  const [showAddCatModal, setShowAddCatModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  const symbol = settings.currencySymbol || '₹';

  // Load Categories & handle edit pre-fill
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCategories(user.uid, (catList) => {
      setCategories(catList);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(String(editTransaction.amount));
        setTitle(editTransaction.title);
        setCategory(editTransaction.category);
        setDate(editTransaction.date);
        setPaymentMethod(editTransaction.paymentMethod || 'UPI');
        setNotes(editTransaction.notes || '');
      } else {
        setType(initialType);
        setAmount('');
        setTitle('');
        setCategory('');
        setDate(getTodayDateString());
        setPaymentMethod('UPI');
        setNotes('');
      }
    }
  }, [isOpen, editTransaction, initialType]);

  // Set default category when type or category list changes
  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length > 0 && (!category || !filtered.some((c) => c.name === category))) {
      setCategory(filtered[0].name);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('User session expired. Please log in.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a description or title.');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a category.');
      return;
    }

    if (!date) {
      setErrorMessage('Please select a date.');
      return;
    }

    // Prevent duplicate saves
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (editTransaction) {
        await updateTransaction({
          ...editTransaction,
          type,
          amount: numAmount,
          title: title.trim(),
          category,
          date,
          paymentMethod,
          notes: notes.trim(),
        });
        onSuccess('Record updated successfully.');
      } else {
        await addTransaction({
          uid: user.uid,
          bookId: activeBookId,
          type,
          amount: numAmount,
          title: title.trim(),
          category,
          date,
          paymentMethod,
          notes: notes.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        onSuccess('Record added successfully.');
      }
      onClose();
    } catch (err: any) {
      console.error('Save transaction error:', err);
      setErrorMessage(err.message || 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomCategory = async () => {
    if (!newCatName.trim() || !user) return;
    try {
      await addCategory(
        user.uid,
        newCatName.trim(),
        type,
        type === 'income' ? 'PlusCircle' : 'Tag',
        type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
      );
      setCategory(newCatName.trim());
      setNewCatName('');
      setShowAddCatModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="text-lg font-extrabold text-[#14213D]">
            {editTransaction ? 'Edit Record' : 'Add Record'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-[#E91E63] text-xs font-semibold rounded-2xl">
              {errorMessage}
            </div>
          )}

          {/* INCOME / EXPENSE Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-[#159447] text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              INCOME
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EXPENSE
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount ({symbol})
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-4 text-2xl font-extrabold ${type === 'income' ? 'text-[#159447]' : 'text-[#E91E63]'}`}>
                {symbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3.5 text-2xl font-extrabold rounded-2xl border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                  type === 'income'
                    ? 'border-emerald-200 focus:border-[#159447] focus:ring-2 focus:ring-emerald-100 text-[#159447]'
                    : 'border-pink-200 focus:border-[#E91E63] focus:ring-2 focus:ring-pink-100 text-[#E91E63]'
                }`}
              />
            </div>
          </div>

          {/* Description / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery Store, Salary, Coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-[#14213D] focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Selector (Dropdown Box) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowAddCatModal(true)}
                className="text-xs font-bold text-[#1E88E5] hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New
              </button>
            </div>

            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setShowAddCatModal(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              required
              className="w-full px-3 py-3 rounded-2xl border border-slate-200 text-xs text-[#14213D] font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1E88E5] transition-all"
            >
              <option value="" disabled>Select Category</option>
              {currentCategories.map((cat) => (
                <option key={cat.categoryId} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="__add_new__" className="text-[#1E88E5] font-bold">
                + Add Custom Category
              </option>
            </select>
          </div>

          {/* Payment Method (Date field is hidden as requested) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-3 rounded-2xl border border-slate-200 text-xs text-[#14213D] font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1E88E5] transition-all"
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add extra details or tags..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-[#14213D] bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1E88E5] transition-all resize-none font-medium"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-[#159447] hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-[#E91E63] hover:bg-pink-700 shadow-pink-200'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Record'
              )}
            </button>
          </div>

          {/* Adsterra Banner Ad */}
          <div className="pt-2">
            <AdsterraBanner />
          </div>
        </form>
      </div>

      {/* Inline Modal for adding new category */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-[#14213D]">Add Custom Category</h4>
            <input
              type="text"
              placeholder="Category Name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#1E88E5]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomCategory}
                className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-bold text-xs shadow-md shadow-blue-100"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
