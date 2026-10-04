'use client';

import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
import {
  CustomerBalancesResponse,
  CustomerHistoryResponse,
  InventoryResponse,
  WeeklySummaryResponse,
} from '@/types/hisabb';
import {
  EnrichedCustomer,
  MOCK_CUSTOMERS,
  MOCK_INVENTORY,
  MOCK_WEEKLY_SUMMARY,
  MOCK_CUSTOMER_HISTORIES,
} from '@/mock/data';

export const SWR_KEYS = {
  balances: '/api/customers/balances',
  history: (id: number) => `/api/customers/${id}/history`,
  inventory: '/api/inventory',
  weekly: '/api/summary/weekly',
};

const AVATAR_PALETTES = [
  { bg: 'bg-red-100', text: 'text-red-700' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-stone-200', text: 'text-stone-700' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
];

function getCustomerAvatarPalette(id: number, name: string) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('sharma')) return { bg: 'bg-red-100', text: 'text-red-700' };
  if (lower.includes('anita')) return { bg: 'bg-amber-100', text: 'text-amber-800' };
  if (lower.includes('raju')) return { bg: 'bg-stone-200', text: 'text-stone-700' };
  if (lower.includes('kiran')) return { bg: 'bg-orange-100', text: 'text-orange-800' };
  if (lower.includes('suresh')) return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
  if (lower.includes('vikas')) return { bg: 'bg-blue-100', text: 'text-blue-800' };
  if (lower.includes('mannu')) return { bg: 'bg-purple-100', text: 'text-purple-800' };

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash + (id || 0)) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recent';
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recent';
  }
}

export function enrichCustomer(c: any): EnrichedCustomer {
  const palette = getCustomerAvatarPalette(c.id, c.name);
  return {
    ...c,
    avatar_bg: c.avatar_bg || palette.bg,
    avatar_text: c.avatar_text || palette.text,
    recent_item: c.recent_item || (c.balance > 0 ? 'Udhaar' : 'Cleared'),
    recent_time: c.recent_time || formatRelativeTime(c.last_transaction_at),
  };
}

// 1. Customer Balances Hook
export function useCustomerBalances() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<CustomerBalancesResponse>(
    SWR_KEYS.balances,
    () => api.getCustomerBalances(),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      fallbackData: { customers: MOCK_CUSTOMERS },
      onErrorRetry: (err, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 3000);
      },
    }
  );

  const rawList = data?.customers || MOCK_CUSTOMERS;
  const enrichedList: EnrichedCustomer[] = rawList.map(enrichCustomer);

  return {
    customers: enrichedList,
    isLoading,
    isError: !!error,
    error,
    revalidate,
  };
}

// 2. Customer History Hook
export function useCustomerHistory(customerId: number | null) {
  const key = customerId ? SWR_KEYS.history(customerId) : null;
  const mockFallback = customerId ? MOCK_CUSTOMER_HISTORIES[customerId] : null;

  const { data, error, isLoading, mutate: revalidate } = useSWR<CustomerHistoryResponse>(
    key,
    () => api.getCustomerHistory(customerId!),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      fallbackData: mockFallback || undefined,
    }
  );

  return {
    customerHistory: data || mockFallback || null,
    isLoading,
    isError: !!error,
    error,
    revalidate,
  };
}

// 3. Inventory Hook
export function useInventory() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<InventoryResponse>(
    SWR_KEYS.inventory,
    () => api.getInventory(),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      fallbackData: { items: MOCK_INVENTORY },
    }
  );

  return {
    items: data?.items || MOCK_INVENTORY,
    lowStockCount: (data?.items || MOCK_INVENTORY).filter((it) => it.low_stock).length,
    isLoading,
    isError: !!error,
    error,
    revalidate,
  };
}

// 4. Weekly Summary Hook
export function useWeeklySummary() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<WeeklySummaryResponse>(
    SWR_KEYS.weekly,
    () => api.getWeeklySummary(),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      fallbackData: MOCK_WEEKLY_SUMMARY,
    }
  );

  return {
    summary: data || MOCK_WEEKLY_SUMMARY,
    isLoading,
    isError: !!error,
    error,
    revalidate,
  };
}

// Global revalidation helper after saving new entries
export async function revalidateAllData() {
  await Promise.all([
    mutate(SWR_KEYS.balances),
    mutate(SWR_KEYS.inventory),
    mutate(SWR_KEYS.weekly),
  ]);
}
