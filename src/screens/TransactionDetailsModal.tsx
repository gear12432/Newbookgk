import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CreditCard, 
  FileText, 
  Clock, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  Tag
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateDDMMYYYY, formatTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { deleteTransaction } from '../services/dbService';
import { ConfirmModal } from '../components/ConfirmModal';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onSuccess: (message: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onSuccess,
}) => {
  const { user, settings } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !transaction) return null;

  const { type, title, category, amount, date, paymentMethod, notes, createdAt } = transaction;
  const isIncome = type === 'income';
  const symbol = settings.currencySymbol || '₹';

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(user.uid, transaction.transactionId);
      onSuccess('Transaction deleted.');
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Top Bar Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Transaction Details
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Badge Banner */}
          <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <div
              className={`w-16 h-16 mx-auto mb-3 rounded-3xl flex items-center justify-center shadow-md ${
                isIncome ? 'bg-emerald-100 text-[#159447]' : 'bg-pink-100 text-[#E91E63]'
              }`}
            >
              {isIncome ? <ArrowUpRight className="w-8 h-8" /> : <ArrowDownRight className="w-8 h-8" />}
            </div>

            <h3 className="text-2xl font-extrabold text-[#14213D] mb-1">
              {title || category}
            </h3>

            <div className={`text-3xl font-black tracking-tight mb-2 ${isIncome ? 'text-[#159447]' : 'text-[#E91E63]'}`}>
              {isIncome ? `+${formatCurrency(amount, symbol)}` : formatCurrency(amount, symbol)}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isIncome ? 'bg-[#159447]' : 'bg-[#E91E63]'}`} />
              {type} • {isIncome ? 'Credit' : 'Debit'}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-5 space-y-3 text-sm">
            {/* Category */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Category</span>
              </div>
              <span className="font-bold text-[#14213D]">{category}</span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Transaction Date</span>
              </div>
              <span className="font-bold text-[#14213D]">{formatDateDDMMYYYY(date)}</span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment Method</span>
              </div>
              <span className="font-bold text-[#14213D]">{paymentMethod || 'Cash'}</span>
            </div>

            {/* Notes */}
            {notes && (
              <div className="py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs mb-1">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Notes</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl leading-relaxed italic">
                  "{notes}"
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Created</span>
              </div>
              <span>{new Date(createdAt).toLocaleDateString()} {formatTime(createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-rose-50 text-[#E91E63] hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Transaction?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
