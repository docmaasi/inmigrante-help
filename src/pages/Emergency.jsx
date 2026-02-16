import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmergencyInfoCard from '../components/emergency/EmergencyInfoCard';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, AlertCircle } from 'lucide-react';

export default function Emergency() {
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
          Emergency Information
        </h1>
        <p className="text-slate-500 mt-1">Quick access to critical care information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Care Recipient Selector */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Select Care Recipient</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : recipients.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No care recipients yet</p>
            ) : (
              <div className="space-y-2">
                {recipients.map(recipient => (
                  <Button
                    key={recipient.id}
                    variant={selectedRecipientId === recipient.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRecipientId(recipient.id)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {recipient.full_name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Info Display */}
        <div className="lg:col-span-2">
          <EmergencyInfoCard recipient={selectedRecipient} />
        </div>
      </div>
    </div>
  );
}