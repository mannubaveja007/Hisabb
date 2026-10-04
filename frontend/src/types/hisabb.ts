/**
 * Hisabb TypeScript Types (matching CONTRACT.md)
 */

export type EntryType = 'credit' | 'payment' | 'stock_in' | 'stock_out';

// ------------------------------------------
// POST /api/transcribe
// ------------------------------------------
export interface TranscribeResponse {
  text: string;
  language: string; // e.g. "hi", "pa", "en"
}

// ------------------------------------------
// POST /api/parse
// ------------------------------------------
export interface CustomerMatch {
  id: number;
  name: string;
  phone: string | null;
  score: number; // Fuzzy match ratio (0.0 to 1.0)
}

export interface ParsedDraftEntry {
  customer: string | null;
  type: EntryType;
  item: string | null;
  qty: number | null;
  unit: string | null;
  amount: number;
  confidence: number;
  customer_match: CustomerMatch | null;
  customer_english?: string | null;
}

export interface ParseRequest {
  text: string;
}

export interface ParseResponse {
  entries: ParsedDraftEntry[];
}

// ------------------------------------------
// POST /api/entries
// ------------------------------------------
export interface EntryInput {
  customer_id: number | null;
  raw_customer_name?: string | null;
  type: EntryType;
  item_id?: number | null;
  raw_item_name?: string | null;
  qty?: number | null;
  unit?: string | null;
  amount: number;
  notes?: string | null;
}

export interface CreateEntriesRequest {
  entries: EntryInput[];
}

export interface SavedLedgerEntry {
  id: number;
  customer_id: number | null;
  customer_name: string | null;
  type: EntryType;
  item_id: number | null;
  item_name: string | null;
  qty: number | null;
  unit: string | null;
  amount: number;
  notes: string | null;
  created_at: string; // ISO 8601
}

export interface CreateEntriesResponse {
  saved_count: number;
  entries: SavedLedgerEntry[];
}

// ------------------------------------------
// GET /api/customers/balances
// ------------------------------------------
export interface CustomerBalanceItem {
  id: number;
  name: string;
  phone: string | null;
  total_credit: number;
  total_paid: number;
  balance: number; // Computed in code: total_credit - total_paid
  last_transaction_at: string | null;
}

export interface CustomerBalancesResponse {
  customers: CustomerBalanceItem[];
}

// ------------------------------------------
// GET /api/customers/{id}/history
// ------------------------------------------
export interface CustomerHistoryProfile {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
}

export interface CustomerHistoryRecord {
  id: number;
  type: EntryType;
  amount: number;
  item_name: string | null;
  qty: number | null;
  unit: string | null;
  notes: string | null;
  created_at: string;
}

export interface CustomerHistoryResponse {
  customer: CustomerHistoryProfile;
  history: CustomerHistoryRecord[];
}

// ------------------------------------------
// GET /api/inventory
// ------------------------------------------
export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_threshold: number;
  low_stock: boolean; // Computed in code: current_stock <= min_stock_threshold
  last_updated_at: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
}

// ------------------------------------------
// GET /api/summary/weekly
// ------------------------------------------
export interface CustomerSummaryRef {
  id: number;
  name: string;
  phone: string | null;
}

export interface WeeklyReminderItem {
  customer: CustomerSummaryRef;
  balance: number;
  reminder_text: string;
  wa_link: string; // Pre-formatted WhatsApp deep link: https://wa.me/{phone}?text={encoded_text}
}

export type WeeklySummaryResponse = WeeklyReminderItem[];
