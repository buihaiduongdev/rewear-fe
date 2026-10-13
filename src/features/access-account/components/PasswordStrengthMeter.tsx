import { passwordStrengthRules } from '@/modules/auth/validators';
import { cn } from 'cn';

const STRENGTH_LEVELS = [
  { label: 'Very weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-amber-400' },
  { label: 'Strong', color: 'bg-green-500' },
  { label: 'Very strong', color: 'bg-green-500' },
] as const;

type TPasswordStrengthMeterProps = {
  score: number;
};

export function PasswordStrengthMeter({ score }: TPasswordStrengthMeterProps) {
  const level = score > 0 ? STRENGTH_LEVELS[score - 1] : null;

  return (
    <div className="-mt-2 mb-5" aria-live="polite">
      <div className="flex gap-1.5">
        {passwordStrengthRules.map((rule, index) => (
          <div
            key={rule.label}
            className={cn(
              'bg-border h-1 flex-1 rounded-full transition-colors',
              level && index < score && level.color,
            )}
          />
        ))}
      </div>
      {level ? (
        <p className="text-muted-foreground mt-1.5 text-xs">
          Password strength:{' '}
          <span className="text-foreground font-medium">{level.label}</span>
        </p>
      ) : null}
      <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
        {passwordStrengthRules.map((rule) => (
          <li key={rule.label}>{rule.label}</li>
        ))}
      </ul>
    </div>
  );
}
