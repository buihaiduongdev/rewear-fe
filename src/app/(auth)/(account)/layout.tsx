import type { ReactNode } from 'react';

import { AuthPageShell } from '@/features/access-account/components/AuthPageShell';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthPageShell>{children}</AuthPageShell>;
}
