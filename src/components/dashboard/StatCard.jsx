import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StatCard({ title, value, icon: Icon, color, link, trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className="mb-1">
        <div className="text-3xl font-light text-slate-800 mb-1">{value}</div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
      </div>
      {link && (
        <Link 
          to={createPageUrl(link)} 
          className="mt-4 flex items-center text-xs text-slate-600 hover:text-slate-800 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      )}
    </div>
  );
}