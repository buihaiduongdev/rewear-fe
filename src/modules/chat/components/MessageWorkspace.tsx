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
  useQueryClient,
} from '@tanstack/react-query';
import { Package, ReceiptText, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { type ChatAttachment, ChatAttachmentBar } from './ChatAttachmentBar';

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
  const [attachment, setAttachment] = useState<ChatAttachment | null>(() => {
    if (initialProductId) {
      return {
        kind: 'PRODUCT',
        id: initialProductId,
        label: `Product ${initialProductId.slice(0, 8)}`,
      };
    }
    if (initialOrderId) {
      return {
        kind: 'ORDER',
        id: initialOrderId,
        label: `Order ${initialOrderId.slice(0, 8)}`,
      };
    }
    return null;
  });
  const [picker, setPicker] = useState<'PRODUCT' | 'ORDER' | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const openedShopRef = useRef<string | null>(null);

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
    mutationFn: (payload: {
      conversationId: string;
      text?: string;
      productId?: string;
      orderId?: string;
    }) =>
      chatApi.sendMessage(payload.conversationId, {
        ...(payload.text ? { text: payload.text } : {}),
        ...(payload.productId ? { productId: payload.productId } : {}),
        ...(payload.orderId ? { orderId: payload.orderId } : {}),
      }),
    onSuccess: () => {
      setText('');
      setAttachment(null);
      setPicker(null);
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
    Boolean(selectedId) &&
    !sendMutation.isPending &&
    (Boolean(text.trim()) || Boolean(attachment));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend || !selectedId) return;
    sendMutation.mutate({
      conversationId: selectedId,
      text: text.trim() || undefined,
      productId: attachment?.kind === 'PRODUCT' ? attachment.id : undefined,
      orderId: attachment?.kind === 'ORDER' ? attachment.id : undefined,
    });
  };

  return (
    <section className="space-y-6">
      <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">
        Messages
      </h1>

      <div className="border-rewear-border grid min-h-[560px] border bg-white md:grid-cols-[288px_1fr]">
        {/* Left thread list */}
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
                      onClick={() => {
                        setSelectedId(item.id);
                        setPicker(null);
                      }}
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

        {/* Right active thread */}
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
                    href={`/products?shopId=${encodeURIComponent(activeConversation.shopId)}`}
                    className="text-rewear-muted hover:text-rewear-text text-xs font-semibold underline underline-offset-4"
                  >
                    Visit shop
                  </Link>
                )}
              </div>

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
                  const cardClass = isMine
                    ? 'border-white/20 bg-white/10 hover:bg-white/15'
                    : 'border-rewear-border bg-white hover:bg-rewear-soft/40';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] space-y-2.5 p-4 ${
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

                        {message.product && (
                          <Link
                            href={`/products/${message.product.id}`}
                            className={`block border p-3 text-left transition ${cardClass}`}
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
                              <Package size={14} aria-hidden="true" />
                              <span>Product card</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold">
                              {message.product.title}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-4 text-xs">
                              <span className="font-mono font-semibold tabular-nums">
                                {formatPrice(message.product.price)}
                              </span>
                              <span className="uppercase opacity-80">
                                {message.product.status}
                              </span>
                            </div>
                          </Link>
                        )}

                        {message.order && (
                          <Link
                            href={
                              side === 'BUYER'
                                ? `/orders/${message.order.id}`
                                : '/selling?tab=orders'
                            }
                            className={`block border p-3 text-left transition ${cardClass}`}
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
                              <ReceiptText size={14} aria-hidden="true" />
                              <span>Order card</span>
                            </div>
                            <p className="mt-1 font-mono text-sm font-semibold">
                              Order {message.order.orderCode}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-4 text-xs">
                              <span className="font-mono font-semibold tabular-nums">
                                {formatPrice(message.order.total)} ·{' '}
                                {message.order.itemCount}{' '}
                                {message.order.itemCount === 1
                                  ? 'item'
                                  : 'items'}
                              </span>
                              <span className="uppercase opacity-80">
                                {message.order.status}
                              </span>
                            </div>
                          </Link>
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

              <ChatAttachmentBar
                side={side}
                enabled={enabled}
                userId={session?.user.id}
                activeShopId={activeConversation?.shopId ?? shopId}
                activeConversation={activeConversation}
                picker={picker}
                setPicker={setPicker}
                attachment={attachment}
                onSelectAttachment={setAttachment}
              />

              <form
                onSubmit={handleSubmit}
                className="border-rewear-border space-y-3 border-t pt-4"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPicker((curr) =>
                        curr === 'PRODUCT' ? null : 'PRODUCT',
                      )
                    }
                    className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-9 items-center gap-1.5 border px-3 text-xs font-semibold"
                  >
                    <Package size={14} aria-hidden="true" />
                    Attach product
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPicker((curr) => (curr === 'ORDER' ? null : 'ORDER'))
                    }
                    className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-9 items-center gap-1.5 border px-3 text-xs font-semibold"
                  >
                    <ReceiptText size={14} aria-hidden="true" />
                    Attach order
                  </button>
                </div>

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
