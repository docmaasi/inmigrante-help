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
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/dc1693022_215100fc-6f0b-4896-9b58-34fe0409b45b.png"
          alt="FamilyCare.Help"
          className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
        />
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