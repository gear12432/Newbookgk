import React, { useState } from 'react';
import { Wallet, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onSuccess: (message: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onSuccess }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess('Logged in successfully!');
      onNavigate('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4 sm:p-6 w-full font-sans select-none">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 my-auto">
        {/* Top Header branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3.5 rounded-3xl bg-gradient-to-r from-[#1689E8] to-[#2474C6] flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Wallet className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-[#17233C] tracking-tight">
            Cash Book
          </h1>
          <p className="text-xs font-semibold text-[#68758A] mt-1">
            Login with your Gmail &amp; Password
          </p>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-[#E91E63] text-xs font-semibold rounded-2xl animate-fade-in leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1.5">
              Gmail / Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right pt-0.5">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs font-bold text-[#1689E8] hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* LOGIN Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1689E8] to-[#2474C6] text-white font-extrabold text-sm shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>LOGIN</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Sign Up Link */}
        <div className="mt-6 text-center text-xs text-[#68758A] font-medium">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-extrabold text-[#1689E8] hover:underline"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
