import React from 'react';
import { X, HelpCircle, Mail, PhoneCall } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1E88E5]" />
            <h3 className="font-extrabold text-base text-[#14213D]">Help &amp; Support</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Need help managing your cash book entries or setting up Firebase? Our support team is available 24/7.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-[#14213D]">
              <Mail className="w-4 h-4 text-[#1E88E5]" />
              <span>Email Support</span>
            </div>
            <p className="text-slate-500 font-mono">support@cashbook.app</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-[#14213D]">
              <PhoneCall className="w-4 h-4 text-[#159447]" />
              <span>Toll Free Hotline</span>
            </div>
            <p className="text-slate-500 font-mono">+1 (800) 555-CASH</p>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-blue-800">
            <h4 className="font-bold mb-1">Frequently Asked Questions</h4>
            <p className="text-[11px] leading-relaxed">
              Q: Is my cash book data synced with Firebase?
              <br />
              A: Yes! All entries, total cash in, cash out, and balances are synced live with Firebase Realtime Database.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#1E88E5] text-white font-bold text-xs shadow-md shadow-blue-100"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
