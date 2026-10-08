import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppNotification, ScreenName } from '../types';
import { subscribeNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/dbService';
import { formatTime } from '../utils/formatters';

interface NotificationsScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onGoBack?: () => void;
  onSuccess: (msg: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigate, onGoBack, onSuccess }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    const unsub = subscribeNotifications(user.uid, (list) => {
      setNotifications(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
    onSuccess('All notifications marked as read.');
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!user || notif.read) return;
    await markNotificationAsRead(user.uid, notif.notificationId);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-12 max-w-md mx-auto">
      {/* Header with Royal Blue Gradient */}
      <div className="bg-[#1E88E5] text-white p-4 shadow-md sticky top-0 z-20 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-black text-white">Notifications</h2>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all"
          >
            <CheckCheck className="w-4 h-4 text-white" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="p-5">
        {isLoading ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 my-8 space-y-2">
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-indigo-50 text-[#6675E8] flex items-center justify-center">
              <Bell className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-[#14213D]">No Notifications</h4>
            <p className="text-xs text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-slate-100 opacity-80'
                    : 'bg-purple-50/60 border-purple-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#6675E8]/10 text-[#6675E8] flex items-center justify-center shrink-0 mt-0.5">
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#159447]" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-[#6675E8]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#14213D]">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
