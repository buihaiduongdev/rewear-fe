import type { Metadata } from 'next';

import { RegisterForm } from '@/features/access-account/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Create account | RE.WEAR' };

export default function RegisterPage() {
  return <RegisterForm />;
}
