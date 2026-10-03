import {
  TranscribeResponse,
  ParseResponse,
  CreateEntriesRequest,
  CreateEntriesResponse,
  CustomerBalancesResponse,
  CustomerHistoryResponse,
  InventoryResponse,
  WeeklySummaryResponse,
  EntryInput,
} from '@/types/hisabb';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // If running via Next.js dev server on port 3000, default to FastAPI on 8000
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:8000';
  }
  return '';
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message = errorData?.detail || `API error (${response.status}): ${response.statusText}`;
    throw new ApiError(message, response.status, errorData);
  }

  return response.json();
}

export const api = {
  // 1. POST /api/transcribe
  async transcribe(file: Blob | File): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append('file', file, 'audio.webm');
    return request<TranscribeResponse>('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
  },

  // 2. POST /api/parse
  async parse(text: string): Promise<ParseResponse> {
    return request<ParseResponse>('/api/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // 3. POST /api/entries
  async createEntries(entries: EntryInput[]): Promise<CreateEntriesResponse> {
    return request<CreateEntriesResponse>('/api/entries', {
      method: 'POST',
      body: JSON.stringify({ entries } as CreateEntriesRequest),
    });
  },

  // 4. GET /api/customers/balances
  async getCustomerBalances(): Promise<CustomerBalancesResponse> {
    return request<CustomerBalancesResponse>('/api/customers/balances');
  },

  // 5. GET /api/customers/{id}/history
  async getCustomerHistory(id: number): Promise<CustomerHistoryResponse> {
    return request<CustomerHistoryResponse>(`/api/customers/${id}/history`);
  },

  // 6. GET /api/inventory
  async getInventory(): Promise<InventoryResponse> {
    return request<InventoryResponse>('/api/inventory');
  },

  // 7. GET /api/summary/weekly
  async getWeeklySummary(): Promise<WeeklySummaryResponse> {
    return request<WeeklySummaryResponse>('/api/summary/weekly');
  },
};
