import { AuthBrandPanel } from '@/features/access-account/components/AuthBrandPanel';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground flex h-dvh w-full">
      <AuthBrandPanel />

      <div className="bg-background flex flex-1 overflow-y-auto px-6 py-10 md:px-12">
        <div className="border-border bg-card shadow-elevated m-auto w-full max-w-[400px] rounded-2xl border p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
