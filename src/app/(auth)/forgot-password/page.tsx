import { ForgotPasswordForm } from '@/features/access-account/components/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we’ll send you instructions to reset your
          password
        </p>
      </div>

      <ForgotPasswordForm />
    </>
  );
}
