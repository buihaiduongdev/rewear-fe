import Image from 'next/image';
import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="bg-rewear-soft hidden px-12 py-12 md:block">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12">
        <div className="flex justify-between gap-16">
          <div className="space-y-4">
            <Link
              href="/"
              aria-label="RE.WEAR home"
              className="flex h-[46px] items-center"
            >
              <Image
                src="/brands/rewear-wordmark-footer.svg"
                alt="RE.WEAR"
                width={152}
                height={29}
                unoptimized
              />
            </Link>
            <p className="text-base leading-6">
              Pre-owned clothing.
              <br />
              Ready for its next owner.
            </p>
          </div>
          <div className="flex w-44 flex-col items-start gap-4 text-sm leading-5 font-semibold">
            <h2>Help</h2>
            <span>Buying &amp; returns</span>
            <span>Privacy policy</span>
            <span>Terms of service</span>
          </div>
        </div>
        <div className="text-rewear-muted flex justify-between gap-6 text-sm leading-5 font-semibold">
          <p>© 2026 RE.WEAR</p>
          <p>
            <span lang="en">English</span> / <span lang="vi">Tiếng Việt</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
