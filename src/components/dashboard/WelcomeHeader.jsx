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
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" fill="white" />
        </div>
        <div>
          <h1 className="text-3xl font-light text-slate-800">
            {greeting()}, <span className="font-medium">{userName}</span>
          </h1>
          <p className="text-slate-500 text-sm">Here's what needs your attention today</p>
        </div>
      </div>
    </div>
  );
}