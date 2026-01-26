import React, { useState } from 'react';
import { useCareRecipients } from '@/hooks';
import EmergencyInfoCard from '../components/emergency/EmergencyInfoCard';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, AlertCircle } from 'lucide-react';

export default function Emergency() {
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);

  const { data: recipients = [], isLoading } = useCareRecipients();

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header with emergency styling */}
        <div className="mb-6 p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            Emergency Information
          </h1>
          <p className="text-red-100 mt-1">Quick access to critical care information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-4">Select Care Recipient</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                </div>
              ) : recipients.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No care recipients yet</p>
              ) : (
                <div className="space-y-2">
                  {recipients.map(recipient => {
                    const fullName = [recipient.first_name, recipient.last_name].filter(Boolean).join(' ');
                    const isSelected = selectedRecipientId === recipient.id;
                    return (
                      <Button
                        key={recipient.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start ${
                          isSelected
                            ? "bg-teal-600 hover:bg-teal-700 text-white"
                            : "border-slate-200 hover:bg-slate-50 hover:border-teal-300"
                        }`}
                        onClick={() => setSelectedRecipientId(recipient.id)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        {fullName}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <EmergencyInfoCard recipient={selectedRecipient} />
          </div>
        </div>
      </div>
    </div>
  );
}
