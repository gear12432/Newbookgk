import React, { useState } from 'react';
import { Wallet, User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenName } from '../types';

interface SignUpScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onSuccess: (message: string) => void;
}

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
];

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate, onSuccess }) => {
  const { signUp, googleSignIn } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(fullName, mobile, email, password, selectedAvatar);
      onSuccess('Account created successfully!');
      onNavigate('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      await googleSignIn();
      onSuccess('Signed in with Google!');
      onNavigate('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4 sm:p-6 w-full font-sans select-none my-auto">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 my-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-[#1689E8] to-[#2474C6] flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Wallet className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-[#17233C] tracking-tight">
            Cash Book
          </h1>
          <p className="text-xs font-semibold text-[#68758A] mt-1">
            Create your account to manage your income &amp; expenses
          </p>
        </div>

        {/* Inline Error */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-[#E91E63] text-xs font-semibold rounded-2xl animate-fade-in leading-relaxed">
            {errorMessage}
            {errorMessage.includes('unauthorized-domain') && (
              <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-rose-100 font-normal">
                <strong>Fix in Firebase Console:</strong> Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains &gt; Add domain: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">gear12432.github.io</code>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Avatar selector (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1.5 text-center">
              Choose Profile Avatar (Optional)
            </label>
            <div className="flex items-center justify-center gap-3">
              {avatarPresets.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(selectedAvatar === url ? '' : url)}
                  className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedAvatar === url
                      ? 'border-[#1689E8] scale-105 shadow-md shadow-blue-200'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Select avatar ${idx + 1}`}
                >
                  <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1">
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
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1">
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
                minLength={6}
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[#68758A] uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#17233C] bg-white focus:outline-none focus:border-[#1689E8] focus:ring-2 focus:ring-blue-100 transition-all font-medium disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* CREATE ACCOUNT Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1689E8] to-[#2474C6] text-white font-extrabold text-sm shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px]"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>CREATE ACCOUNT</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 font-bold text-slate-400">OR</span>
          </div>
        </div>

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading || isGoogleLoading}
          className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50/80 text-[#1F2937] font-bold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          aria-label="Continue with Google"
        >
          {isGoogleLoading ? (
            <span className="w-5 h-5 border-2 border-slate-300 border-t-[#1689E8] rounded-full animate-spin" />
          ) : (
            <>
              {/* Official Multi-colored Google "G" Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-[#68758A] font-medium">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-extrabold text-[#1689E8] hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
