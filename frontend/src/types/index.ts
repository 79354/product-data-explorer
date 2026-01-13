export interface Navigation {
    id: string;
    title: string;
    slug: string;
    url: string;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
    categories?: Category[];
  }
  
  export interface Category {
    id: string;
    navigationId: string | null;
    parentId: string | null;
    title: string;
    slug: string;
    url: string;
    productCount: number;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
    navigation?: Navigation;
    parent?: Category;
    children?: Category[];
    products?: Product[];
  }
  
  export interface Product {
    id: string;
    sourceId: string;
    categoryId: string | null;
    title: string;
    author: string | null;
    price: number | null;
    currency: string;
    imageUrl: string | null;
    sourceUrl: string;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
    category?: Category;
    detail?: ProductDetail;
    reviews?: Review[];
  }
  
  export interface ProductDetail {
    id: string;
    productId: string;
    description: string | null;
    specs: Record<string, any> | null;
    ratingsAvg: number | null;
    reviewsCount: number;
    recommendations: string[] | null;
  }
  
  export interface Review {
    id: string;
    productId: string;
    author: string | null;
    rating: number | null;
    text: string | null;
    reviewDate: string | null;
    createdAt: string;
  }
  
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    meta?: PaginationMeta;
  }
  
  export interface ScrapeJob {
    id: string;
    targetUrl: string;
    targetType: 'navigation' | 'category' | 'product_list' | 'product_detail';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt: string | null;
    finishedAt: string | null;
    errorLog: string | null;
    metadata: Record<string, any> | null;
    createdAt: string;
  }
  
  export interface ViewHistory {
    id: string;
    userId: string | null;
    sessionId: string;
    pathJson: Record<string, any>;
    createdAt: string;
  }
  
  
