export type FeedItemType = 'ebook' | 'video' | 'webinar' | 'product' | 'course';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  description?: string | null;
  url: string;
  categoryId?: string | null;
  productId?: string | null;
  date?: string;
  isLive?: boolean | null;
  rawUrl?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  external_purchase_url: string;
  image_url: string;
  category_id: string;
  created_at?: string;
}

export interface CatalogItem {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  category?: string;
  categoryId?: string;
  slug?: string;
  thumbnail_url?: string;
  image_url?: string;
  description?: string | null;
  url?: string;
  external_purchase_url?: string;
  created_at?: string;
  date?: string;
  isLive?: boolean | null;
}

export interface PlatformNotification {
  id: string;
  message: string;
  link?: string | null;
  created_at?: string;
}
