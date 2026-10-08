import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-5 z-40 safe-area-bottom">
      <button
        onClick={onClick}
        aria-label="Add Income or Expense"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#6675E8] to-[#A46BE8] text-white flex items-center justify-center shadow-xl shadow-indigo-400/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
