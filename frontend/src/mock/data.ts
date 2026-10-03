import {
  CustomerBalanceItem,
  InventoryItem,
  WeeklyReminderItem,
  CustomerHistoryResponse,
  ParsedDraftEntry,
} from '@/types/hisabb';

export const MOCK_CUSTOMERS: CustomerBalanceItem[] = [
  {
    id: 101,
    name: 'Ramesh Kumar',
    phone: '9876543210',
    total_credit: 1200.0,
    total_paid: 500.0,
    balance: 700.0,
    last_transaction_at: '2026-10-03T09:15:00Z',
  },
  {
    id: 102,
    name: 'Anita Sharma',
    phone: '9823456789',
    total_credit: 450.0,
    total_paid: 0.0,
    balance: 450.0,
    last_transaction_at: '2026-10-02T18:40:00Z',
  },
  {
    id: 103,
    name: 'Manpreet Singh',
    phone: '9834567890',
    total_credit: 680.0,
    total_paid: 400.0,
    balance: 280.0,
    last_transaction_at: '2026-10-01T11:20:00Z',
  },
  {
    id: 104,
    name: 'Pooja Gupta',
    phone: '9845678901',
    total_credit: 1250.0,
    total_paid: 300.0,
    balance: 950.0,
    last_transaction_at: '2026-09-30T17:10:00Z',
  },
  {
    id: 105,
    name: 'Suresh Verma',
    phone: '9812345678',
    total_credit: 500.0,
    total_paid: 500.0,
    balance: 0.0,
    last_transaction_at: '2026-10-03T08:00:00Z',
  },
  {
    id: 106,
    name: 'Vikas Chawla',
    phone: '9878901234',
    total_credit: 320.0,
    total_paid: 0.0,
    balance: 320.0,
    last_transaction_at: '2026-09-29T14:30:00Z',
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 12,
    name: 'Amul Doodh',
    unit: 'packet',
    current_stock: 4.0,
    min_stock_threshold: 10.0,
    low_stock: true,
    last_updated_at: '2026-10-03T10:00:00Z',
  },
  {
    id: 13,
    name: 'Aashirvaad Atta 5kg',
    unit: 'bag',
    current_stock: 18.0,
    min_stock_threshold: 5.0,
    low_stock: false,
    last_updated_at: '2026-10-01T14:10:00Z',
  },
  {
    id: 14,
    name: 'Madhur Cheeni 1kg',
    unit: 'kg',
    current_stock: 7.0,
    min_stock_threshold: 15.0,
    low_stock: true,
    last_updated_at: '2026-10-02T11:00:00Z',
  },
  {
    id: 15,
    name: 'Tata Namak 1kg',
    unit: 'packet',
    current_stock: 22.0,
    min_stock_threshold: 8.0,
    low_stock: false,
    last_updated_at: '2026-09-28T16:00:00Z',
  },
  {
    id: 16,
    name: 'Fortune Sarson Tel 1L',
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
      name: 'Ramesh Kumar',
      phone: '9876543210',
      balance: 700.0,
    },
    history: [
      {
        id: 501,
        type: 'credit',
        amount: 700.0,
        item_name: 'Aashirvaad Atta 5kg',
        qty: 2.0,
        unit: 'bag',
        notes: 'Atta udhaar liya',
        created_at: '2026-10-03T09:15:00Z',
      },
      {
        id: 489,
        type: 'payment',
        amount: 500.0,
        item_name: null,
        qty: null,
        unit: null,
        notes: 'Cash payment di',
        created_at: '2026-09-29T12:00:00Z',
      },
      {
        id: 450,
        type: 'credit',
        amount: 500.0,
        item_name: 'Madhur Cheeni',
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
      name: 'Anita Sharma',
      phone: '9823456789',
      balance: 450.0,
    },
    history: [
      {
        id: 495,
        type: 'credit',
        amount: 450.0,
        item_name: 'Madhur Cheeni 1kg',
        qty: 5.0,
        unit: 'kg',
        notes: 'Cheeni udhaar',
        created_at: '2026-10-02T18:40:00Z',
      },
    ],
  },
};

export const MOCK_WEEKLY_SUMMARY: WeeklyReminderItem[] = [
  {
    customer: {
      id: 104,
      name: 'Pooja Gupta',
      phone: '9845678901',
    },
    balance: 950.0,
    reminder_text: 'Namaste Pooja Gupta ji, aapka dukaan ka kul baaki hisaab ₹950.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!',
    wa_link: 'https://wa.me/919845678901?text=Namaste%20Pooja%20Gupta%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9950.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!',
  },
  {
    customer: {
      id: 101,
      name: 'Ramesh Kumar',
      phone: '9876543210',
    },
    balance: 700.0,
    reminder_text: 'Namaste Ramesh Kumar ji, aapka dukaan ka kul baaki hisaab ₹700.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!',
    wa_link: 'https://wa.me/919876543210?text=Namaste%20Ramesh%20Kumar%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9700.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!',
  },
  {
    customer: {
      id: 102,
      name: 'Anita Sharma',
      phone: '9823456789',
    },
    balance: 450.0,
    reminder_text: 'Namaste Anita Sharma ji, aapka dukaan ka kul baaki hisaab ₹450.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!',
    wa_link: 'https://wa.me/919823456789?text=Namaste%20Anita%20Sharma%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9450.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!',
  },
  {
    customer: {
      id: 106,
      name: 'Vikas Chawla',
      phone: '9878901234',
    },
    balance: 320.0,
    reminder_text: 'Namaste Vikas Chawla ji, aapka dukaan ka kul baaki hisaab ₹320.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!',
    wa_link: 'https://wa.me/919878901234?text=Namaste%20Vikas%20Chawla%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9320.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!',
  },
  {
    customer: {
      id: 103,
      name: 'Manpreet Singh',
      phone: '9834567890',
    },
    balance: 280.0,
    reminder_text: 'Namaste Manpreet Singh ji, aapka dukaan ka kul baaki hisaab ₹280.00 hai. Kripya samay par bhuqtan karein. Dhanyawad!',
    wa_link: 'https://wa.me/919834567890?text=Namaste%20Manpreet%20Singh%20ji%2C%20aapka%20dukaan%20ka%20kul%20baaki%20hisaab%20%E2%82%B9280.00%20hai.%20Kripya%20samay%20par%20bhuqtan%20karein.%20Dhanyawad!',
  },
];

// Sample parsed draft for bottom sheet confirmation
export const MOCK_DRAFT_ENTRY: ParsedDraftEntry = {
  customer: 'Sharma',
  type: 'credit',
  item: 'Madhur Cheeni',
  qty: 2.0,
  unit: 'kilo',
  amount: 90.0,
  confidence: 0.94,
  customer_match: {
    id: 102,
    name: 'Anita Sharma',
    phone: '9823456789',
    score: 0.78, // Uncertain match: triggers "Did you mean Sharma Ji?" confirmation
  },
};
