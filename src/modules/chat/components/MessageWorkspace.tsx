'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import {
  chatApi,
  type ChatConversation,
  type ChatSide,
} from '@/modules/chat/chat-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { formatPrice } from '@/shared/utils/product';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Package, ReceiptText, Send, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function MessageWorkspace({
  side,
  shopId,
  initialShopId,
  initialProductId,
  initialOrderId,
}: {
  side: ChatSide;
  shopId?: string;
  initialShopId?: string;
  initialProductId?: string;
  initialOrderId?: string;
}) {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string>();
  const [text, setText] = useState('');
  const [dismissedProduct, setDismissedProduct] = useState(false);
  const [dismissedOrder, setDismissedOrder] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const openedShopRef = useRef<string | null>(null);

  const productContextQuery = useQuery({
    queryKey: ['chat', 'context-product', initialProductId],
    queryFn: () => chatApi.getProductContext(initialProductId!),
    enabled: enabled && Boolean(initialProductId) && !dismissedProduct,
  });

  const orderContextQuery = useQuery({
    queryKey: ['chat', 'context-order', initialOrderId],
    queryFn: () => chatApi.getOrderContext(initialOrderId!),
    enabled: enabled && Boolean(initialOrderId) && !dismissedOrder,
  });

  const conversationsQuery = useInfiniteQuery({
    queryKey: ['chat', 'conversations', session?.user.id],
    queryFn: ({ pageParam }) => chatApi.listConversations(pageParam, 50),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.items.length, 0);
      return loaded < lastPage.data.total ? loaded : undefined;
    },
    enabled,
    refetchInterval: 10_000,
  });

  const openMutation = useMutation({
    mutationFn: (targetShopId: string) =>
      chatApi.openConversation(targetShopId),
    onSuccess: (response) => {
      setSelectedId(response.data.id);
      void queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations'],
      });
    },
  });

  useEffect(() => {
    if (
      enabled &&
      side === 'BUYER' &&
      initialShopId &&
      openedShopRef.current !== initialShopId
    ) {
      openedShopRef.current = initialShopId;
      openMutation.mutate(initialShopId);
    }
  }, [enabled, side, initialShopId]); // eslint-disable-line react-hooks/exhaustive-deps

  const conversations = useMemo(() => {
    const all =
      conversationsQuery.data?.pages.flatMap((page) => page.data.items) ?? [];
    return all.filter(
      (item) => item.side === side && (!shopId || item.shopId === shopId),
    );
  }, [conversationsQuery.data, side, shopId]);

  const activeConversation: ChatConversation | undefined = conversations.find(
    (c) => c.id === selectedId,
  );

  const messagesQuery = useInfiniteQuery({
    queryKey: ['chat', 'messages', session?.user.id, selectedId],
    queryFn: ({ pageParam }) =>
      chatApi.listMessages(selectedId!, pageParam, 50),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.items.length, 0);
      return loaded < lastPage.data.total ? loaded : undefined;
    },
    enabled: enabled && Boolean(selectedId),
    refetchInterval: 5_000,
  });

  const messages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? [];
    return [...pages].reverse().flatMap((p) => p.data.items);
  }, [messagesQuery.data]);

  const latestMessageId = messages.at(-1)?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [selectedId, latestMessageId]);

  useEffect(() => {
    if (
      !selectedId ||
      !activeConversation ||
      activeConversation.unreadCount <= 0
    ) {
      return;
    }
    void chatApi
      .markRead(selectedId)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
      )
      .catch(() => {});
  }, [selectedId, activeConversation?.unreadCount, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMutation = useMutation({
    mutationFn: (payload: { conversationId: string; text: string }) =>
      chatApi.sendMessage(payload.conversationId, { text: payload.text }),
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
  });

  if (status === 'loading') {
    return (
      <p role="status" className="text-rewear-muted text-sm">
        Loading messages…
      </p>
    );
  }

  if (!enabled) {
    const callbackUrl =
      side === 'SHOP'
        ? '/selling?tab=messages'
        : initialShopId
          ? `/messages?shopId=${encodeURIComponent(initialShopId)}`
          : '/messages';
    return (
      <p className="text-sm">
        Please{' '}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="underline"
        >
          sign in
        </Link>{' '}
        to view messages.
      </p>
    );
  }

  const canSend =
    Boolean(selectedId) && !sendMutation.isPending && Boolean(text.trim());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!canSend || !selectedId || !trimmed) return;
    sendMutation.mutate({ conversationId: selectedId, text: trimmed });
  };

  const productContext = !dismissedProduct
    ? productContextQuery.data?.data
    : undefined;
  const orderContext = !dismissedOrder
    ? orderContextQuery.data?.data
    : undefined;

  return (
    <section className="space-y-6">
      <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">
        Messages
      </h1>

      <div className="border-rewear-border grid min-h-[560px] border bg-white md:grid-cols-[288px_1fr]">
        <aside className="border-rewear-border flex flex-col border-b p-4 md:border-r md:border-b-0">
          <h2 className="mb-3 text-sm font-semibold">Conversations</h2>
          {conversationsQuery.isPending ? (
            <p className="text-rewear-muted text-sm">Loading…</p>
          ) : conversationsQuery.isError ? (
            <button
              type="button"
              onClick={() => void conversationsQuery.refetch()}
              className="text-left text-sm underline"
            >
              Could not load conversations. Retry
            </button>
          ) : conversations.length === 0 ? (
            <p className="text-rewear-muted text-sm">No conversations yet.</p>
          ) : (
            <ul className="divide-rewear-border divide-y">
              {conversations.map((item) => {
                const isSelected = selectedId === item.id;
                const title = side === 'BUYER' ? item.shopName : item.buyerName;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={sendMutation.isPending}
                      onClick={() => setSelectedId(item.id)}
                      className={`flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm transition ${
                        isSelected
                          ? 'bg-rewear-soft font-semibold'
                          : 'hover:bg-rewear-soft/60'
                      }`}
                    >
                      <span className="truncate">{title}</span>
                      {item.unreadCount > 0 && (
                        <span
                          aria-label={`${item.unreadCount} unread`}
                          className="bg-rewear-accent text-rewear-text shrink-0 px-2 py-0.5 font-mono text-xs font-bold"
                        >
                          {item.unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {conversationsQuery.hasNextPage && (
            <button
              type="button"
              className="mt-3 text-left text-xs font-semibold underline"
              disabled={conversationsQuery.isFetchingNextPage}
              onClick={() => void conversationsQuery.fetchNextPage()}
            >
              Load more conversations
            </button>
          )}
        </aside>

        <div className="flex min-h-[560px] flex-col p-5">
          {!selectedId ? (
            <p className="text-rewear-muted m-auto text-sm">
              Select a conversation to start messaging.
            </p>
          ) : (
            <>
              <div className="border-rewear-border flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-semibold">
                  {activeConversation
                    ? side === 'BUYER'
                      ? activeConversation.shopName
                      : activeConversation.buyerName
                    : 'Conversation'}
                </h2>
                {activeConversation && side === 'BUYER' && (
                  <Link
                    href={`/shops/${encodeURIComponent(activeConversation.shopId)}`}
                    className="text-rewear-muted hover:text-rewear-text text-xs font-semibold underline underline-offset-4"
                  >
                    Visit shop
                  </Link>
                )}
              </div>

              {(productContext || orderContext) && (
                <div className="border-rewear-border bg-rewear-soft mt-3 space-y-2 border p-3">
                  {productContext && (
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/products/${productContext.id}`}
                        className="flex min-w-0 items-center gap-2 text-xs hover:underline"
                      >
                        <Package size={14} aria-hidden="true" />
                        <span className="truncate font-semibold">
                          {productContext.title}
                        </span>
                        <span className="font-mono tabular-nums">
                          {formatPrice(productContext.price)}
                        </span>
                      </Link>
                      <button
                        type="button"
                        aria-label="Dismiss product context"
                        onClick={() => setDismissedProduct(true)}
                        className="text-rewear-muted hover:text-rewear-text p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {orderContext && (
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/orders/${orderContext.id}`}
                        className="flex min-w-0 items-center gap-2 text-xs hover:underline"
                      >
                        <ReceiptText size={14} aria-hidden="true" />
                        <span className="font-mono font-semibold">
                          Order {orderContext.orderCode}
                        </span>
                        <span className="font-mono tabular-nums">
                          {formatPrice(orderContext.total)}
                        </span>
                      </Link>
                      <button
                        type="button"
                        aria-label="Dismiss order context"
                        onClick={() => setDismissedOrder(true)}
                        className="text-rewear-muted hover:text-rewear-text p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div
                className="flex-1 space-y-4 overflow-y-auto py-5"
                aria-live="polite"
              >
                {messagesQuery.hasNextPage && (
                  <button
                    type="button"
                    disabled={messagesQuery.isFetchingNextPage}
                    onClick={() => void messagesQuery.fetchNextPage()}
                    className="text-xs font-semibold underline"
                  >
                    Load earlier messages
                  </button>
                )}
                {messagesQuery.isPending && (
                  <p className="text-rewear-muted text-sm">Loading messages…</p>
                )}
                {messagesQuery.isError && (
                  <button
                    type="button"
                    onClick={() => void messagesQuery.refetch()}
                    className="text-sm underline"
                  >
                    Could not load messages. Retry
                  </button>
                )}

                {messages.map((message) => {
                  const isMine = message.senderId === session?.user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] space-y-2 p-4 ${
                          isMine
                            ? 'bg-rewear-text text-white'
                            : 'bg-rewear-soft text-rewear-text'
                        }`}
                      >
                        {message.text && (
                          <p className="text-sm leading-6 break-words whitespace-pre-wrap">
                            {message.text}
                          </p>
                        )}

                        {message.media.length > 0 && (
                          <p className="text-xs opacity-75">
                            {message.media.length} image{' '}
                            {message.media.length === 1
                              ? 'attachment'
                              : 'attachments'}
                          </p>
                        )}

                        <time className="block text-[11px] opacity-70">
                          {new Date(message.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-rewear-border border-t pt-4"
              >
                <div className="flex gap-3">
                  <label className="sr-only" htmlFor="message-text">
                    Message
                  </label>
                  <input
                    id="message-text"
                    disabled={sendMutation.isPending}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={4000}
                    placeholder="Write a message…"
                    className="bg-rewear-soft min-h-12 flex-1 px-4 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="bg-rewear-text inline-flex min-h-12 items-center gap-2 px-5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Send size={15} aria-hidden="true" />
                    Send
                  </button>
                </div>
              </form>

              {sendMutation.isError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {getApiErrorMessage(sendMutation.error)}
                </p>
              )}
            </>
          )}

          {openMutation.isError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              Could not open this conversation.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
