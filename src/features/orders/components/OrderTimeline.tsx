import type { OrderControllerBuyerDetail200Data } from '@/shared/api/models';

export function OrderTimeline({
  order,
}: {
  order: OrderControllerBuyerDetail200Data;
}) {
  const eventTime = (action: string) =>
    order.events?.find((event) => event.action === action)?.createdAt;
  const milestones = [
    {
      label: order.paymentMethod === 'COD' ? 'Placed' : 'Paid',
      date: eventTime(order.paymentMethod === 'COD' ? 'PLACED' : 'PAID'),
    },
    { label: 'Confirmed', date: eventTime('ACCEPTED') ?? order.acceptedAt },
    { label: 'In transit', date: eventTime('SHIPPING') },
    {
      label: 'Delivered',
      date: eventTime('DELIVERED') ?? order.deliveryObservedAt,
    },
  ];
  const current = milestones.reduce(
    (last, step, index) => (step.date ? index : last),
    -1,
  );
  return (
    <ol
      aria-label="Order progress"
      className="hidden grid-cols-4 gap-2 py-2 md:grid"
    >
      {milestones.map((step, index) => (
        <li
          key={step.label}
          className="relative flex min-w-0 flex-col items-center gap-2 text-center"
        >
          {index < milestones.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute top-[7px] left-1/2 h-0.5 w-[calc(100%+0.5rem)] ${index < current ? 'bg-rewear-text' : 'bg-rewear-border'}`}
            />
          )}
          <span
            aria-hidden="true"
            className={`border-rewear-text relative h-4 w-4 rounded-full border-2 ${index === current ? 'bg-rewear-accent' : step.date ? 'bg-rewear-text' : 'bg-rewear-surface'}`}
          />
          <span className="text-xs font-semibold sm:text-sm">{step.label}</span>
          <span className="text-rewear-muted text-xs">
            {step.date
              ? new Intl.DateTimeFormat('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Ho_Chi_Minh',
                }).format(new Date(step.date))
              : '—'}
          </span>
        </li>
      ))}
    </ol>
  );
}
