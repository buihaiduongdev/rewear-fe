'use client';

import { useEffect, useState } from 'react';

export function useDisputeWindow(deadline: string | null | undefined) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!deadline) return;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    const start = setTimeout(() => {
      const remaining = new Date(deadline).getTime() - Date.now();
      setOpen(remaining > 0);
      if (remaining > 0)
        expiry = setTimeout(
          () => setOpen(false),
          Math.min(remaining, 2147483647),
        );
    }, 0);
    return () => {
      clearTimeout(start);
      if (expiry) clearTimeout(expiry);
    };
  }, [deadline]);
  return Boolean(deadline) && open;
}
