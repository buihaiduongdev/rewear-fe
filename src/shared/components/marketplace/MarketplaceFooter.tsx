'use client';

import { useState } from 'react';

import {
  PolicyModals,
  type PolicyModalType,
} from '@/shared/components/marketplace/PolicyModals';

export function MarketplaceFooter({
  showOnMobile = false,
}: {
  showOnMobile?: boolean;
}) {
  const [modalType, setModalType] = useState<PolicyModalType>(null);

  return (
    <>
      <footer
        className={`text-rewear-muted mx-auto w-full max-w-[1536px] items-center justify-between gap-4 px-4 py-8 text-sm font-semibold md:flex md:px-12 ${showOnMobile ? 'flex flex-wrap' : 'hidden'}`}
      >
        <p>© 2026 RE.WEAR</p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setModalType('help')}
            className="hover:text-rewear-text cursor-pointer hover:underline"
          >
            Help
          </button>
          <span aria-hidden="true" className="text-rewear-border">
            ·
          </span>
          <button
            type="button"
            onClick={() => setModalType('returns')}
            className="hover:text-rewear-text cursor-pointer hover:underline"
          >
            Returns
          </button>
          <span aria-hidden="true" className="text-rewear-border">
            ·
          </span>
          <button
            type="button"
            onClick={() => setModalType('privacy')}
            className="hover:text-rewear-text cursor-pointer hover:underline"
          >
            Privacy
          </button>
        </div>
      </footer>

      <PolicyModals openType={modalType} onClose={() => setModalType(null)} />
    </>
  );
}
