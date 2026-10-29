import { Button } from '@/shared/components/ui/button';
import { LogoImage } from '@/shared/components/ui/logo-image';
import { Separator } from '@/shared/components/ui/separator';
import { signIn } from 'next-auth/react';

type TOAuthButtonsProps = {
  callbackUrl?: string;
  appearance?: 'default' | 'login';
};

export function OAuthButtons({
  callbackUrl = '/',
  appearance = 'default',
}: TOAuthButtonsProps) {
  return (
    <>
      {appearance === 'default' && (
        <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs tracking-wide uppercase">
          <Separator className="flex-1" />
          <span>or continue with</span>
          <Separator className="flex-1" />
        </div>
      )}

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
        className={
          appearance === 'login'
            ? 'h-12 w-full gap-3 rounded-[8px] border-0 bg-[#f3f3f5] text-sm font-normal shadow-none hover:bg-[#e9e9ec]'
            : 'mb-3 h-10 w-full text-sm font-medium'
        }
      >
        <LogoImage
          src={
            appearance === 'login'
              ? '/brands/google-login.svg'
              : '/brands/google.svg'
          }
          alt=""
          size={appearance === 'login' ? 20 : 18}
        />
        {appearance === 'login' ? 'Continue with Google' : 'Log in with Google'}
      </Button>
    </>
  );
}
