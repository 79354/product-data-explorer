import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'product-explorer-session';
const HISTORY_KEY = 'browse-history';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

export interface HistoryEntry {
  path: string;
  data: Record<string, any>;
  timestamp: string;
}

export function saveToHistory(path: string, data: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  const entry: HistoryEntry = {
    path,
    data,
    timestamp: new Date().toISOString(),
  };
  
  history.push(entry);
  
  // Keep only last 50 items
  const trimmedHistory = history.slice(-50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Failed to parse history:', error);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function getRecentHistory(limit = 10): HistoryEntry[] {
  const history = getHistory();
  return history.slice(-limit).reverse();
}

// Helper to track page views
export function trackPageView(path: string, additionalData: Record<string, any> = {}): void {
  saveToHistory(path, {
    type: 'page_view',
    url: path,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}
