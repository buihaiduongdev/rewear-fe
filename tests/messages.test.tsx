import { MessageWorkspace } from '@/modules/chat/components/MessageWorkspace';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: {
    listConversations: vi.fn(),
    openConversation: vi.fn(),
    listMessages: vi.fn(),
    sendMessage: vi.fn(),
    markRead: vi.fn(),
    getProductContext: vi.fn(),
    getOrderContext: vi.fn(),
  },
}));

vi.mock('@/modules/chat/chat-api', () => ({ chatApi: api }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'buyer-1' } },
  }),
}));

const conversation = {
  id: 'thread-1',
  buyerId: 'buyer-1',
  buyerName: 'Buyer One',
  shopId: 'shop-1',
  shopName: 'Hanoi Archive',
  side: 'BUYER' as const,
  unreadCount: 2,
  lastMessageAt: '2026-11-25T10:00:00.000Z',
};

function renderChat(props?: {
  initialShopId?: string;
  initialProductId?: string;
  initialOrderId?: string;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MessageWorkspace side="BUYER" {...props} />
    </QueryClientProvider>,
  );
}

describe('MessageWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    api.listConversations.mockResolvedValue({
      data: { items: [conversation], total: 1, limit: 50, offset: 0 },
    });
    api.openConversation.mockResolvedValue({ data: conversation });
    api.listMessages.mockResolvedValue({
      data: {
        items: [
          {
            id: 'msg-1',
            conversationId: 'thread-1',
            senderId: 'seller-1',
            text: 'Hello, this item is available.',
            media: [],
            createdAt: '2026-11-25T10:00:00.000Z',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      },
    });
    api.markRead.mockResolvedValue({
      data: { ...conversation, unreadCount: 0 },
    });
    api.sendMessage.mockResolvedValue({ data: { id: 'msg-2' } });
    api.getProductContext.mockResolvedValue({
      data: {
        id: 'prod-1',
        title: 'Lemaire wool coat',
        price: 580000,
        status: 'ACTIVE',
      },
    });
    api.getOrderContext.mockResolvedValue({
      data: {
        id: 'order-1',
        orderCode: 'RW-009911',
        status: 'shipping',
        total: 610000,
      },
    });
  });

  it('marks unread conversation read and sends text-only messages', async () => {
    renderChat();

    expect(await screen.findByLabelText('2 unread')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Hanoi Archive/i }));

    expect(
      await screen.findByText('Hello, this item is available.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(api.markRead).toHaveBeenCalledWith('thread-1'));

    const input = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'Checking on delivery' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(api.sendMessage).toHaveBeenCalledWith('thread-1', {
        text: 'Checking on delivery',
      }),
    );
  });

  it('loads product and order context from query params via separate APIs', async () => {
    renderChat({
      initialShopId: 'shop-1',
      initialProductId: 'prod-1',
      initialOrderId: 'order-1',
    });

    expect(await screen.findByText('Lemaire wool coat')).toBeInTheDocument();
    expect(await screen.findByText('Order RW-009911')).toBeInTheDocument();
    expect(api.getProductContext).toHaveBeenCalledWith('prod-1');
    expect(api.getOrderContext).toHaveBeenCalledWith('order-1');
  });
});
