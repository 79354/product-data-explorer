import axios from 'axios';
import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// Navigation hooks
export function useNavigation() {
  const { data, error, isLoading, mutate } = useSWR('/navigation', fetcher);
  return {
    navigation: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useNavigationBySlug(slug: string | null) {
  const { data, error, isLoading } = useSWR(
    slug ? `/navigation/${slug}` : null,
    fetcher
  );
  return {
    navigation: data,
    isLoading,
    isError: error,
  };
}

// Category hooks
export function useCategories(page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/categories?page=${page}&limit=${limit}`,
    fetcher
  );
  return {
    categories: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategoryBySlug(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `/categories/${slug}` : null,
    fetcher
  );
  return {
    category: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Product hooks
export function useProducts(page = 1, limit = 20, categoryId?: string) {
  const url = categoryId
    ? `/products?page=${page}&limit=${limit}&categoryId=${categoryId}`
    : `/products?page=${page}&limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    products: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/products/${id}` : null,
    fetcher
  );
  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// History hooks
export function useHistory(sessionId: string) {
  const { data, error, isLoading } = useSWR(
    `/history?sessionId=${sessionId}`,
    fetcher
  );
  return {
    history: data || [],
    isLoading,
    isError: error,
  };
}

// API actions
export const scrapeNavigation = async (force = false) => {
  return apiClient.post('/navigation/scrape', null, { params: { force } });
};

export const scrapeCategory = async (slug: string, force = false) => {
  return apiClient.post(`/categories/${slug}/scrape`, null, { params: { force } });
};

export const scrapeProduct = async (id: string, force = false) => {
  return apiClient.post(`/products/${id}/scrape`, null, { params: { force } });
};

export const saveHistory = async (data: {
  sessionId: string;
  userId?: string;
  pathJson: Record<string, any>;
}) => {
  return apiClient.post('/history', data);
};

// src/types/index.ts
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
