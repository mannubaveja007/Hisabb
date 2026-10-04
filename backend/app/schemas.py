from typing import Literal, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

EntryType = Literal["credit", "payment", "stock_in", "stock_out"]

# 1. Transcribe
class TranscribeResponse(BaseModel):
    text: str
    language: str

# 2. Parse
class CustomerMatch(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    score: float

class ParsedDraftEntry(BaseModel):
    customer: Optional[str] = None
    type: EntryType
    item: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    amount: float = 0.0
    confidence: float = 1.0
    customer_match: Optional[CustomerMatch] = None
    customer_english: Optional[str] = None

class ParseRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    entries: List[ParsedDraftEntry]

# Raw LLM Output Schema (Internal before fuzzy match)
class LLMEntryExtraction(BaseModel):
    customer: Optional[str] = None
    type: EntryType = "credit"
    item: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    amount: float = 0.0
    confidence: float = 0.9

class LLMParseResult(BaseModel):
    entries: List[LLMEntryExtraction]

# 3. Entries
class EntryInput(BaseModel):
    customer_id: Optional[int] = None
    raw_customer_name: Optional[str] = None
    type: EntryType
    item_id: Optional[int] = None
    raw_item_name: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    amount: float = Field(ge=0.0, default=0.0)
    notes: Optional[str] = None

class CreateEntriesRequest(BaseModel):
    entries: List[EntryInput]

class SavedLedgerEntry(BaseModel):
    id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    type: EntryType
    item_id: Optional[int] = None
    item_name: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    amount: float
    notes: Optional[str] = None
    created_at: str

class CreateEntriesResponse(BaseModel):
    saved_count: int
    entries: List[SavedLedgerEntry]

# 4. Customer Balances
class CustomerBalanceItem(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    total_credit: float
    total_paid: float
    balance: float
    last_transaction_at: Optional[str] = None

class CustomerBalancesResponse(BaseModel):
    customers: List[CustomerBalanceItem]

# 5. Customer History
class CustomerHistoryProfile(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    balance: float

class CustomerHistoryRecord(BaseModel):
    id: int
    type: EntryType
    amount: float
    item_name: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    created_at: str

class CustomerHistoryResponse(BaseModel):
    customer: CustomerHistoryProfile
    history: List[CustomerHistoryRecord]

# 6. Inventory
class InventoryItem(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: float
    min_stock_threshold: float
    low_stock: bool
    last_updated_at: str

class InventoryResponse(BaseModel):
    items: List[InventoryItem]

# 7. Weekly Summary
class CustomerSummaryRef(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None

class WeeklyReminderItem(BaseModel):
    customer: CustomerSummaryRef
    balance: float
    reminder_text: str
    wa_link: str

WeeklySummaryResponse = List[WeeklyReminderItem]
