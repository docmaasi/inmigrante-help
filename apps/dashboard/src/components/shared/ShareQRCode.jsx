import React from 'react';
import { Card } from '@/components/ui/card';
import { Share2 } from 'lucide-react';

export default function ShareQRCode({ className = "" }) {
  return (
    <Card className={`p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 ${className}`}>
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Share2 className="w-5 h-5" />
          <p className="font-semibold text-sm">Share with someone in need</p>
        </div>
        <img 
          src="/images/familycare-qr.png"
          alt="FamilyCare.Help QR Code"
          className="w-56 h-56 mx-auto"
        />
        <p className="text-xs text-slate-600">Scan to access FamilyCare.Help</p>
      </div>
    </Card>
  );
}