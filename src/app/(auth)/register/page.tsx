import Link from 'next/link';

import { RegisterForm } from '@/features/access-account/components/forms/RegisterForm';
import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Create your Rewear account
        </p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{' '}
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-primary font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
