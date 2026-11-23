export interface SellerProductItem {
  id: string;
  title: string;
  size: string;
  condition: string;
  price: string;
  status:
    | 'Active'
    | 'Held'
    | 'In review'
    | 'Draft'
    | 'Rejected'
    | 'Suspended'
    | 'Sold'
    | 'Hidden';
  isLocked?: boolean;
  image: string | null;
}

export type SellerNavKey =
  | 'overview'
  | 'products'
  | 'orders'
  | 'returns'
  | 'funds'
  | 'settings'
  | 'messages';
