import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Category, TransactionType, ScreenName } from '../types';
import { subscribeCategories, addCategory, deleteCategory } from '../services/dbService';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface CategoriesScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
  onSuccess: (msg: string) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onNavigate, onGoBack, onSuccess }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add category state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

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
    const unsub = subscribeCategories(user.uid, (list) => {
      setCategories(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !user) return;
    try {
      await addCategory(
        user.uid,
        newCatName.trim(),
        activeTab,
        activeTab === 'income' ? 'PlusCircle' : 'Tag',
        activeTab === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
      );
      onSuccess('Category created!');
      setNewCatName('');
      setShowAddModal(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!user) return;
    try {
      await deleteCategory(user.uid, catId);
      onSuccess('Category removed.');
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-28 max-w-md mx-auto relative">
      {/* Top Header with Royal Blue Gradient */}
      <div className="bg-[#1E88E5] text-white p-4 shadow-md sticky top-0 z-20 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-lg font-black text-white">Category Management</h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 rounded-xl bg-white text-[#1E88E5] hover:bg-blue-50 transition-colors flex items-center gap-1 text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#1E88E5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Tabs: Income vs Expense */}
        <div className="grid grid-cols-2 p-1 bg-black/15 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('income')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'income'
                ? 'bg-[#159447] text-white shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Income Categories
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'expense'
                ? 'bg-[#E91E63] text-white shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Expense Categories
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="p-5">
        <div className="grid grid-cols-1 gap-2.5">
          {currentCategories.map((cat) => (
            <div
              key={cat.categoryId}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    cat.type === 'income' ? 'bg-emerald-100 text-[#159447]' : 'bg-pink-100 text-[#E91E63]'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#14213D]">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {cat.isDefault ? 'Default' : 'Custom'}
                  </span>
                </div>
              </div>

              {!cat.isDefault && (
                <button
                  onClick={() => handleDeleteCategory(cat.categoryId)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#14213D]">
              New {activeTab === 'income' ? 'Income' : 'Expense'} Category
            </h3>
            <input
              type="text"
              placeholder="e.g. Investment, Gadgets"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#1E88E5]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex-1 py-3 rounded-xl bg-[#1E88E5] text-white font-bold text-xs shadow-md shadow-blue-100"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* STICKY BOTTOM REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        <AdsterraBanner />
      </div>
    </div>
  );
};
