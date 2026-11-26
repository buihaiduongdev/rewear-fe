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
    listShopProducts: vi.fn(),
    listBuyerOrders: vi.fn(),
    listShopOrders: vi.fn(),
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

function renderChat() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MessageWorkspace side="BUYER" />
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
    api.listMessages.mockResolvedValue({
      data: {
        items: [
          {
            id: 'msg-1',
            conversationId: 'thread-1',
            senderId: 'seller-1',
            text: 'Here is your piece and order reference.',
            media: [],
            product: {
              id: 'prod-1',
              title: 'Lemaire wool coat',
              price: 580000,
              status: 'ACTIVE',
            },
            orderId: 'order-1',
            order: {
              id: 'order-1',
              orderCode: 'RW-009911',
              status: 'shipping',
              total: 610000,
              itemCount: 1,
            },
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
    api.listShopProducts.mockResolvedValue({
      data: {
        data: [
          {
            id: 'prod-2',
            title: 'Vintage linen shirt',
            price: 320000,
            status: 'ACTIVE',
          },
        ],
      },
    });
    api.listBuyerOrders.mockResolvedValue({
      data: [
        {
          id: 'order-2',
          orderCode: 'RW-009922',
          status: 'delivered',
          total: 420000,
          shopId: 'shop-1',
        },
      ],
    });
  });

  it('renders product and order cards, marks unread conversation read, and sends an attached order card', async () => {
    renderChat();

    expect(await screen.findByLabelText('2 unread')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Hanoi Archive/i }));

    expect(await screen.findByText('Lemaire wool coat')).toBeInTheDocument();
    expect(screen.getByText('Order RW-009911')).toBeInTheDocument();
    await waitFor(() => expect(api.markRead).toHaveBeenCalledWith('thread-1'));

    // Attach order card
    fireEvent.click(screen.getByRole('button', { name: 'Attach order' }));
    fireEvent.click(
      await screen.findByRole('button', { name: /Order RW-009922/i }),
    );

    const input = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'Checking on delivery' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(api.sendMessage).toHaveBeenCalledWith('thread-1', {
        text: 'Checking on delivery',
        orderId: 'order-2',
      }),
    );
  });

  it('attaches and sends a product card from the shop', async () => {
    renderChat();

    fireEvent.click(
      await screen.findByRole('button', { name: /Hanoi Archive/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Attach product' }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /Vintage linen shirt/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(api.sendMessage).toHaveBeenCalledWith('thread-1', {
        productId: 'prod-2',
      }),
    );
  });
});
