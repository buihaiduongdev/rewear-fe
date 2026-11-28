'use client';

import { useMemo } from 'react';

import {
  chatApi,
  type ChatConversation,
  type ChatOrderOption,
  type ChatSide,
  type ShopProductOption,
} from '@/modules/chat/chat-api';
import { formatPrice } from '@/shared/utils/product';
import { useQuery } from '@tanstack/react-query';
import { Package, ReceiptText, X } from 'lucide-react';

export type ChatAttachment =
  | { kind: 'PRODUCT'; id: string; label: string; meta?: string }
  | { kind: 'ORDER'; id: string; label: string; meta?: string };

export function ChatAttachmentBar({
  side,
  enabled,
  userId,
  activeShopId,
  activeConversation,
  picker,
  setPicker,
  attachment,
  onSelectAttachment,
}: {
  side: ChatSide;
  enabled: boolean;
  userId?: string;
  activeShopId?: string;
  activeConversation?: ChatConversation;
  picker: 'PRODUCT' | 'ORDER' | null;
  setPicker: (next: 'PRODUCT' | 'ORDER' | null) => void;
  attachment: ChatAttachment | null;
  onSelectAttachment: (item: ChatAttachment | null) => void;
}) {
  const shopProductsQuery = useQuery({
    queryKey: ['chat', 'shop-products', activeShopId],
    queryFn: () => chatApi.listShopProducts(activeShopId!),
    enabled: Boolean(enabled && picker === 'PRODUCT' && activeShopId),
  });

  const ordersQuery = useQuery({
    queryKey: ['chat', 'orders', side, activeShopId, userId],
    queryFn: () =>
      side === 'BUYER'
        ? chatApi.listBuyerOrders()
        : chatApi.listShopOrders(activeShopId!),
    enabled: Boolean(enabled && picker === 'ORDER' && activeShopId),
  });

  const orderOptions = useMemo<ChatOrderOption[]>(() => {
    const raw = ordersQuery.data?.data ?? [];
    if (!activeConversation) return raw;
    return raw.filter((order) => {
      if (side === 'BUYER' && order.shopId) {
        return order.shopId === activeConversation.shopId;
      }
      if (side === 'SHOP' && order.buyerId) {
        return order.buyerId === activeConversation.buyerId;
      }
      return true;
    });
  }, [ordersQuery.data, activeConversation, side]);

  return (
    <>
      {picker === 'PRODUCT' && (
        <div className="border-rewear-border bg-rewear-soft mb-3 max-h-48 space-y-2 overflow-y-auto border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">
              Attach a product from this shop
            </span>
            <button
              type="button"
              onClick={() => setPicker(null)}
              className="text-rewear-muted hover:text-rewear-text text-xs"
            >
              Close ×
            </button>
          </div>
          {shopProductsQuery.isPending ? (
            <p className="text-rewear-muted text-xs">Loading shop listings…</p>
          ) : (shopProductsQuery.data?.data.data ?? []).length === 0 ? (
            <p className="text-rewear-muted text-xs">
              No listings found for this shop.
            </p>
          ) : (
            <ul className="space-y-1">
              {(shopProductsQuery.data?.data.data ?? []).map(
                (prod: ShopProductOption) => (
                  <li key={prod.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAttachment({
                          kind: 'PRODUCT',
                          id: prod.id,
                          label: prod.title,
                          meta: formatPrice(prod.price),
                        });
                        setPicker(null);
                      }}
                      className="hover:bg-rewear-surface flex w-full items-center justify-between px-2.5 py-2 text-left text-xs"
                    >
                      <span className="truncate font-medium">{prod.title}</span>
                      <span className="ml-2 shrink-0 font-mono font-semibold">
                        {formatPrice(prod.price)}
                      </span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      )}

      {picker === 'ORDER' && (
        <div className="border-rewear-border bg-rewear-soft mb-3 max-h-48 space-y-2 overflow-y-auto border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Attach an order</span>
            <button
              type="button"
              onClick={() => setPicker(null)}
              className="text-rewear-muted hover:text-rewear-text text-xs"
            >
              Close ×
            </button>
          </div>
          {ordersQuery.isPending ? (
            <p className="text-rewear-muted text-xs">Loading orders…</p>
          ) : orderOptions.length === 0 ? (
            <p className="text-rewear-muted text-xs">
              No orders found for this conversation.
            </p>
          ) : (
            <ul className="space-y-1">
              {orderOptions.map((ord) => (
                <li key={ord.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAttachment({
                        kind: 'ORDER',
                        id: ord.id,
                        label: `Order ${ord.orderCode}`,
                        meta: `${formatPrice(ord.total)} · ${ord.status}`,
                      });
                      setPicker(null);
                    }}
                    className="hover:bg-rewear-surface flex w-full items-center justify-between px-2.5 py-2 text-left text-xs"
                  >
                    <span className="font-mono font-semibold">
                      Order {ord.orderCode}
                    </span>
                    <span className="text-rewear-muted ml-2 shrink-0 font-mono">
                      {formatPrice(ord.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {attachment && (
        <div className="border-rewear-border bg-rewear-soft mb-3 flex items-center justify-between gap-3 border px-3 py-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            {attachment.kind === 'PRODUCT' ? (
              <Package size={14} aria-hidden="true" />
            ) : (
              <ReceiptText size={14} aria-hidden="true" />
            )}
            <span className="truncate font-semibold">{attachment.label}</span>
            {attachment.meta && (
              <span className="text-rewear-muted font-mono">
                · {attachment.meta}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => onSelectAttachment(null)}
            className="text-rewear-muted hover:text-rewear-text p-1"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
