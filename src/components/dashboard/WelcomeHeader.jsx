import React from 'react';
import { Heart } from 'lucide-react';

export default function WelcomeHeader({ userName }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-light text-slate-800 truncate">
            {greeting()}, <span className="font-semibold">{userName}</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">Here's what needs your attention today</p>
        </div>
      </div>
    </div>
  );
}