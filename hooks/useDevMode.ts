"use client"

import { useState, useEffect } from 'react'

export function useDevMode() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    // Check if already unlocked
    ; (async () => {
      try {
        const res = await fetch('/api/dev_7c29/unlock')
        if (!res.ok) {
          setUnlocked(false)
          return
        }
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setUnlocked(!!data.unlocked)
        } catch {
          setUnlocked(false)
        }
      } catch {
        setUnlocked(false)
      }
    })()
  }, [])

  type UnlockResult = { success: boolean; error?: string }

  const unlock = async (secret: string): Promise<UnlockResult> => {
    try {
      const res = await fetch('/api/dev_7c29/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret })
      })

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        // Try to parse error as JSON, else as text
        if (contentType.includes('application/json')) {
          const errJson = await res.json().catch(() => undefined);
          return { success: false, error: errJson?.error || res.statusText };
        } else {
          const txt = await res.text();
          return { success: false, error: txt || res.statusText };
        }
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.unlocked) {
          // Re-check unlock state to ensure cookie set
          const check = await fetch('/api/dev_7c29/unlock');
          if (check.ok) {
            const checkContentType = check.headers.get('content-type') || '';
            if (checkContentType.includes('application/json')) {
              const checkData = await check.json().catch(() => undefined);
              setUnlocked(!!checkData?.unlocked);
            } else {
              setUnlocked(false);
            }
          }
          return { success: true };
        }
        return { success: false, error: 'Invalid secret' };
      } else {
        // Not JSON, treat as error
        const text = await res.text();
        return { success: false, error: text || 'Unexpected non-JSON response' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  return { unlocked, unlock }
}