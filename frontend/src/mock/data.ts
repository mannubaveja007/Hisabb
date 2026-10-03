import {
  CustomerBalanceItem,
  InventoryItem,
  WeeklyReminderItem,
  CustomerHistoryResponse,
  ParsedDraftEntry,
} from '@/types/hisabb';

export interface EnrichedCustomer extends CustomerBalanceItem {
  recent_item?: string;
  recent_time?: string;
  avatar_bg?: string;
  avatar_text?: string;
}

export const MOCK_CUSTOMERS: EnrichedCustomer[] = [
  {
    id: 101,
    name: 'Sharma Ji',
    phone: '9876543210',
    total_credit: 1200.0,
    total_paid: 500.0,
    balance: 700.0,
    last_transaction_at: '2026-10-03T09:15:00Z',
    recent_item: 'Chawal (Rice)',
    recent_time: 'Today',
    avatar_bg: 'bg-red-100',
    avatar_text: 'text-red-700',
  },
  {
    id: 102,
    name: 'Anita Devi',
    phone: '9823456789',
    total_credit: 2400.0,
    total_paid: 0.0,
    balance: 2400.0,
    last_transaction_at: '2026-10-02T18:40:00Z',
    recent_item: 'Dal (Lentils)',
    recent_time: 'Yesterday',
    avatar_bg: 'bg-amber-100',
    avatar_text: 'text-amber-800',
  },
  {
    id: 103,
    name: 'Raju Bhai',
    phone: '9834567890',
    total_credit: 2200.0,
    total_paid: 400.0,
    balance: 1800.0,
    last_transaction_at: '2026-09-29T11:20:00Z',
    recent_item: 'Tel (Oil)',
    recent_time: 'Mon',
    avatar_bg: 'bg-stone-200',
    avatar_text: 'text-stone-700',
  },
  {
    id: 104,
    name: 'Kiran Store',
    phone: '9845678901',
    total_credit: 1250.0,
    total_paid: 300.0,
    balance: 950.0,
    last_transaction_at: '2026-09-30T17:10:00Z',
    recent_item: 'Atta & Sugar',
    recent_time: 'Sun',
    avatar_bg: 'bg-orange-100',
    avatar_text: 'text-orange-800',
  },
  {
    id: 105,
    name: 'Suresh Verma',
    phone: '9812345678',
    total_credit: 500.0,
    total_paid: 500.0,
    balance: 0.0,
    last_transaction_at: '2026-10-03T08:00:00Z',
    recent_item: 'Milk',
    recent_time: 'Today',
    avatar_bg: 'bg-emerald-100',
    avatar_text: 'text-emerald-800',
  },
  {
    id: 106,
    name: 'Vikas Chawla',
    phone: '9878901234',
    total_credit: 320.0,
    total_paid: 0.0,
    balance: 320.0,
    last_transaction_at: '2026-09-29T14:30:00Z',
    recent_item: 'Salt',
    recent_time: '29 Sep',
    avatar_bg: 'bg-blue-100',
    avatar_text: 'text-blue-800',
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 12,
    name: 'Rice 5kg (Chawal)',
    unit: 'bag',
    current_stock: 4.0,
    min_stock_threshold: 10.0,
    low_stock: true,
    last_updated_at: '2026-10-03T10:00:00Z',
  },
  {
    id: 13,
    name: 'Flour 5kg (Atta)',
    unit: 'bag',
    current_stock: 18.0,
    min_stock_threshold: 5.0,
    low_stock: false,
    last_updated_at: '2026-10-01T14:10:00Z',
  },
  {
    id: 14,
    name: 'Sugar 1kg (Cheeni)',
    unit: 'kg',
    current_stock: 7.0,
    min_stock_threshold: 15.0,
    low_stock: true,
    last_updated_at: '2026-10-02T11:00:00Z',
  },
  {
    id: 15,
    name: 'Tata Salt 1kg (Namak)',
    unit: 'packet',
    current_stock: 22.0,
    min_stock_threshold: 8.0,
    low_stock: false,
    last_updated_at: '2026-09-28T16:00:00Z',
  },
  {
    id: 16,
    name: 'Mustard Oil 1L (Sarson Tel)',
    unit: 'bottle',
    current_stock: 3.0,
    min_stock_threshold: 6.0,
    low_stock: true,
    last_updated_at: '2026-10-02T19:30:00Z',
  },
];

export const MOCK_CUSTOMER_HISTORIES: Record<number, CustomerHistoryResponse> = {
  101: {
    customer: {
      id: 101,
      name: 'Sharma Ji',
      phone: '9876543210',
      balance: 700.0,
    },
    history: [
      {
        id: 501,
        type: 'credit',
        amount: 700.0,
        item_name: '5 kg Chawal (Rice)',
        qty: 5.0,
        unit: 'kilo',
        notes: 'Chawal udhaar liya',
        created_at: '2026-10-03T09:15:00Z',
      },
      {
        id: 489,
        type: 'payment',
        amount: 500.0,
        item_name: null,
        qty: null,
        unit: null,
        notes: 'Cash payment received',
        created_at: '2026-09-29T12:00:00Z',
      },
      {
        id: 450,
        type: 'credit',
        amount: 500.0,
        item_name: 'Sugar (Cheeni)',
        qty: 10.0,
        unit: 'kg',
        notes: null,
        created_at: '2026-09-20T17:30:00Z',
      },
    ],
  },
  102: {
    customer: {
      id: 102,
      name: 'Anita Devi',
      phone: '9823456789',
      balance: 2400.0,
    },
    history: [
      {
        id: 495,
        type: 'credit',
        amount: 2400.0,
        item_name: 'Dal & Tel',
        qty: 8.0,
        unit: 'kg',
        notes: 'Grocery credit',
        created_at: '2026-10-02T18:40:00Z',
      },
    ],
  },
};

export const MOCK_WEEKLY_SUMMARY: WeeklyReminderItem[] = [
  {
    customer: {
      id: 102,
      name: 'Anita Devi',
      phone: '9823456789',
    },
    balance: 2400.0,
    reminder_text: 'Namaste Anita Devi ji, aapka dukaan ka total pending udhaar balance ₹2400.00 hai. Please check and pay when possible. Thank you!',
    wa_link: 'https://wa.me/919823456789?text=Namaste%20Anita%20Devi%20ji%2C%20aapka%20dukaan%20ka%20total%20pending%20udhaar%20balance%20%E2%82%B92400.00%20hai.%20Please%20check%20and%20pay%20when%20possible.%20Thank%20you!',
  },
  {
    customer: {
      id: 103,
      name: 'Raju Bhai',
      phone: '9834567890',
    },
    balance: 1800.0,
    reminder_text: 'Namaste Raju Bhai, aapka dukaan ka pending balance ₹1800.00 hai. Please settle when convenient. Thank you!',
    wa_link: 'https://wa.me/919834567890?text=Namaste%20Raju%20Bhai%2C%20aapka%20dukaan%20ka%20pending%20balance%20%E2%82%B91800.00%20hai.%20Please%20settle%20when%20convenient.%20Thank%20you!',
  },
  {
    customer: {
      id: 104,
      name: 'Kiran Store',
      phone: '9845678901',
    },
    balance: 950.0,
    reminder_text: 'Hello Kiran Store, pending udhaar balance is ₹950.00. Please arrange payment when convenient. Thank you!',
    wa_link: 'https://wa.me/919845678901?text=Hello%20Kiran%20Store%2C%20pending%20udhaar%20balance%20is%20%E2%82%B9950.00.%20Please%20arrange%20payment%20when%20convenient.%20Thank%20you!',
  },
  {
    customer: {
      id: 101,
      name: 'Sharma Ji',
      phone: '9876543210',
    },
    balance: 700.0,
    reminder_text: 'Namaste Sharma Ji, aapka dukaan ka pending udhaar balance ₹700.00 hai. Please check and pay. Thank you!',
    wa_link: 'https://wa.me/919876543210?text=Namaste%20Sharma%20Ji%2C%20aapka%20dukaan%20ka%20pending%20udhaar%20balance%20%E2%82%B9700.00%20hai.%20Please%20check%20and%20pay.%20Thank%20you!',
  },
];

export const MOCK_DRAFT_ENTRY: ParsedDraftEntry = {
  customer: 'Sharma Ji',
  type: 'credit',
  item: '5 kilo chawal',
  qty: 5.0,
  unit: 'kilo',
  amount: 700.0,
  confidence: 0.96,
  customer_match: {
    id: 101,
    name: 'Sharma Ji',
    phone: '9876543210',
    score: 0.80, // Shows confirmation check
  },
};

export const MOCK_TRANSCRIPTION_TEXT = "Sharma ji ko 5 kilo chawal udhaar 700 rupaye";
