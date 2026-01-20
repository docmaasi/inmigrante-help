import React from 'react';
import ShiftHandoff from '../components/scheduling/ShiftHandoff';

export default function ShiftHandoffPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Shift Handoff</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Document and communicate shift transitions</p>
        </div>
        <ShiftHandoff />
      </div>
    </div>
  );
}