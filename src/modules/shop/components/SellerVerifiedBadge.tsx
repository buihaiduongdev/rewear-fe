import { ShieldCheck } from 'lucide-react';

export function SellerVerifiedBadge({
  label = 'Đã xác thực',
}: {
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-rewear-surface px-2.5 py-1 text-xs font-medium text-rewear-muted border border-rewear-border">
      <ShieldCheck size={14} className="text-green-600" />
      {label}
    </span>
  );
}
