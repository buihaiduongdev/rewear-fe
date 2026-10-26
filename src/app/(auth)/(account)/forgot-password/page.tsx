import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/access-account/components/forms/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Reset password | RE.WEAR' };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
