import React, { useEffect } from 'react';
import { Wallet } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] flex flex-col items-center justify-center text-white px-6">
      {/* Background Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl animate-scale-up">
          <Wallet className="w-12 h-12 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* App Branding */}
      <h1 className="text-3xl font-black tracking-tight text-white mb-2 animate-fade-in drop-shadow-md">
        Cash Book
      </h1>
      <p className="text-sm font-semibold text-blue-100/90 text-center max-w-xs animate-fade-in">
        Track your income &amp; expenses
      </p>

      {/* Loading indicator at bottom */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-blue-100 font-medium tracking-wide uppercase">
          Initializing...
        </span>
      </div>
    </div>
  );
};
