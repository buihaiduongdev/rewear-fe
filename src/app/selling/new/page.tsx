import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';

export default function NewListingPage() {
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <header className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
        <Link
          href="/"
          aria-label="RE.WEAR home"
          className="flex min-h-11 items-center"
        >
          <Image
            src="/brands/rewear-wordmark.svg"
            alt="RE.WEAR"
            width={91}
            height={16}
            className="h-auto w-[60px]"
            unoptimized
          />
        </Link>
        <span className="text-rewear-muted hidden sm:block">
          Seller workspace
        </span>
        <Link
          href="/selling"
          className="inline-flex min-h-11 items-center gap-1.5 hover:underline"
        >
          <ArrowLeft size={16} /> Back to workspace
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[640px] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="border-rewear-border w-full space-y-6 border bg-white p-8 shadow-xs md:p-12">
          <div className="bg-rewear-soft text-rewear-text mx-auto flex size-16 items-center justify-center rounded-full">
            <PackagePlus size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              List a New Archive Piece
            </h1>
            <p className="text-rewear-muted text-sm leading-6">
              The product curation and listing studio is currently being
              prepared. Soon you will be able to upload photos, provide garment
              provenance, and submit pieces for marketplace curation.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/selling"
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full items-center justify-center text-sm font-semibold transition"
            >
              Return to Seller Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
