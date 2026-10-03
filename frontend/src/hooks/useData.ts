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

// 1. Customer Balances Hook
export function useCustomerBalances() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<CustomerBalancesResponse>(
    SWR_KEYS.balances,
    () => api.getCustomerBalances(),
    {
      revalidateOnFocus: false,
      fallbackData: { customers: MOCK_CUSTOMERS },
      onErrorRetry: (err, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 3000);
      },
    }
  );

  return {
    customers: data?.customers || MOCK_CUSTOMERS,
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
      revalidateOnFocus: false,
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
      revalidateOnFocus: false,
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
      revalidateOnFocus: false,
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
