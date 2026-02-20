import React from 'react';
import ShiftHandoff from '../components/scheduling/ShiftHandoff';

export default function ShiftHandoffPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FFF7ED] to-[#F4A261]/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#E07A5F] to-[#F4A261] bg-clip-text text-transparent">
            Shift Handoff
          </h1>
          <p className="text-sm md:text-base text-[#8B7EC8] mt-1">Document and communicate shift transitions</p>
        </div>
        <ShiftHandoff />
      </div>
    </div>
  );
}
