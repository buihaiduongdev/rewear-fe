import { LogoImage } from '@/shared/components/ui/logo-image';
import { SITE } from '@/shared/constants/site';

export function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#10aa50,#0e9243)] p-12 text-white md:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_8%_92%,rgba(255,255,255,0.08),transparent_46%)]" />

      {/* Brand mark */}
      <div className="animate-rise relative z-10 flex items-center gap-3">
        <LogoImage src={SITE.logoSrc} size={40} alt="" className="rounded-xl" />
        <span className="font-heading text-xl font-semibold tracking-tight text-white">
          {SITE.name}
        </span>
      </div>

      {/* Pitch */}
      <div className="relative z-10 max-w-md">
        <h2 className="animate-rise font-heading text-4xl leading-[1.12] font-semibold tracking-tight text-white [animation-delay:80ms]">
          Give clothes a new life.
        </h2>
        <p className="animate-rise mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-white/85 [animation-delay:140ms]">
          Join Rewear to buy and sell pre-loved clothing.
        </p>
      </div>
    </div>
  );
}
