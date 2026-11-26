'use client';

import { AdminProductModerationPage } from '@/features/admin/components/AdminProductModerationPage';
import { AdminWorkspaceLayout } from '@/features/admin/components/AdminWorkspaceLayout';

export default function AdminProductsRoutePage() {
  return (
    <AdminWorkspaceLayout activeNav="products">
      <AdminProductModerationPage />
    </AdminWorkspaceLayout>
  );
}
