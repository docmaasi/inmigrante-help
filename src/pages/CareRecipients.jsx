import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import RecipientCard from '../components/recipients/RecipientCard';
import CareRecipientForm from '../components/care/CareRecipientForm';

export default function CareRecipients() {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list('-created_date'),
  });

  if (showAddForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <CareRecipientForm onClose={() => setShowAddForm(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-800 mb-2">Care Recipients</h1>
            <p className="text-slate-500">Manage profiles for your loved ones</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recipient
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">No care recipients yet</h3>
            <p className="text-slate-500 mb-6">Add your first care recipient to get started</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-600 to-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map(recipient => (
              <RecipientCard key={recipient.id} recipient={recipient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}