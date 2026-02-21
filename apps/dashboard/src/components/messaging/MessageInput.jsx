import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Share2, Image, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export function MessageInput({ onSend, onShareUpdate, disabled }) {
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/messages/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setPhotos([...photos, ...urls]);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload photos');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (message.trim() || photos.length > 0) {
      onSend(message.trim(), photos);
      setMessage('');
      setPhotos([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      {photos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img src={photo} alt="" className="w-16 h-16 object-cover rounded border" />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || uploading}
          className="resize-none"
          rows={2}
        />
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || uploading}
              onClick={() => document.getElementById('photo-upload').click()}
              className="cursor-pointer"
              aria-label="Upload photo"
            >
              <Image className="w-4 h-4" />
            </Button>
          </label>
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && photos.length === 0) || uploading}
            className="bg-blue-600 hover:bg-blue-700"
            size="icon"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            onClick={onShareUpdate}
            disabled={disabled}
            variant="outline"
            size="icon"
            aria-label="Share update"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
