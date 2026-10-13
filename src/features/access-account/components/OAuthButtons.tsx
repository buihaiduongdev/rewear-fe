import { Button } from '@/shared/components/ui/button';
import { LogoImage } from '@/shared/components/ui/logo-image';
import { Separator } from '@/shared/components/ui/separator';
import { signIn } from 'next-auth/react';

type TOAuthButtonsProps = {
  callbackUrl?: string;
};

export function OAuthButtons({ callbackUrl = '/' }: TOAuthButtonsProps) {
  return (
    <>
      <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs tracking-wide uppercase">
        <Separator className="flex-1" />
        <span>or continue with</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          signIn(
            'google',
            { redirectTo: callbackUrl },
            { prompt: 'select_account' },
          )
        }
        className="mb-3 h-10 w-full text-sm font-medium"
      >
        <LogoImage src="/brands/google.svg" alt="Google logo" />
        Log in with Google
      </Button>
    </>
  );
}
