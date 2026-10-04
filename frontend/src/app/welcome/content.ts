export interface DemoCustomer {
  name: string;
  name_hi: string;
  detail: string;
  detail_hi: string;
  balance: number;
  fresh?: boolean;
  avatar: string;
  avatar_bg: string;
  avatar_text: string;
}

export const demoEntry = {
  sentence: "शर्मा जी को 5 किलो चावल उधार, 700 रुपये",
  sentence_en: "Sharma Ji: 5 kg Rice on credit for ₹700",
  words: ["शर्मा", "जी", "को", "5", "किलो", "चावल", "उधार", "700 रुपये"],
  customer: "Sharma Ji",
  customer_hi: "शर्मा जी",
  type: "Credit",
  type_hi: "उधार",
  quantity: "5 kg",
  quantity_hi: "5 किलो",
  item: "Rice (Chawal)",
  item_hi: "चावल",
  amount: 700,
};

export const demoCustomers: DemoCustomer[] = [
  {
    name: "Sharma Ji",
    name_hi: "शर्मा जी",
    detail: "Chawal (Rice) · Today",
    detail_hi: "चावल · आज",
    balance: 700,
    fresh: true,
    avatar: "S",
    avatar_bg: "bg-red-100",
    avatar_text: "text-red-700",
  },
  {
    name: "Anita Devi",
    name_hi: "अनीता देवी",
    detail: "Dal (Lentils) · Yesterday",
    detail_hi: "दाल · कल",
    balance: 2400,
    avatar: "A",
    avatar_bg: "bg-amber-100",
    avatar_text: "text-amber-800",
  },
  {
    name: "Raju Bhai",
    name_hi: "राजू भाई",
    detail: "Tel (Oil) · Mon",
    detail_hi: "तेल · सोम",
    balance: 1800,
    avatar: "R",
    avatar_bg: "bg-stone-200",
    avatar_text: "text-stone-700",
  },
  {
    name: "Kiran Store",
    name_hi: "किरण स्टोर",
    detail: "Atta & Sugar · Sun",
    detail_hi: "चीनी · शुक्र",
    balance: 950,
    avatar: "K",
    avatar_bg: "bg-orange-100",
    avatar_text: "text-orange-800",
  },
  {
    name: "Mohan Lal",
    name_hi: "मोहन लाल",
    detail: "Salt · 29 Sep",
    detail_hi: "आटा · शुक्र",
    balance: 320,
    avatar: "M",
    avatar_bg: "bg-blue-100",
    avatar_text: "text-blue-800",
  },
];

export const stageSummary = "Hisabb turns a spoken credit note into a saved ledger entry for Sharma ji: five kilos of rice on credit for seven hundred rupees.";

export const comparisonEntries = [
  { notebook: "शर्मा जी", notebook_en: "Sharma Ji", hisabb: "Sharma Ji", item: "Sugar (चीनी)", amount: 200 },
  { notebook: "Sharma", notebook_en: "Sharma", hisabb: "Sharma Ji", item: "Chai (Tea)", amount: 150 },
  { notebook: "Sharmaji", notebook_en: "Sharmaji", hisabb: "Sharma Ji", item: "Tel (Oil)", amount: 350 },
];

export const comparisonSummary = "Sequence 2 compares an illustrative paper khata with Hisabb: three spoken entries become one clear customer balance.";
export const comparisonCaption = "From paper khata to clear accounts · कॉपी से हिसाब तक";

export const weeklySummary = {
  total: 2450,
  debtors: 4,
  topCustomer: "Sharma Ji",
  topCustomer_hi: "शर्मा जी",
  topBalance: 700,
  reminder: "Namaste Sharma Ji, your store pending balance is ₹700. Please clear when convenient. Thank you! 🙏 (नमस्ते शर्मा जी, आपका ₹700 बाकी है।)",
  payment: 300,
  newBalance: 400,
};

export const weeklyDebtors = [
  { name: "Sharma Ji", name_hi: "शर्मा जी", detail: "Chawal (Rice) · Today", detail_hi: "चावल · आज", balance: 700, avatar: "S" },
  { name: "Anita Devi", name_hi: "अनीता देवी", detail: "Dal (Lentils) · Yesterday", detail_hi: "दाल · कल", balance: 620, avatar: "A" },
  { name: "Raju Bhai", name_hi: "राजू भाई", detail: "Tel (Oil) · Mon", detail_hi: "तेल · सोम", balance: 580, avatar: "R" },
  { name: "Kiran Store", name_hi: "किरण स्टोर", detail: "Atta & Sugar · Sun", detail_hi: "चीनी · शुक्र", balance: 550, avatar: "K" },
];

export const summaryCaption = "Respectful reminders, zero hassle · तगादा. बिना झंझट.";
export const summaryDescription = "A weekly summary sorts the biggest balance first, drafts a respectful reminder, and records the payment.";
