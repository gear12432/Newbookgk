import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  Check, 
  Globe, 
  Search,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
  onSuccess: (msg: string) => void;
}

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onGoBack, onSuccess }) => {
  const { settings, updateSettings, deleteAccount } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [languageSearch, setLanguageSearch] = useState<string>('');

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('home');
    }
  };

  const currentLang = settings.language || 'English';
  const t = (key: Parameters<typeof getTranslation>[0]) => getTranslation(key, currentLang);

  const handleCurrencyChange = async (code: string, symbol: string) => {
    await updateSettings({ currency: code, currencySymbol: symbol });
    onSuccess(`Currency changed to ${code} (${symbol})`);
  };

  const handleLanguageChange = async (langName: string) => {
    await updateSettings({ language: langName });
    setShowLanguageModal(false);
    onSuccess(`Language changed to ${langName}`);
  };

  const handleToggleNotifications = async () => {
    const nextVal = !settings.notificationsEnabled;
    await updateSettings({ notificationsEnabled: nextVal });
    onSuccess(nextVal ? 'Notifications enabled' : 'Notifications muted');
  };

  const handleToggleDarkMode = async () => {
    const nextVal = !settings.darkMode;
    await updateSettings({ darkMode: nextVal });
    onSuccess(nextVal ? 'Dark theme enabled' : 'Light theme enabled');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      onSuccess('Account deleted.');
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-28 max-w-md mx-auto relative">
      {/* Header with Royal Blue Gradient */}
      <div className="bg-[#1E88E5] text-white p-4 shadow-md sticky top-0 z-20 flex items-center gap-3 select-none">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-lg font-black text-white">{t('settings')}</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Language Selection Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  {t('language')}
                </h3>
                <span className="text-xs font-bold text-[#14213D] block mt-0.5">
                  {currentLang}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLanguageModal(true)}
              className="py-2 px-3.5 rounded-xl bg-[#1E88E5] text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center gap-1 shadow-sm shadow-blue-100"
            >
              <span>{t('selectLanguage')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            {t('currencyPreference')}
          </h3>

          <div className="space-y-1">
            {currencies.map((c) => {
              const isSelected = settings.currency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code, c.symbol)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-[#1E88E5] border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span>{c.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#1E88E5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Preferences
          </h3>

          {/* Theme Switch (Dark Mode / Light Mode - Small Size) */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <span className="text-xs font-bold text-[#14213D] block">
                  {settings.darkMode ? 'Dark Theme' : 'Light Theme'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {settings.darkMode ? 'Dark mode enabled' : 'Light mode enabled'}
                </span>
              </div>
            </div>
            {/* Small Size Switch */}
            <button
              onClick={handleToggleDarkMode}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                settings.darkMode ? 'bg-[#1E88E5]' : 'bg-slate-300'
              }`}
              aria-label="Toggle Dark Mode"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  settings.darkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications Switch - Small Size */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-[#14213D]">{t('notifications')}</span>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                settings.notificationsEnabled ? 'bg-[#1E88E5]' : 'bg-slate-300'
              }`}
              aria-label="Toggle Notifications"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">
            Account Actions
          </h3>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 text-[#E91E63] font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('deleteAccount')}</span>
          </button>
        </div>
      </div>

      {/* 25-Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1E88E5]" />
                <h3 className="font-extrabold text-base text-[#14213D]">
                  Select Language ({SUPPORTED_LANGUAGES.length})
                </h3>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Language Search */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search 25 languages..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#1E88E5]"
              />
            </div>

            {/* Languages List */}
            <div className="overflow-y-auto space-y-1 pr-1 flex-1 no-scrollbar">
              {filteredLanguages.map((lang) => {
                const isSelected = currentLang.toLowerCase() === lang.name.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[#1E88E5] border border-blue-200 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#14213D]">{lang.nativeName}</span>
                      <span className="text-slate-400 text-[11px]">({lang.name})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1E88E5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account permanently?"
        message="Are you sure you want to delete your account? All your financial transactions and summaries will be erased permanently."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* STICKY BOTTOM REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        <AdsterraBanner />
      </div>
    </div>
  );
};
