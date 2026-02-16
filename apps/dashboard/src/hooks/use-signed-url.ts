import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Generates a time-limited signed URL for a file stored in Supabase Storage.
 * If the value is already a full URL (legacy data), it returns it as-is.
 * If it's a storage path, it creates a 1-hour signed URL.
 */
export function useSignedUrl(
  path: string | null | undefined,
  bucket = 'documents',
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    // Legacy data: already a full URL — use directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      setUrl(path);
      return;
    }

    let cancelled = false;

    async function fetchUrl(): Promise<void> {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path!, 3600); // 1 hour

      if (!cancelled) {
        setUrl(error ? null : data.signedUrl);
      }
    }

    fetchUrl();
    return () => { cancelled = true; };
  }, [path, bucket]);

  return url;
}
