import React from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FamilyCare.Help',
          text: 'Check out FamilyCare.Help - Coordinating care together',
          url: url
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size="icon"
      className="text-slate-600 hover:bg-slate-100 relative mt-8"
      title={copied ? 'Copied!' : 'Share'}
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </Button>
  );
}