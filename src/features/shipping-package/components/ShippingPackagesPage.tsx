'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  useProductControllerFindManaged,
  useProductControllerFindMine,
  useProductControllerSubmit,
} from '@/shared/api/query-generated/products/products';
import { useShippingControllerPackageOptions } from '@/shared/api/query-generated/shipping/shipping';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { PackageForm } from './PackageForm';

const labels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  REJECTED: 'Needs changes',
  ACTIVE: 'Published',
  HIDDEN: 'Hidden',
  HELD: 'Reserved',
  SOLD: 'Sold',
  SUSPENDED: 'Suspended',
};
export function ShippingPackagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [id, setId] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const enabled = status === 'authenticated' && !session?.error;
  const listings = useProductControllerFindMine(
    { page, pageSize: 20 },
    {
      query: { enabled, queryKey: ['seller-listings', session?.user.id, page] },
    },
  );
  const detailKey = ['seller-package', session?.user.id, id];
  const details = useProductControllerFindManaged(id, {
    query: { enabled: enabled && !!id, queryKey: detailKey, retry: false },
  });
  const options = useShippingControllerPackageOptions({ query: { enabled } });
  const submit = useProductControllerSubmit({
    mutation: {
      onMutate: () => client.cancelQueries({ queryKey: detailKey }),
      onError: () => {
        void details.refetch();
      },
      meta: { skipSuccessToast: true, skipErrorToast: true },
    },
  });
  const product = details.data?.data;
  const error =
    listings.error || details.error || options.error || submit.error;
  const select = (next: string) => {
    setId(next);
    setDirty(false);
    setMessage('');
    submit.reset();
  };
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        search=""
        cartAction={<CartLink />}
        onSearch={(value) =>
          router.push(`/?search=${encodeURIComponent(value)}#new-arrivals`)
        }
      />
      <main
        id="main-content"
        className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 md:space-y-8 md:px-12 md:py-12"
      >
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Listing packages
        </h1>
        <p>
          Choose a listing you own, then enter its packed weight and outer
          dimensions.
        </p>
        {!!error && (
          <div role="alert">
            <p>{getApiErrorMessage(error)}</p>
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                void listings.refetch();
                void options.refetch();
                if (id) void details.refetch();
              }}
            >
              Try again
            </button>
          </div>
        )}
        {listings.isPending && <p role="status">Loading your listings…</p>}
        {listings.data?.data.items.length === 0 && (
          <p>No listings on this page.</p>
        )}
        <label className="bg-rewear-soft block space-y-2 rounded-lg px-4 py-3">
          <span className="block text-sm font-semibold">Your listing</span>
          <select
            aria-label="Your listing"
            className="h-6 w-full min-w-0 bg-transparent text-base leading-6"
            value={id}
            onChange={(e) => select(e.target.value)}
            disabled={saving || submit.isPending || listings.isPending}
          >
            <option value="">Choose a listing</option>
            {listings.data?.data.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title ?? 'Untitled listing'} · {labels[item.status]}
              </option>
            ))}
          </select>
        </label>
        {listings.data && (
          <nav aria-label="Listing pages" className="flex items-center gap-6">
            <button
              type="button"
              className="min-h-11 font-semibold disabled:opacity-40"
              disabled={
                saving ||
                submit.isPending ||
                !listings.data.data.meta.hasPreviousPage
              }
              onClick={() => {
                select('');
                setPage(page - 1);
              }}
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.max(1, listings.data.data.meta.totalPage)}
            </span>
            <button
              type="button"
              className="min-h-11 font-semibold disabled:opacity-40"
              disabled={
                saving ||
                submit.isPending ||
                !listings.data.data.meta.hasNextPage
              }
              onClick={() => {
                select('');
                setPage(page + 1);
              }}
            >
              Next
            </button>
          </nav>
        )}
        {message && <p role="status">{message}</p>}
        {id && details.isPending && (
          <p role="status">Loading package details…</p>
        )}
        {product && options.data && (
          <section className="space-y-6">
            <div>
              <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                {product.title ?? 'Untitled listing'}
              </h2>
              <p className="mt-2">Status: {labels[product.status]}</p>
            </div>
            <PackageForm
              key={`${product.id}:${product.revision}:${product.status}`}
              product={product}
              options={options.data.data}
              onDirty={() => {
                setDirty(true);
                setMessage('');
              }}
              disabled={submit.isPending}
              onBeforeSave={() => client.cancelQueries({ queryKey: detailKey })}
              onSaving={setSaving}
              onSaved={(response) => {
                client.setQueryData(detailKey, response);
                void client.invalidateQueries({
                  queryKey: ['seller-listings', session?.user.id],
                });
                setDirty(false);
                setMessage('Package details saved.');
              }}
              onRefresh={() => {
                void details.refetch();
              }}
            />
            {['DRAFT', 'REJECTED'].includes(product.status) && (
              <div className="space-y-3">
                <p>
                  Once the listing details and photos are complete, submit it
                  for review.
                </p>
                <button
                  type="button"
                  className="bg-rewear-soft min-h-12 px-5 text-sm font-semibold disabled:opacity-50"
                  disabled={
                    saving ||
                    dirty ||
                    submit.isPending ||
                    !product.shippingPackage
                  }
                  onClick={() =>
                    submit.mutate(
                      { id },
                      {
                        onSuccess: (response) => {
                          client.setQueryData(detailKey, response);
                          void client.invalidateQueries({
                            queryKey: ['seller-listings', session?.user.id],
                          });
                          setMessage('Listing submitted for review.');
                        },
                      },
                    )
                  }
                >
                  {submit.isPending
                    ? 'Submitting…'
                    : 'Submit listing for review'}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
