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
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/0383fef8c_283c3899-01fa-454b-be43-1de8e9a4296a1.png"
          alt="FamilyCare.Help QR Code"
          className="w-40 h-40 mx-auto"
        />
        <p className="text-xs text-slate-600">Scan to access FamilyCare.Help</p>
      </div>
    </Card>
  );
}