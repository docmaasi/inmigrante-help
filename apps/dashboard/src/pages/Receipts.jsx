import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Receipt, DollarSign, Calendar, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import FileUpload from '../components/shared/FileUpload';
import ShareQRCode from '../components/shared/ShareQRCode';

export function ReceiptsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('all');

  const { data: receipts = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data;
    }
  });

  const filteredReceipts = selectedRecipient === 'all'
    ? receipts
    : receipts.filter(r => r.care_recipient_id === selectedRecipient);

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Receipts & Expenses</h1>
            <p className="text-slate-500 mt-1">Track and manage care-related expenses</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Receipt
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 rounded-full">
                  <Receipt className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Receipts</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredReceipts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-full">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardContent className="p-4">
              <Label className="text-sm text-slate-500 mb-2 block">Filter by Recipient</Label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  {recipients.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <ReceiptForm
            recipients={recipients}
            onClose={() => setShowForm(false)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map(receipt => (
            <ReceiptCard key={receipt.id} receipt={receipt} recipients={recipients} />
          ))}
        </div>

        {filteredReceipts.length === 0 && (
          <Card className="p-12 text-center shadow-sm border border-slate-200 bg-white">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-10 h-10 text-teal-600" />
            </div>
            <p className="text-slate-500">No receipts found. Add your first receipt to get started.</p>
          </Card>
        )}

        <div className="mt-8 flex justify-center">
          <ShareQRCode />
        </div>
      </div>
    </div>
  );
}

function ReceiptForm({ recipients, receipt, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(receipt || {
    care_recipient_id: '',
    title: '',
    category: 'other',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: '',
    photo_url: '',
    notes: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const dataToSave = { ...data, amount: parseFloat(data.amount) || 0 };
      if (receipt?.id) {
        const { data: updated, error } = await supabase
          .from('expenses')
          .update(dataToSave)
          .eq('id', receipt.id)
          .select()
          .single();
        if (error) throw error;
        return updated;
      }
      const { data: created, error } = await supabase
        .from('expenses')
        .insert(dataToSave)
        .select()
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(receipt ? 'Receipt updated' : 'Receipt added');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save receipt');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.title || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Card className="mb-6 shadow-sm border border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200 flex flex-row items-center justify-between">
        <CardTitle>{receipt ? 'Edit Receipt' : 'Add Receipt'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Care Recipient *</Label>
              <Select
                value={formData.care_recipient_id}
                onValueChange={(value) => setFormData({ ...formData, care_recipient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title / Description *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Prescription refill, Medical equipment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Store or provider name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Receipt Photo</Label>
            <FileUpload
              value={formData.photo_url}
              onChange={(url) => setFormData({ ...formData, photo_url: url })}
              label="Upload Receipt Photo"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : receipt ? 'Update' : 'Add Receipt'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ReceiptCard({ receipt, recipients }) {
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

  const recipient = recipients.find(r => r.id === receipt.care_recipient_id);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', receipt.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Receipt deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete receipt');
    }
  });

  const categoryColors = {
    medical: 'bg-red-100 text-red-800',
    pharmacy: 'bg-purple-100 text-purple-800',
    equipment: 'bg-blue-100 text-blue-800',
    transportation: 'bg-green-100 text-green-800',
    other: 'bg-slate-100 text-slate-800'
  };

  if (showEdit) {
    return <ReceiptForm receipt={receipt} recipients={recipients} onClose={() => setShowEdit(false)} />;
  }

  return (
    <Card className="hover:shadow-md transition-shadow shadow-sm border border-slate-200 bg-white">
      <CardContent className="p-4">
        {receipt.photo_url && (
          <img
            src={receipt.photo_url}
            alt="Receipt"
            className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer"
            onClick={() => window.open(receipt.photo_url, '_blank')}
          />
        )}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900">{receipt.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[receipt.category]}`}>
            {receipt.category}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-2">{recipient?.full_name}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            ${receipt.amount?.toFixed(2) || '0.00'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(receipt.date), 'MMM d, yyyy')}
          </div>
        </div>
        {receipt.vendor && (
          <p className="text-xs text-slate-500 mb-3">Vendor: {receipt.vendor}</p>
        )}
        {receipt.notes && (
          <p className="text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded">{receipt.notes}</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="flex-1">
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
