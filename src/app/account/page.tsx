import type { Metadata } from 'next';

import { AccountPage } from '@/features/account/components/AccountPage';

export const metadata: Metadata = {
  title: 'Your account | RE.WEAR',
  description:
    'Manage your profile, saved Vietnam delivery addresses, and recent orders on RE.WEAR.',
};

export default function Page() {
  return <AccountPage />;
}
