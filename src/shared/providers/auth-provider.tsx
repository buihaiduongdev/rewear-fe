'use client';

import { useEffect, useRef } from 'react';

import { SessionProvider, signOut, useSession } from 'next-auth/react';

function SessionMonitor() {
  const { data: session } = useSession();
  const signingOut = useRef(false);

  useEffect(() => {
    if (session?.error === 'refreshTokenError' && !signingOut.current) {
      signingOut.current = true;
      void signOut({ redirectTo: '/login' });
    }
  }, [session?.error]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionMonitor />
      {children}
    </SessionProvider>
  );
}
