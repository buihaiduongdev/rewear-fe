import type { Metadata } from 'next';

import { HelpPage } from '@/features/help/components/HelpPage';

export const metadata: Metadata = {
  title: 'Help & returns | RE.WEAR',
  description:
    'Buying secondhand, 72-hour delivery issue window, returns and refunds policy on RE.WEAR.',
};

export default function Page() {
  return <HelpPage />;
}
