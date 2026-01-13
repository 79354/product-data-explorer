import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null, currency = 'GBP') {
  if (price === null) return 'N/A';
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(date: string | null) {
  if (!date) return 'N/A';
  
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// src/lib/session.ts
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'product-explorer-session';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function saveToHistory(path: string, data: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  history.push({
    path,
    data,
    timestamp: new Date().toISOString(),
  });
  
  // Keep only last 50 items
  const trimmedHistory = history.slice(-50);
  localStorage.setItem('browse-history', JSON.stringify(trimmedHistory));
}

export function getHistory() {
  if (typeof window === 'undefined') return [];
  
  const historyStr = localStorage.getItem('browse-history');
  return historyStr ? JSON.parse(historyStr) : [];
}
