Here is the updated specification, schema, and TypeScript contracts rebranded to **Hisabb**.

---

### 1. OpenAPI Specification & JSON Payloads

```yaml
openapi: 3.1.0
info:
  title: Hisabb API
  version: 1.0.0
  description: Local-first, voice-driven credit ledger for Indian Kirana & Retail stores.
paths:
  /api/transcribe:
    post:
      summary: Transcribe audio to text
      description: Ingests audio (wav, mp3, m4a, webm, ogg) via faster-whisper. Detects Hindi, Punjabi, or Indian English.
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Transcription result
          content:
            application/json:
              example:
                text: "Ramesh ne do packet Amul doodh udhaar liya aur Suresh ne 500 rupaye jama kiye"
                language: "hi"

  /api/parse:
    post:
      summary: Extract structured ledger entries from transcribed text
      description: Uses Ollama (Qwen2.5) with JSON-mode schema to extract entities, followed by backend fuzzy matching (Levenshtein / RapidFuzz) against the local customer list.
      requestBody:
        required: true
        content:
          application/json:
            example:
              text: "Ramesh ne do packet doodh udhaar liya aur Suresh ne 500 rupaye diye"
      responses:
        '200':
          description: Parsed draft entries ready for shopkeeper confirmation
          content:
            application/json:
              example:
                entries:
                  - customer: "Ramesh"
                    type: "credit"
                    item: "Amul Doodh"
                    qty: 2.0
                    unit: "packet"
                    amount: 66.0
                    confidence: 0.94
                    customer_match:
                      id: 101
                      name: "Ramesh Kumar"
                      phone: "919876543210"
                      score: 0.92
                  - customer: "Suresh"
                    type: "payment"
                    item: null
                    qty: null
                    unit: null
                    amount: 500.0
                    confidence: 0.98
                    customer_match:
                      id: 102
                      name: "Suresh Verma"
                      phone: "919812345678"
                      score: 0.95

  /api/entries:
    post:
      summary: Commit confirmed entries to the ledger
      description: Atomically writes confirmed transaction rows into SQLite and links them to customers/inventory.
      requestBody:
        required: true
        content:
          application/json:
            example:
              entries:
                - customer_id: 101
                  raw_customer_name: "Ramesh"
                  type: "credit"
                  item_id: 12
                  raw_item_name: "Amul Doodh"
                  qty: 2.0
                  unit: "packet"
                  amount: 66.0
                  notes: "Voice prompt entry"
                - customer_id: 102
                  raw_customer_name: "Suresh"
                  type: "payment"
                  item_id: null
                  raw_item_name: null
                  qty: null
                  unit: null
                  amount: 500.0
                  notes: "Cash payment"
      responses:
        '201':
          description: Saved ledger rows
          content:
            application/json:
              example:
                saved_count: 2
                entries:
                  - id: 501
                    customer_id: 101
                    customer_name: "Ramesh Kumar"
                    type: "credit"
                    item_id: 12
                    item_name: "Amul Doodh"
                    qty: 2.0
                    unit: "packet"
                    amount: 66.0
                    notes: "Voice prompt entry"
                    created_at: "2026-10-03T10:45:00Z"
                  - id: 502
                    customer_id: 102
                    customer_name: "Suresh Verma"
                    type: "payment"
                    item_id: null
                    item_name: null
                    qty: null
                    unit: null
                    amount: 500.0
                    notes: "Cash payment"
                    created_at: "2026-10-03T10:45:00Z"

  /api/customers/balances:
    get:
      summary: Retrieve all customer balances
      description: Returns all customers with their net balance calculated in code (SUM(credit) - SUM(payment)).
      responses:
        '200':
          description: List of customer balances
          content:
            application/json:
              example:
                customers:
                  - id: 101
                    name: "Ramesh Kumar"
                    phone: "919876543210"
                    total_credit: 1266.0
                    total_paid: 500.0
                    balance: 766.0
                    last_transaction_at: "2026-10-03T10:45:00Z"
                  - id: 102
                    name: "Suresh Verma"
                    phone: "919812345678"
                    total_credit: 500.0
                    total_paid: 500.0
                    balance: 0.0
                    last_transaction_at: "2026-10-03T10:45:00Z"

  /api/customers/{id}/history:
    get:
      summary: Get ledger history for a specific customer
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Customer balance summary and chronological ledger history
          content:
            application/json:
              example:
                customer:
                  id: 101
                  name: "Ramesh Kumar"
                  phone: "919876543210"
                  balance: 766.0
                history:
                  - id: 501
                    type: "credit"
                    amount: 66.0
                    item_name: "Amul Doodh"
                    qty: 2.0
                    unit: "packet"
                    notes: "Voice prompt entry"
                    created_at: "2026-10-03T10:45:00Z"
                  - id: 480
                    type: "credit"
                    amount: 1200.0
                    item_name: "Basmati Rice 10kg"
                    qty: 1.0
                    unit: "bag"
                    notes: null
                    created_at: "2026-09-28T18:20:00Z"

  /api/inventory:
    get:
      summary: List inventory items with low stock warning
      description: Returns stock computed from inventory movements and flags items below minimum threshold.
      responses:
        '200':
          description: Inventory items list
          content:
            application/json:
              example:
                items:
                  - id: 12
                    name: "Amul Doodh"
                    unit: "packet"
                    current_stock: 4.0
                    min_stock_threshold: 10.0
                    low_stock: true
                    last_updated_at: "2026-10-03T10:45:00Z"
                  - id: 13
                    name: "Aashirvaad Atta 5kg"
                    unit: "bag"
                    current_stock: 25.0
                    min_stock_threshold: 5.0
                    low_stock: false
                    last_updated_at: "2026-10-01T14:10:00Z"

  /api/summary/weekly:
    get:
      summary: Weekly outstanding credit summary with WhatsApp reminder links
      description: Filters customers with pending balance > 0, generates localized reminder text (Hindi/English), and builds pre-filled wa.me links.
      responses:
        '200':
          description: Weekly reminder list
          content:
            application/json:
              example:
                - customer:
                    id: 101
                    name: "Ramesh Kumar"
                    phone: "919876543210"
                  balance: 766.0
                  reminder_text: "Namaste Ramesh Kumar ji, aapka dukaan ka kul baaki hisaab ₹766.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!"
                  wa_link: "https://wa.me/919876543210?text=Namaste%20Ramesh%20Kumar%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9766.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!"
```

---

### 2. SQLite DDL Schema (`hisabb.db`)

```sql
PRAGMA foreign_keys = ON;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE,
    phone TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 2. Inventory Items Table
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    unit TEXT NOT NULL DEFAULT 'unit',            -- e.g., 'packet', 'kg', 'ltr', 'bag'
    min_stock_threshold REAL NOT NULL DEFAULT 5.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- 3. Unified Hisabb Ledger Entries Table
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    raw_customer_name TEXT,
    type TEXT NOT NULL CHECK(type IN ('credit', 'payment', 'stock_in', 'stock_out')),
    item_id INTEGER,
    raw_item_name TEXT,
    qty REAL,
    unit TEXT,
    amount REAL NOT NULL DEFAULT 0.0 CHECK(amount >= 0.0),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_customer_id ON entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_entries_item_id ON entries(item_id);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);

-- Performance index for running balance aggregations
CREATE INDEX IF NOT EXISTS idx_entries_customer_calc 
ON entries(customer_id, type, amount);

-- 4. Triggers to maintain updated_at
CREATE TRIGGER IF NOT EXISTS trg_customers_updated_at
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_items_updated_at
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```

---

### 3. TypeScript Definitions (`types/hisabb.ts`)

```typescript
/**
 * Hisabb - Local-first voice-driven credit ledger
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
```