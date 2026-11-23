'use client';

import * as React from 'react';

import Link from 'next/link';

import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { ChevronDown, Search } from 'lucide-react';

import type { SellerProductItem } from '../types';

export type { SellerProductItem } from '../types';

interface SellerProductsPageProps {
  products: SellerProductItem[];
  totalItems?: number;
  page?: number;
  hasNext?: boolean;
  onPageChange?: (page: number) => void;
  onCreateListing?: () => void;
}

export function SellerProductsPage({
  products,
  totalItems,
  page = 1,
  hasNext = false,
  onPageChange,
  onCreateListing,
}: SellerProductsPageProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<
    'All' | SellerProductItem['status']
  >('All');

  const filteredProducts = React.useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const reservedCount = React.useMemo(
    () => products.filter((p) => p.status === 'Held').length,
    [products],
  );

  return (
    <div className="space-y-8">
      {/* Title: Figma 53:1153 */}
      <h1 className="text-[32px] leading-[46px] font-semibold tracking-[-0.02em] sm:text-[40px]">
        Products
      </h1>

      {/* Search and Listing Actions: Figma 53:1154 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input: Figma 71:423 */}
          <div className="bg-rewear-soft relative flex h-11 w-full max-w-md items-center px-4">
            <Search size={16} className="text-rewear-muted mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title or code"
              className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Status Dropdown: Figma 53:1158 */}
          <div className="relative">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'All' | SellerProductItem['status'],
                )
              }
              className="bg-rewear-soft text-rewear-text h-11 cursor-pointer appearance-none px-4 pr-10 text-sm font-semibold outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Held">Held</option>
              <option value="In review">In review</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
              <option value="Sold">Sold</option>
              <option value="Hidden">Hidden</option>
            </select>
            <ChevronDown
              size={14}
              className="text-rewear-text pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          </div>
        </div>

        {/* Create Listing Button: Figma 53:1159 */}
        {onCreateListing ? (
          <button
            type="button"
            onClick={onCreateListing}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-[52px] min-w-[200px] items-center justify-center px-6 text-sm font-semibold transition sm:min-w-[240px]"
          >
            Create listing
          </button>
        ) : (
          <Link
            href="/selling/new"
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-[52px] min-w-[200px] items-center justify-center px-6 text-sm font-semibold transition sm:min-w-[240px]"
          >
            Create listing
          </Link>
        )}
      </div>

      {/* Listings summary count: Figma 53:1161 */}
      <p className="text-rewear-muted text-base">
        {filteredProducts.length} listings · {reservedCount} reserved item
        {reservedCount !== 1 ? 's' : ''}
      </p>

      <p className="text-rewear-muted text-sm">
        Search and status filters apply to this page.
        {totalItems !== undefined ? ` ${totalItems} total listings.` : ''}
      </p>
      {/* Product Table: Figma 53:1162 */}
      <div className="border-rewear-border overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* Table Header: Figma 53:1163 */}
            <thead className="border-rewear-border text-rewear-muted border-b bg-transparent text-sm font-semibold">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="w-36 px-4 py-3 font-semibold">Price</th>
                <th className="w-44 px-4 py-3 font-semibold">Status</th>
                <th className="w-28 px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Rows: Figma 53:1172 */}
            <tbody className="divide-rewear-border divide-y">
              {filteredProducts.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-rewear-soft/30 transition"
                >
                  {/* Product info: thumbnail + title + size/condition */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="bg-rewear-soft relative h-20 w-16 shrink-0 overflow-hidden">
                        <ProductPhoto url={item.image} title={item.title} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-rewear-text text-base font-semibold">
                          {item.title}
                        </p>
                        <p className="text-rewear-muted text-sm">
                          {item.size} · {item.condition}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-base font-semibold">
                    {item.price}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-base">
                    {item.status === 'Held' ? (
                      <div className="space-y-0.5">
                        <p className="text-rewear-text font-semibold">Held</p>
                        <p className="text-rewear-muted text-xs">
                          Editing locked
                        </p>
                      </div>
                    ) : (
                      <span className="font-semibold">{item.status}</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    {item.isLocked ? (
                      <span className="text-rewear-muted cursor-not-allowed text-sm font-semibold">
                        Locked
                      </span>
                    ) : (
                      <Link
                        href={`/selling/new?id=${encodeURIComponent(item.id)}`}
                        className="text-rewear-text text-sm font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-rewear-muted py-12 text-center"
                  >
                    {products.length === 0
                      ? 'No products yet.'
                      : 'No products match the current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {onPageChange && (
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
              className="disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
