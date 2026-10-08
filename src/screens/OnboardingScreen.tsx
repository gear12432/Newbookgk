import React, { useState } from 'react';
import { TrendingUp, PieChart, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    icon: TrendingUp,
    title: 'Track Your Income',
    description: 'Keep all your income records organized and easily accessible anytime, anywhere.',
    color: 'from-emerald-400 to-teal-600',
    bgColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: PieChart,
    title: 'Manage Your Expenses',
    description: 'Know exactly where your money is going with detailed breakdowns and categories.',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50 text-pink-600',
  },
  {
    icon: ShieldCheck,
    title: 'Stay In Control',
    description: 'Manage your finances easily every day and build healthy financial habits.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 text-[#1E88E5]',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('mw_onboarding_done', 'true');
    onFinish();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-40 bg-[#F7F9FC] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Step {currentSlide + 1} of {slides.length}
        </span>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleComplete}
            className="text-xs font-bold text-slate-500 hover:text-[#1E88E5] transition-colors py-1.5 px-3 rounded-full hover:bg-slate-100"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 text-center animate-fade-in key={currentSlide}">
        <div className={`w-28 h-28 rounded-3xl ${slide.bgColor} flex items-center justify-center mb-8 shadow-xl shadow-blue-100/50 animate-scale-up`}>
          <Icon className="w-14 h-14 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-black text-[#14213D] mb-3 tracking-tight">
          {slide.title}
        </h2>
        <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
          {slide.description}
        </p>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-[#1E88E5]' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pb-6">
        <button
          onClick={handleNext}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white font-extrabold text-sm shadow-xl shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              <span>Get Started</span>
              <CheckCircle2 className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
