import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';
import { EditProfileModal } from './EditProfileModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { AdsterraBanner } from '../components/AdsterraBanner';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
  onSuccess: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onGoBack, onSuccess }) => {
  const { user, settings, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-28 max-w-md mx-auto relative">
      {/* Header with Royal Blue Gradient */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] p-6 text-white rounded-b-[32px] shadow-lg relative">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackClick}
            className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-black text-white">My Profile</h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="text-center pb-2">
          <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shadow-xl">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-white">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <h3 className="text-xl font-extrabold text-white">{user?.fullName || 'User Name'}</h3>
          <p className="text-xs text-blue-100 font-medium opacity-90 mt-0.5">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </div>

      {/* Info Cards List */}
      <div className="p-5 space-y-4">
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Contact Details
          </h4>

          <div className="flex items-center gap-3 py-1 border-b border-slate-50">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Email</span>
              <span className="text-xs font-bold text-[#14213D] truncate block">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Mobile</span>
              <span className="text-xs font-bold text-[#14213D] truncate block">
                {user?.mobile || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Settings Menu */}
        <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs space-y-1">
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#14213D]">App Settings</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Currency: {settings.currencySymbol}</span>
          </button>

          <button
            onClick={() => onNavigate('notifications')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E91E63] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#14213D]">Notifications</span>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-200 text-[#14213D] font-extrabold text-xs hover:bg-slate-50 transition-colors mb-3 shadow-xs"
          >
            Edit Profile
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 text-[#E91E63] font-extrabold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={onSuccess}
      />

      {/* Logout Confirm */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout?"
        message="Are you sure you want to log out of your cash book account?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={async () => {
          await logout();
          onSuccess('Logged out.');
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* STICKY BOTTOM REAL-TIME ADSTERRA BANNER ADS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-slate-300 shadow-2xl">
        <AdsterraBanner />
      </div>
    </div>
  );
};
