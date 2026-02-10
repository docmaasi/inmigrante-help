import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Share2, Image, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MessageInput({ onSend, onShareUpdate, disabled, isSending }) {
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setPhotos([...photos, ...urls]);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload photos');
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
              <img src={photo} alt="" loading="lazy" className="w-16 h-16 object-cover rounded border" />
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
            >
              <Image className="w-4 h-4" />
            </Button>
          </label>
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && photos.length === 0) || uploading || isSending}
            className="bg-blue-600 hover:bg-blue-700"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            onClick={onShareUpdate}
            disabled={disabled}
            variant="outline"
            size="icon"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}