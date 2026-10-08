import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onSuccess: (message: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigate,
  onSuccess,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      onSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4 sm:p-6 w-full font-sans select-none my-auto">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 my-auto">
        {/* Back button header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('login')}
            className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-blue-50 text-[#1689E8] flex items-center justify-center border border-blue-100">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-[#17233C] tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs font-semibold text-[#68758A] mt-2 max-w-xs mx-auto leading-relaxed">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        {isSent ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-[#159447] mx-auto" />
            <h3 className="font-bold text-sm">Reset Link Sent!</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              We have sent a password reset email to <span className="font-bold">{email}</span>. Please check your inbox.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 py-2.5 px-5 rounded-xl bg-[#159447] text-white font-bold text-xs shadow-md hover:bg-[#12803c] transition-all"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#E91E63] text-xs font-semibold rounded-2xl">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1689E8] to-[#2474C6] text-white font-extrabold text-sm shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px]"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
