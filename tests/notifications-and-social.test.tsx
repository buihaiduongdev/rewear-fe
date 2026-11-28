import { RateShopDialog } from '@/modules/ratings/components/RateShopDialog';
import { ShopRatingSummary } from '@/modules/ratings/components/ShopRatingSummary';
import { ReportViolationDialog } from '@/modules/reports/components/ReportViolationDialog';
import { FollowShopButton } from '@/modules/shop-follows/components/FollowShopButton';
import { NotificationBell } from '@/shared/components/marketplace/NotificationBell';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pushMock, notifApi, ratingsApiMock, followApiMock, reportsApiMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    notifApi: {
      getUnreadCount: vi.fn(),
      list: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    },
    ratingsApiMock: {
      getShopRatings: vi.fn(),
      getMyRatings: vi.fn(),
      upsertRating: vi.fn(),
    },
    followApiMock: {
      getState: vi.fn(),
      follow: vi.fn(),
      unfollow: vi.fn(),
    },
    reportsApiMock: {
      create: vi.fn(),
    },
  }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'buyer-1', fullName: 'Minh', role: 'USER' } },
  }),
}));
vi.mock('@/shared/api/notifications-api', () => ({
  notificationsApi: notifApi,
}));
vi.mock('@/modules/ratings/ratings-api', () => ({
  ratingsApi: ratingsApiMock,
}));
vi.mock('@/modules/shop-follows/shop-follow-api', () => ({
  shopFollowApi: followApiMock,
}));
vi.mock('@/modules/reports/reports-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/modules/reports/reports-api')>();
  return {
    ...actual,
    reportsApi: reportsApiMock,
  };
});

function withQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('Notifications, Reviews, Follow & Report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notifApi.getUnreadCount.mockResolvedValue({ data: { count: 3 } });
    notifApi.list.mockResolvedValue({
      data: {
        data: [
          {
            id: 'notif-1',
            recipientId: 'buyer-1',
            type: 'ORDER_SHIPPED',
            title: 'Order shipped',
            body: 'Your order RW-1001 is on the way.',
            entityType: 'ORDER',
            entityId: 'order-1',
            isRead: false,
            createdAt: '2026-11-26T09:00:00.000Z',
            updatedAt: '2026-11-26T09:00:00.000Z',
          },
        ],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
      },
    });
    notifApi.markAsRead.mockResolvedValue({ data: { id: 'notif-1' } });
    notifApi.markAllAsRead.mockResolvedValue({ data: { updatedCount: 3 } });

    ratingsApiMock.getMyRatings.mockResolvedValue({ data: [] });
    ratingsApiMock.upsertRating.mockResolvedValue({
      data: { id: 'rat-1', orderId: 'order-1', stars: 4 },
    });
    ratingsApiMock.getShopRatings.mockResolvedValue({
      data: {
        summary: {
          mode: 'EVIDENCE',
          count: 2,
          average: 4.5,
          distribution: { '5': 1, '4': 1 },
          verifiedBuyerCount: 2,
        },
        ratings: [
          {
            id: 'rat-1',
            shopId: 'shop-1',
            stars: 5,
            comment: 'Great coat, exact measurements.',
            mediaIds: [],
            reply: 'Thank you!',
            revision: 1,
            updatedAt: '2026-11-25T10:00:00.000Z',
            mode: 'EVIDENCE',
            verifiedTransaction: true,
          },
        ],
      },
    });

    followApiMock.getState.mockResolvedValue({
      data: { shopId: 'shop-1', following: false, followedAt: null },
    });
    followApiMock.follow.mockResolvedValue({
      data: {
        shopId: 'shop-1',
        following: true,
        followedAt: '2026-11-26T09:00:00.000Z',
      },
    });
    followApiMock.unfollow.mockResolvedValue({
      data: { shopId: 'shop-1', following: false, followedAt: null },
    });

    reportsApiMock.create.mockResolvedValue({
      data: { id: 'rep-1', status: 'OPEN' },
    });
  });

  it('NotificationBell displays unread badge, opens list, marks all read, and marks item read', async () => {
    withQuery(<NotificationBell />);

    const bell = await screen.findByRole('button', {
      name: /Notifications \(3 unread\)/i,
    });
    fireEvent.click(bell);

    expect(await screen.findByText('Order shipped')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
    await waitFor(() => expect(notifApi.markAllAsRead).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: /Order shipped/i }));
    await waitFor(() =>
      expect(notifApi.markAsRead).toHaveBeenCalledWith('notif-1'),
    );
    expect(pushMock).toHaveBeenCalledWith('/orders/order-1');
  });

  it('RateShopDialog submits 1-5 star rating and comment for a completed order', async () => {
    withQuery(
      <RateShopDialog
        orderId="order-1"
        shopName="Hanoi Archive"
        enabled={true}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rate shop' }));
    fireEvent.click(await screen.findByRole('button', { name: '4 stars' }));
    fireEvent.change(screen.getByLabelText(/Review comment/i), {
      target: { value: 'Clean item and fast shipping' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit rating' }));

    await waitFor(() =>
      expect(ratingsApiMock.upsertRating).toHaveBeenCalledWith({
        orderId: 'order-1',
        stars: 4,
        comment: 'Clean item and fast shipping',
      }),
    );
  });

  it('ShopRatingSummary shows average rating and opens reviews modal', async () => {
    withQuery(<ShopRatingSummary shopId="shop-1" shopName="Hanoi Archive" />);

    const summaryBtn = await screen.findByRole('button', {
      name: /4\.5.*2 reviews/i,
    });
    fireEvent.click(summaryBtn);

    expect(
      await screen.findByText('Great coat, exact measurements.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Thank you!')).toBeInTheDocument();
  });

  it('FollowShopButton follows and unfollows a shop', async () => {
    withQuery(<FollowShopButton shopId="shop-1" shopName="Hanoi Archive" />);

    const btn = await screen.findByRole('button', { name: 'Follow shop' });
    await waitFor(() => expect(btn).not.toBeDisabled());
    fireEvent.click(btn);

    await waitFor(() =>
      expect(followApiMock.follow).toHaveBeenCalledWith('shop-1'),
    );
    expect(
      await screen.findByRole('button', { name: 'Following' }),
    ).toBeInTheDocument();
  });

  it('ReportViolationDialog submits a product or shop violation report', async () => {
    withQuery(<ReportViolationDialog productId="prod-1" shopId="shop-1" />);

    fireEvent.click(
      screen.getByRole('button', { name: /Report listing \/ shop/i }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'This shop' }));
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'COUNTERFEIT' },
    });
    fireEvent.change(screen.getByLabelText(/Details/i), {
      target: {
        value: 'Photos appear to show counterfeit tags and stitching.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() =>
      expect(reportsApiMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'SHOP',
          targetId: 'shop-1',
          reason: 'COUNTERFEIT',
          description: 'Photos appear to show counterfeit tags and stitching.',
          requestId: expect.any(String),
        }),
      ),
    );
  });
});
