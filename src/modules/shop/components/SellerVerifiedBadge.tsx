import { Badge } from '@/shared/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export function SellerVerifiedBadge({
  label = 'Đã xác thực',
}: {
  label?: string;
}) {
  return (
    <Badge
      variant="outline"
      className="bg-rewear-surface text-rewear-muted border-rewear-border gap-1 font-medium"
    >
      <ShieldCheck size={14} className="text-green-600" />
      {label}
    </Badge>
  );
}
