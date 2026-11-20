'use client';

import type { ReactNode } from 'react';

import { create } from 'zustand';

export type TToastType = 'success' | 'error' | 'info';

export type TToast = {
  id: string;
  createdAt: number;
  title: string;
  description?: string;
  durationMs: number;
  type: TToastType;
  meta?: string;
  thumbnail?: ReactNode;
  href?: string;
  actionLabel?: string;
  onAction?: () => void;
};

type TToastStore = {
  toasts: TToast[];
  addToast: (toast: Omit<TToast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
};

let nextToastId = 0;

export const useToastStore = create<TToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const duplicate = useToastStore
      .getState()
      .toasts.some(
        (current) =>
          current.type === toast.type &&
          current.title === toast.title &&
          current.description === toast.description,
      );

    if (duplicate) return '';

    const id = `toast-${++nextToastId}`;

    set((state) => ({
      toasts: [...state.toasts, { id, createdAt: Date.now(), ...toast }],
    }));

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
