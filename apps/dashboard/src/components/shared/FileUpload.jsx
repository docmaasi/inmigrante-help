import React, { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useSignedUrl } from '@/hooks';
import { toast } from 'sonner';

function isPdf(val) {
  return typeof val === 'string' && val.toLowerCase().endsWith('.pdf');
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*,.pdf',
  label = 'Upload File',
  bucket = 'documents',
}) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const inputId = useId();
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonymous'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path (not the full URL) so we can generate
      // signed URLs later for private bucket access
      onChange(fileName);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  // Generate signed URL for private bucket files
  const displayUrl = useSignedUrl(value, bucket);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {isPdf(value) ? (
            <a
              href={displayUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <FileText className="w-8 h-8 text-red-500" />
              <span className="text-sm text-teal-600 underline">View PDF</span>
            </a>
          ) : (
            <img
              src={displayUrl || ''}
              alt="Uploaded"
              className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={inputId}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {label}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
