import React, { useState } from 'react';
import { X, Plus, BookOpen, Check, Wallet, Trash2 } from 'lucide-react';
import { CashBook } from '../types';
import { addCashBook, deleteCashBook } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

interface AllBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: CashBook[];
  activeBookId: string;
  onSelectBook: (book: CashBook) => void;
  onSuccessToast?: (msg: string) => void;
}

export const AllBooksModal: React.FC<AllBooksModalProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onSuccessToast,
}) => {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [newBookName, setNewBookName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookName.trim()) {
      setError('Please enter a valid Cash Book name');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const createdBook = await addCashBook(user.uid, newBookName);
      setNewBookName('');
      setShowAddDialog(false);
      onSelectBook(createdBook);
      if (onSuccessToast) {
        onSuccessToast(`"${createdBook.name}" Cash Book created!`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create Cash Book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (e: React.MouseEvent, book: CashBook) => {
    e.stopPropagation();
    if (!user || book.isDefault || books.length <= 1) return;
    
    if (window.confirm(`Are you sure you want to delete "${book.name}"?`)) {
      try {
        await deleteCashBook(user.uid, book.bookId);
        if (activeBookId === book.bookId) {
          const remaining = books.filter((b) => b.bookId !== book.bookId);
          if (remaining.length > 0) {
            onSelectBook(remaining[0]);
          }
        }
        if (onSuccessToast) {
          onSuccessToast(`Cash Book "${book.name}" deleted.`);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-slide-up flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1E88E5] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-wide">All Cash Books</h3>
              <p className="text-xs text-white/80 font-medium">Select or create a cash book</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {!showAddDialog ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Your Books ({books.length})
                </span>
              </div>

              <div className="space-y-2">
                {books.map((book) => {
                  const isActive = book.bookId === activeBookId;
                  return (
                    <div
                      key={book.bookId}
                      onClick={() => {
                        onSelectBook(book);
                        onClose();
                      }}
                      className={`group p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#1E88E5] bg-blue-50/70 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isActive
                              ? 'bg-[#1E88E5] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#1E88E5] transition-colors">
                              {book.name}
                            </h4>
                            {book.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E88E5]">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            Tap to switch active book
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!book.isDefault && books.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteBook(e, book)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-xs animate-scale-up">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-slate-200 group-hover:border-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add New Book Form Step */
            <form onSubmit={handleCreateBook} className="py-2 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#1E88E5]" />
                  Add New Cash Book
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Cash Book Name
                </label>
                <input
                  type="text"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="e.g., Shop Account, Personal, Home Budget"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent font-semibold text-slate-800"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    setError('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newBookName.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1E88E5] hover:bg-blue-600 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save Cash Book'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!showAddDialog && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => {
                setShowAddDialog(true);
                setError('');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1E88E5] hover:bg-blue-600 text-white text-sm font-extrabold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Add New Cash Book (एड बुक)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
