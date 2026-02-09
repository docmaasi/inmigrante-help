import React, { useState } from 'react';
import { useCareRecipients, useDocuments, useCreateDocument, useDeleteDocument, useUploadDocument } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Download, Trash2, Star, Calendar, User, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Documents() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    care_recipient_id: '',
    name: '',
    category: 'other',
    description: '',
    tags: []
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const { user } = useAuth();
  const { data: documents = [], isLoading } = useDocuments();
  const { data: recipients = [] } = useCareRecipients();
  const createMutation = useCreateDocument();
  const deleteMutation = useDeleteDocument();
  const uploadMutation = useUploadDocument();

  const handleCloseDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setFormData({
      care_recipient_id: '',
      name: '',
      category: 'other',
      description: '',
      tags: []
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.name) {
        setFormData({...formData, name: file.name});
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadMutation.mutateAsync({
        file: selectedFile,
        careRecipientId: formData.care_recipient_id || undefined,
      });

      const documentData = {
        ...formData,
        care_recipient_id: formData.care_recipient_id || null,
        file_path: uploadResult.filePath,
        file_size: uploadResult.fileSize,
        file_type: uploadResult.fileType,
      };

      createMutation.mutate(documentData, {
        onSuccess: () => {
          toast.success('Document uploaded');
          handleCloseDialog();
        },
        onError: () => {
          toast.error('Failed to save document');
        },
      });
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Document deleted'),
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const recipientMatch = selectedRecipient === 'all' || doc.care_recipient_id === selectedRecipient;
    const typeMatch = selectedType === 'all' || doc.category === selectedType;
    return recipientMatch && typeMatch;
  });

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return 'Unknown';
    return `${recipient.first_name} ${recipient.last_name}`;
  };

  const typeColors = {
    medical_record: 'bg-blue-100 text-blue-700',
    lab_result: 'bg-cyan-100 text-cyan-700',
    prescription: 'bg-green-100 text-green-700',
    insurance: 'bg-purple-100 text-purple-700',
    legal: 'bg-slate-700 text-white',
    power_of_attorney: 'bg-indigo-100 text-indigo-700',
    advance_directive: 'bg-red-100 text-red-700',
    identification: 'bg-yellow-100 text-yellow-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Documents</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">Manage medical records, insurance, and legal documents</p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)} className="bg-teal-600 hover:bg-teal-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm border border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-slate-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Care Recipient</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recipients</SelectItem>
                    {recipients.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Document Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="medical_record">Medical Record</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="power_of_attorney">Power of Attorney</SelectItem>
                    <SelectItem value="advance_directive">Advance Directive</SelectItem>
                    <SelectItem value="identification">Identification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-teal-600" />
              </div>
              <p className="text-slate-500 mb-4">No documents found</p>
              <Button onClick={() => setShowUploadDialog(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow shadow-sm border border-slate-200 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-teal-600 mt-0.5" />
                      {doc.is_shared && <Star className="w-4 h-4 text-orange-500 fill-orange-500" />}
                    </div>
                    <Badge className={typeColors[doc.category] || typeColors.other}>
                      {(doc.category || 'other').replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{doc.name}</h3>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    {doc.care_recipient_id && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{getRecipientName(doc.care_recipient_id)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{format(parseISO(doc.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatFileSize(doc.file_size)}
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 rounded p-2 mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
                        window.open(publicUrl, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              <div>
                <Label>Care Recipient</Label>
                <Select value={formData.care_recipient_id} onValueChange={(v) => setFormData({...formData, care_recipient_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>File *</Label>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  required
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label>Document Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Document Type *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_record">Medical Record</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="power_of_attorney">Power of Attorney</SelectItem>
                    <SelectItem value="advance_directive">Advance Directive</SelectItem>
                    <SelectItem value="identification">Identification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Optional notes about this document"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
