import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type NotificationItem = {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedNotifications = {
  data: NotificationItem[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
};

export const notificationsApi = {
  list: (page = 1, limit = 10) =>
    axiosClient.get<never, Envelope<PaginatedNotifications>>('/notifications', {
      params: { page, limit },
    }),
  getUnreadCount: () =>
    axiosClient.get<never, Envelope<{ count: number }>>(
      '/notifications/unread-count',
    ),
  markAsRead: (id: string) =>
    axiosClient.patch<never, Envelope<NotificationItem>>(
      `/notifications/${id}/read`,
    ),
  markAllAsRead: () =>
    axiosClient.patch<never, Envelope<{ updatedCount: number }>>(
      '/notifications/read-all',
    ),
};
