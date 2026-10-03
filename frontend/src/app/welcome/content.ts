export const demoEntry = {
  sentence: "शर्मा जी को 5 किलो चावल उधार, 700 रुपये",
  words: ["शर्मा", "जी", "को", "5", "किलो", "चावल", "उधार", "700 रुपये"],
  customer: "शर्मा जी",
  type: "उधार",
  quantity: "5 किलो",
  item: "चावल",
  amount: 700,
};

export const demoCustomers = [
  { name: "शर्मा जी", detail: "चावल · आज", balance: 700, fresh: true },
  { name: "अनीता देवी", detail: "दाल · कल", balance: 2400 },
  { name: "राजू भाई", detail: "तेल · सोम", balance: 1800 },
  { name: "किरण स्टोर", detail: "चीनी · शुक्र", balance: 950 },
  { name: "मोहन लाल", detail: "आटा · शुक्र", balance: 320 },
];

export const stageSummary = "Hisabb turns a spoken credit note into a saved ledger entry for Sharma ji: five kilos of rice on credit for seven hundred rupees.";

export const comparisonEntries = [
  { notebook: "शर्मा जी", hisabb: "Sharma", item: "चीनी", amount: 200 },
  { notebook: "Sharma", hisabb: "Sharma", item: "चाय", amount: 150 },
  { notebook: "Sharmaji", hisabb: "Sharma", item: "तेल", amount: 350 },
];

export const comparisonSummary = "Sequence 2 compares an illustrative paper khata with Hisabb: three spoken entries become one clear customer balance.";
export const comparisonCaption = "कॉपी से हिसाब तक";

export const weeklySummary = {
  total: 2450,
  debtors: 4,
  topCustomer: "शर्मा जी",
  topBalance: 700,
  reminder: "नमस्ते शर्मा जी, आपका ₹700 बाकी है। जब सुविधा हो, भेज दीजिए। धन्यवाद 🙏",
  payment: 300,
  newBalance: 400,
};

export const weeklyDebtors = [
  { name: "शर्मा जी", detail: "चावल · आज", balance: 700 },
  { name: "अनीता देवी", detail: "दाल · कल", balance: 620 },
  { name: "राजू भाई", detail: "तेल · सोम", balance: 580 },
  { name: "किरण स्टोर", detail: "चीनी · शुक्र", balance: 550 },
];

export const summaryCaption = "तगादा. बिना झंझट.";
export const summaryDescription = "A weekly summary sorts the biggest balance first, drafts a respectful reminder, and records the payment.";
