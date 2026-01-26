import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatCard({ title, value, icon: Icon, color, link, trend }) {
  const accentColors = {
    blue: 'border-l-teal-500 bg-teal-50/50',
    green: 'border-l-emerald-500 bg-emerald-50/50',
    orange: 'border-l-amber-500 bg-amber-50/50',
    purple: 'border-l-teal-500 bg-teal-50/50',
    teal: 'border-l-teal-500 bg-teal-50/50'
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 border-l-4 ${accentColors[color] || accentColors.teal} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        {trend && (
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium border border-emerald-100">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-semibold text-slate-800 tracking-tight">{value}</div>
        <div className="text-sm text-slate-500 mt-1">{title}</div>
      </div>
      {link && (
        <Link
          to={createPageUrl(link)}
          className="mt-4 inline-flex items-center text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors group"
        >
          View all
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}