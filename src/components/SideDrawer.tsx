import React from 'react';
import { 
  X, 
  Home, 
  List, 
  BarChart3, 
  Grid, 
  User, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenHelp: () => void;
  onOpenPrivacyTerms: (type: 'privacy' | 'terms') => void;
  onLogoutConfirm: () => void;
  currentScreen: ScreenName;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenHelp,
  onOpenPrivacyTerms,
  onLogoutConfirm,
  currentScreen,
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const mainMenuItems = [
    { name: 'Home', screen: 'home' as ScreenName, icon: Home },
    { name: 'All Transactions', screen: 'all-transactions' as ScreenName, icon: List },
    { name: 'Reports', screen: 'reports' as ScreenName, icon: BarChart3 },
    { name: 'Categories', screen: 'categories' as ScreenName, icon: Grid },
    { name: 'Profile', screen: 'profile' as ScreenName, icon: User },
    { name: 'Settings', screen: 'settings' as ScreenName, icon: Settings },
  ];

  const handleItemClick = (screen: ScreenName) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-[80%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-up no-scrollbar">
        {/* User Info Header with Royal Blue Gradient */}
        <div>
          <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-extrabold text-white">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-white truncate">
                  {user?.fullName || 'Cash Book User'}
                </h3>
                <p className="text-xs text-blue-100 truncate opacity-90">
                  {user?.email || 'user@cashbook.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-4 px-3 space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item.screen)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#1E88E5]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1E88E5]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}

            <div className="my-3 border-t border-slate-100" />

            {/* Help, Privacy, Terms */}
            <button
              onClick={() => {
                onOpenHelp();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span>Help &amp; Support</span>
            </button>

            <button
              onClick={() => {
                onOpenPrivacyTerms('privacy');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => {
                onOpenPrivacyTerms('terms');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Terms &amp; Conditions</span>
            </button>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 safe-area-bottom">
          <button
            onClick={() => {
              onLogoutConfirm();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm bg-rose-50 text-[#E91E63] hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
