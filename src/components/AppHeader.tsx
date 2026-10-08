import React, { useState } from 'react';
import { Menu, Search, MoreVertical, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';
import { getTranslation } from '../utils/i18n';

export type TimeTabType = 'Daily' | 'Weekly' | 'Monthly' | 'All';

interface AppHeaderProps {
  onOpenDrawer: () => void;
  onNavigate: (screen: ScreenName) => void;
  activeTimeTab: TimeTabType;
  onSelectTimeTab: (tab: TimeTabType) => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  activeBookName?: string;
  onOpenAllBooksModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenDrawer,
  onNavigate,
  activeTimeTab,
  onSelectTimeTab,
  onToggleSearch,
  isSearchOpen,
  activeBookName,
  onOpenAllBooksModal,
}) => {
  const { settings, notifications } = useAuth();
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const lang = settings.language || 'English';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, lang);

  const tabs: TimeTabType[] = ['Daily', 'Weekly', 'Monthly', 'All'];

  const tabLabels: Record<TimeTabType, string> = {
    Daily: t('daily'),
    Weekly: t('weekly'),
    Monthly: t('monthly'),
    All: t('all'),
  };

  return (
    <header className="bg-[#1E88E5] text-white shadow-md select-none sticky top-0 z-30">
      {/* Top App Bar Row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        {/* Left: Hamburger menu */}
        <button
          onClick={onOpenDrawer}
          className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-colors"
          aria-label="Open side menu"
        >
          <Menu className="w-6 h-6 text-white stroke-[2.2]" />
        </button>

        {/* Center: Title + Dropdown Icon */}
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 px-2.5 py-1 rounded-xl transition-colors active:scale-95" 
          onClick={() => {
            if (onOpenAllBooksModal) {
              onOpenAllBooksModal();
            } else {
              onNavigate('home');
            }
          }}
        >
          <h1 className="text-lg font-bold tracking-wide text-white truncate max-w-[170px]">
            {activeBookName || t('cashBook')}
          </h1>
          <ChevronDown className="w-4 h-4 text-white/90 shrink-0 stroke-[2.5]" />
        </div>

        {/* Right Action Icons: Search & 3-Dots Menu */}
        <div className="flex items-center gap-1">
          {/* Search Toggle */}
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-lg transition-colors active:scale-95 ${
              isSearchOpen ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            aria-label="Search transactions"
          >
            <Search className="w-5 h-5 text-white stroke-[2.2]" />
          </button>

          {/* 3-Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-colors relative"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-white stroke-[2.2]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl text-slate-800 py-1.5 z-50 animate-scale-up text-xs font-semibold">
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      onNavigate('reports');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>{t('reports')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      onNavigate('categories');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>{t('categories')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      onNavigate('notifications');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>{t('notifications')}</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>{t('profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between border-t border-slate-100"
                  >
                    <span>{t('settings')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Time Filter Pills (Daily, Weekly, Monthly, All) */}
      <div className="grid grid-cols-4 gap-1 px-2 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTimeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTimeTab(tab)}
              className={`py-1.5 px-2 rounded-full text-xs font-semibold text-center transition-all ${
                isActive
                  ? 'bg-white text-[#1E88E5] font-bold shadow-xs'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>
    </header>
  );
};
