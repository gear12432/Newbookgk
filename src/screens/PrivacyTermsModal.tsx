import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {isPrivacy ? (
              <ShieldCheck className="w-5 h-5 text-[#1E88E5]" />
            ) : (
              <FileText className="w-5 h-5 text-[#1E88E5]" />
            )}
            <h3 className="font-extrabold text-base text-[#14213D]">
              {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 text-xs text-slate-600 leading-relaxed no-scrollbar flex-1">
          {isPrivacy ? (
            <>
              <p className="font-bold text-[#14213D]">1. Data Ownership</p>
              <p>
                Your personal cash book data, entries, and profile information belong strictly to you. All user records are indexed under your Firebase UID.
              </p>
              <p className="font-bold text-[#14213D]">2. Encryption &amp; Security</p>
              <p>
                All data transmitted to Firebase Authentication and Realtime Database is encrypted in transit using standard SSL/TLS protocol.
              </p>
              <p className="font-bold text-[#14213D]">3. No Third-Party Sales</p>
              <p>
                Cash Book never sells or shares your private cash logs with advertisers or third parties.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-[#14213D]">1. Acceptable Use</p>
              <p>
                By using Cash Book, you agree to enter accurate financial records for personal budgeting and tracking purposes.
              </p>
              <p className="font-bold text-[#14213D]">2. Account Security</p>
              <p>
                You are responsible for keeping your login email and password confidential.
              </p>
              <p className="font-bold text-[#14213D]">3. Service Availability</p>
              <p>
                Cash Book is provided as-is for financial organization and expense management.
              </p>
            </>
          )}
        </div>

        <div className="pt-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#1E88E5] text-white font-bold text-xs shadow-md shadow-blue-100"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
