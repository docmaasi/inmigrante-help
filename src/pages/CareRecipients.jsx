import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Phone, Calendar, Heart, AlertCircle, Stethoscope, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import CareRecipientForm from '../components/care/CareRecipientForm';
import { Badge } from "@/components/ui/badge";

export default function CareRecipients() {
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CareRecipient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['careRecipients']);
    }
  });

  const handleEdit = (recipient) => {
    setSelectedRecipient(recipient);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this care recipient?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Care Recipients</h1>
          <p className="text-slate-500 mt-1">Manage profiles for your loved ones</p>
        </div>
        <Button
          onClick={() => {
            setSelectedRecipient(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Care Recipient
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <CareRecipientForm
          recipient={selectedRecipient}
          onClose={() => {
            setShowForm(false);
            setSelectedRecipient(null);
          }}
        />
      )}

      {/* Recipients Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : recipients.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Care Recipients Yet</h3>
            <p className="text-slate-500 mb-6">Add your first care recipient to get started</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Care Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipients.map(recipient => (
            <Card key={recipient.id} className="shadow-sm border-slate-200/60 hover:shadow-lg transition-shadow overflow-hidden group">
              {/* Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-700 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="absolute -bottom-12 left-6">
                  {recipient.photo_url ? (
                    <img
                      src={recipient.photo_url}
                      alt={recipient.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="pt-16 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{recipient.full_name}</h3>
                  {recipient.date_of_birth && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Born {format(new Date(recipient.date_of_birth), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                {recipient.primary_condition && (
                  <div className="mb-4">
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {recipient.primary_condition}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {recipient.primary_physician && (
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Dr. {recipient.primary_physician}</span>
                    </div>
                  )}
                  {recipient.emergency_contact_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{recipient.emergency_contact_name}</span>
                    </div>
                  )}
                  {recipient.allergies && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-slate-600">Allergies: {recipient.allergies}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(recipient)}
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(recipient.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}