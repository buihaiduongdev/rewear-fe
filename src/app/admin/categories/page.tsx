'use client';

import { AdminCategoriesPage } from '@/features/admin/components/AdminCategoriesPage';
import { AdminWorkspaceLayout } from '@/features/admin/components/AdminWorkspaceLayout';

export default function AdminCategoriesRoutePage() {
  return (
    <AdminWorkspaceLayout activeNav="categories">
      <AdminCategoriesPage />
    </AdminWorkspaceLayout>
  );
}
