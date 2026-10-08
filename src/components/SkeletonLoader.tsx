import React from 'react';

export const SkeletonTransactionCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-xs border border-slate-100 flex items-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="flex gap-2">
          <div className="h-3 bg-slate-200 rounded-md w-1/3" />
          <div className="h-3 bg-slate-200 rounded-md w-1/4" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-16 ml-auto" />
        <div className="h-3 bg-slate-200 rounded-md w-10 ml-auto" />
      </div>
    </div>
  );
};

export const SkeletonSummaryCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex items-center justify-between animate-pulse">
      <div className="flex-1 space-y-2 pr-4">
        <div className="h-3 bg-slate-200 rounded-md w-1/2" />
        <div className="h-6 bg-slate-200 rounded-md w-3/4" />
      </div>
      <div className="w-px h-12 bg-slate-200" />
      <div className="flex-1 space-y-2 pl-4">
        <div className="h-3 bg-slate-200 rounded-md w-1/2" />
        <div className="h-6 bg-slate-200 rounded-md w-3/4" />
      </div>
    </div>
  );
};
