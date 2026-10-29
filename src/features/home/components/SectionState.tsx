import { EmptyPanel } from '@/shared/components/ui/request-state';

export function SectionState({
  isPending,
  isError,
  onRetry,
  emptyTitle,
  emptyDescription,
}: {
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 motion-safe:animate-pulse">
            <div className="bg-rewear-soft aspect-[278/348]" />
            <div className="bg-rewear-soft h-4 w-2/3" />
            <div className="bg-rewear-soft h-3 w-1/3" />
          </div>
        ))}
        <span className="sr-only">Loading clothing</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="bg-rewear-soft flex min-h-52 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
      >
        <p>We couldn’t load this right now.</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 px-4 text-sm font-semibold underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return <EmptyPanel title={emptyTitle} description={emptyDescription} />;
}
