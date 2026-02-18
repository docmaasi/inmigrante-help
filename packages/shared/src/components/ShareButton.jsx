import React from 'react';
import { Share2 } from 'lucide-react';

const SHARE_URL = 'https://www.FamilyCare.Help';
const SHARE_TITLE = 'FamilyCare.Help — Coordinating care together';

async function handleShare(onToast) {
  if (navigator.share) {
    try {
      await navigator.share({ title: SHARE_TITLE, url: SHARE_URL });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    onToast?.();
  } catch {
    // Last resort: prompt user
    window.prompt('Copy this link:', SHARE_URL);
  }
}

export function ShareButton({ className = '', onCopied }) {
  return (
    <button
      onClick={() => handleShare(onCopied)}
      className={`inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-teal-600 transition-colors ${className}`}
      title="Share FamilyCare.Help"
      aria-label="Share FamilyCare.Help"
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
}
