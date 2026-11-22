'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search } from 'lucide-react';

export interface SellerProductItem {
  id: string;
  title: string;
  size: string;
  condition: string;
  price: string;
  status: 'Active' | 'Held' | 'In review' | 'Draft';
  isLocked?: boolean;
  image: string;
}

const DEFAULT_SELLER_PRODUCTS: SellerProductItem[] = [
  {
    id: 'prod-lemaire-coat',
    title: 'Lemaire wool coat',
    size: 'M',
    condition: 'Very good',
    price: '580.000₫',
    status: 'Active',
    isLocked: false,
    image: '/images/seller/coat.png',
  },
  {
    id: 'prod-tailored-jacket',
    title: 'Tailored wool jacket',
    size: 'S',
    condition: 'Like new',
    price: '490.000₫',
    status: 'Held',
    isLocked: true,
    image: '/images/seller/jacket.png',
  },
  {
    id: 'prod-pleated-trousers',
    title: 'Pleated wool trousers',
    size: 'M',
    condition: 'Very good',
    price: '320.000₫',
    status: 'In review',
    isLocked: false,
    image: '/images/seller/trousers.png',
  },
  {
    id: 'prod-cashmere-sweater',
    title: 'Cashmere sweater',
    size: 'M',
    condition: 'Good',
    price: '720.000₫',
    status: 'Draft',
    isLocked: false,
    image: '/images/seller/sweater.png',
  },
];

interface SellerProductsPageProps {
  products?: SellerProductItem[];
  onCreateListing?: () => void;
}

export function SellerProductsPage({
  products = DEFAULT_SELLER_PRODUCTS,
  onCreateListing,
}: SellerProductsPageProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Held' | 'In review' | 'Draft'>('All');
  const [pageSize, setPageSize] = React.useState(12);

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
      <h1 className="text-[32px] sm:text-[40px] font-semibold leading-[46px] tracking-[-0.02em]">
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
              className="bg-transparent text-rewear-text placeholder:text-rewear-muted w-full text-sm outline-none"
            />
          </div>

          {/* Status Dropdown: Figma 53:1158 */}
          <div className="relative">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'All' | 'Active' | 'Held' | 'In review' | 'Draft',
                )
              }
              className="bg-rewear-soft text-rewear-text appearance-none h-11 px-4 pr-10 text-sm font-semibold outline-none cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Held">Held</option>
              <option value="In review">In review</option>
              <option value="Draft">Draft</option>
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
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-[52px] min-w-[200px] sm:min-w-[240px] items-center justify-center px-6 text-sm font-semibold transition"
          >
            Create listing
          </button>
        ) : (
          <Link
            href="/selling/new"
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-[52px] min-w-[200px] sm:min-w-[240px] items-center justify-center px-6 text-sm font-semibold transition"
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

      {/* Product Table: Figma 53:1162 */}
      <div className="border-rewear-border overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* Table Header: Figma 53:1163 */}
            <thead className="border-rewear-border text-rewear-muted border-b bg-transparent text-sm font-semibold">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold w-36">Price</th>
                <th className="py-3 px-4 font-semibold w-44">Status</th>
                <th className="py-3 px-4 text-right font-semibold w-28">Action</th>
              </tr>
            </thead>

            {/* Table Rows: Figma 53:1172 */}
            <tbody className="divide-rewear-border divide-y">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-rewear-soft/30 transition">
                  {/* Product info: thumbnail + title + size/condition */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-rewear-soft relative h-20 w-16 shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
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
                  <td className="py-3 px-4 text-base font-semibold">
                    {item.price}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-base">
                    {item.status === 'Held' ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-rewear-text">Held</p>
                        <p className="text-rewear-muted text-xs">
                          Editing locked
                        </p>
                      </div>
                    ) : (
                      <span className="font-semibold">{item.status}</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {item.isLocked ? (
                      <span className="text-rewear-muted cursor-not-allowed text-sm font-semibold">
                        Locked
                      </span>
                    ) : (
                      <Link
                        href={`/selling/new?id=${encodeURIComponent(item.id)}`}
                        className="text-rewear-text hover:underline text-sm font-semibold"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-rewear-muted">
                    No products found matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer: Figma 86:1647 */}
        <div className="border-rewear-border flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Items per page control */}
          <div className="flex items-center gap-2 text-sm text-rewear-muted">
            <span>Items per page</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="Items per page"
                className="border-rewear-border text-rewear-text appearance-none border px-3 py-1.5 pr-8 text-sm outline-none cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <ChevronDown
                size={14}
                className="text-rewear-muted pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="bg-rewear-soft text-rewear-text/40 h-10 px-4 text-sm font-normal disabled:cursor-not-allowed"
            >
              ‹ Previous
            </button>
            <button
              type="button"
              className="bg-rewear-accent text-rewear-text h-10 w-11 text-sm font-semibold"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="bg-rewear-soft text-rewear-text/40 h-10 px-4 text-sm font-normal disabled:cursor-not-allowed"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
