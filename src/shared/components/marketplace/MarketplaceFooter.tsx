import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="text-rewear-muted mx-auto hidden w-full max-w-[1536px] items-center justify-between px-4 py-8 text-sm font-semibold md:flex md:px-12">
      <p>© 2026 RE.WEAR</p>
      <div className="flex items-center gap-6">
        <Link href="/help" className="hover:underline">
          Help
        </Link>
        <span aria-hidden="true" className="text-rewear-border">
          ·
        </span>
        <Link href="/returns" className="hover:underline">
          Returns
        </Link>
        <span aria-hidden="true" className="text-rewear-border">
          ·
        </span>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
