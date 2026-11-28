import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type ChatSide = 'BUYER' | 'SHOP';

export type ChatConversation = {
  id: string;
  buyerId: string;
  buyerName: string;
  shopId: string;
  shopName: string;
  side: ChatSide;
  unreadCount: number;
  lastMessageAt: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  media: { id: string; mimeType: string; sizeBytes: number }[];
  createdAt: string;
};

export type ChatPage<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type SendChatPayload = {
  text?: string;
  mediaIds?: string[];
};

export type ChatProductContext = {
  id: string;
  title: string;
  price: number | null;
  status: string;
};

export type ChatOrderContext = {
  id: string;
  orderCode: string;
  status: string;
  total: number;
};

export const chatApi = {
  listConversations: (offset = 0, limit = 50) =>
    axiosClient.get<never, Envelope<ChatPage<ChatConversation>>>(
      '/chat/conversations',
      { params: { limit, offset } },
    ),
  openConversation: (shopId: string) =>
    axiosClient.post<never, Envelope<ChatConversation>>('/chat/conversations', {
      shopId,
    }),
  listMessages: (conversationId: string, offset = 0, limit = 50) =>
    axiosClient.get<never, Envelope<ChatPage<ChatMessage>>>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { limit, offset } },
    ),
  sendMessage: (conversationId: string, payload: SendChatPayload) =>
    axiosClient.post<never, Envelope<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
      payload,
    ),
  markRead: (conversationId: string) =>
    axiosClient.post<never, Envelope<ChatConversation>>(
      `/chat/conversations/${conversationId}/read`,
      {},
    ),
  getProductContext: (productId: string) =>
    axiosClient.get<never, Envelope<ChatProductContext>>(
      `/products/${encodeURIComponent(productId)}`,
    ),
  getOrderContext: (orderId: string) =>
    axiosClient.get<never, Envelope<ChatOrderContext>>(
      `/orders/${encodeURIComponent(orderId)}`,
    ),
};
