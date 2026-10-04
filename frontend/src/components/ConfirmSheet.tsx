'use client';

import React, { useEffect, useState } from 'react';
import { ParsedDraftEntry } from '@/types/hisabb';
import { Check, Loader2, X } from 'lucide-react';

interface ConfirmSheetProps {
  entry: ParsedDraftEntry | null;
  transcriptionText?: string;
  isOpen: boolean;
  onSave: (confirmedEntry: ParsedDraftEntry) => void;
  onDiscard: () => void;
  queuePosition?: { current: number; total: number } | null;
}

const COMMON_NAMES: Record<string, string> = {
  'सिद्धू': 'Sidhu', 'सिधु': 'Sidhu', 'मुसे': 'Moose', 'मूसे': 'Moose',
  'वाला': 'Wala', 'मन्नू': 'Mannu', 'मनू': 'Mannu', 'बवेजा': 'Baveja',
  'शर्मा': 'Sharma', 'वर्मा': 'Verma', 'गुप्ता': 'Gupta', 'सिंह': 'Singh',
  'कौर': 'Kaur', 'कुमार': 'Kumar', 'देवी': 'Devi', 'प्रसाद': 'Prasad',
  'चावला': 'Chawla', 'इमरान': 'Imran', 'सुरेश': 'Suresh', 'रमेश': 'Ramesh',
  'अनीता': 'Anita', 'विकास': 'Vikas', 'सुनीता': 'Sunita', 'पूजा': 'Pooja',
  'मनप्रीत': 'Manpreet', 'हरप्रीत': 'Harpreet', 'राजिंदर': 'Rajinder'
};

const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'क़': 'q', 'ख़': 'kh',
  'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
};

const VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
};

const MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ँ': 'n', 'ः': 'h'
};

function devanagariToEnglish(text: string): string {
  if (!text) return '';
  if (!/[\u0900-\u097F]/.test(text)) return text;

  const words = text.split(/\s+/);
  const outWords = words.map((rawWord) => {
    const cleanWord = rawWord.replace(/[,।!?]/g, '').trim();
    if (COMMON_NAMES[cleanWord]) {
      return COMMON_NAMES[cleanWord];
    }

    const chars = Array.from(cleanWord);
    const out: string[] = [];
    const n = chars.length;
    let i = 0;
    while (i < n) {
      const ch = chars[i];
      if (VOWELS[ch]) {
        out.push(VOWELS[ch]);
      } else if (CONSONANTS[ch]) {
        const cStr = CONSONANTS[ch];
        if (i + 1 < n) {
          const next = chars[i + 1];
          if (next === '्') {
            out.push(cStr);
            i++;
          } else if (MATRAS[next]) {
            out.push(cStr + MATRAS[next]);
            i++;
          } else {
            out.push(cStr + 'a');
          }
        } else {
          out.push(cStr);
        }
      } else if (MATRAS[ch]) {
        out.push(MATRAS[ch]);
      } else {
        out.push(ch);
      }
      i++;
    }
    const res = out.join('');
    return res ? res.charAt(0).toUpperCase() + res.slice(1).toLowerCase() : '';
  });

  return outWords.filter(Boolean).join(' ');
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  entry,
  transcriptionText = "शर्मा जी को 5 किलो चावल उधार 700 रुपये",
  isOpen,
  onSave,
  onDiscard,
  queuePosition = null,
}) => {
  const [currentEntry, setCurrentEntry] = useState<ParsedDraftEntry | null>(entry);
  const [confirmedMatch, setConfirmedMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (entry) {
      const initialEntry = { ...entry };
      if (entry.customer_match && entry.customer_match.score >= 0.75) {
        initialEntry.customer = entry.customer_match.name;
      } else if (entry.customer_english) {
        initialEntry.customer = entry.customer_english;
      } else if (entry.customer && /[\u0900-\u097F]/.test(entry.customer)) {
        initialEntry.customer = devanagariToEnglish(entry.customer);
      }
      setCurrentEntry(initialEntry);
    } else {
      setCurrentEntry(null);
    }
    setConfirmedMatch(null);
  }, [entry]);

  if (!isOpen || !currentEntry) return null;

  const isCredit = currentEntry.type === 'credit';
  const requiresCustomer = currentEntry.type === 'credit' || currentEntry.type === 'payment';
  const customerName = currentEntry.customer || 'Customer not found';
  const itemName = currentEntry.item || 'Item';
  const qtyText = currentEntry.qty !== null && currentEntry.qty !== undefined
    ? `${currentEntry.qty} ${currentEntry.unit || ''}`
    : '';
  const amountVal = currentEntry.amount;

  // Check if fuzzy customer match needs verification (score 70-85)
  const isUncertainMatch = Boolean(
    currentEntry.customer_match &&
    currentEntry.customer_match.score >= 0.70 &&
    currentEntry.customer_match.score < 0.85 &&
    confirmedMatch === null
  );

  const handleConfirmMatch = () => {
    if (currentEntry.customer_match) {
      setCurrentEntry((prev) =>
        prev
          ? { ...prev, customer: currentEntry.customer_match!.name }
          : prev
      );
    }
    setConfirmedMatch(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-0 animate-in fade-in duration-200">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Floating "YOU SAID" card matching screenshot */}
        <div className="w-[92%] bg-white rounded-2xl border border-stone-200 shadow-md p-4 mb-3 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
            YOU SAID
          </span>
          <p className="text-lg font-black text-[#1C1917] leading-snug">
            {transcriptionText}
          </p>
        </div>

        {/* Bottom Drawer matching screenshot */}
        <div className="w-full bg-white rounded-t-3xl border-t border-stone-300 shadow-2xl px-6 pt-3 pb-8 max-h-[85vh] overflow-y-auto relative">
          {/* Drag handle */}
          <div className="w-16 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

          {/* Close button in top-right */}
          <button
            onClick={onDiscard}
            className="absolute top-4 right-5 text-stone-400 hover:text-stone-700 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-3xl font-black text-[#1C1917] tracking-tight leading-none">
                Check & Confirm
              </h3>
              <p className="text-xs text-[#78716C] font-semibold mt-1">
                Confirm entry · हिसाब चेक करें
              </p>
            </div>
            <div className="flex items-center gap-2">
              {queuePosition && (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700" aria-live="polite">
                  Entry {queuePosition.current} of {queuePosition.total}
                </span>
              )}
              {/* Red dotted indicator like screenshot */}
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center animate-spin">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            </div>
            </div>
          </div>

          {/* Tag Chips Row matching screenshot */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-red-50/70 border border-red-200 rounded-lg text-red-600 font-bold text-sm">
              {customerName}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentEntry((prev) =>
                  prev ? { ...prev, type: prev.type === 'credit' ? 'payment' : 'credit' } : prev
                )
              }
              title="Click to toggle Udhaar / Jama"
              className="px-3 py-1 bg-red-100/90 hover:bg-red-200/80 active:scale-95 border border-red-300 rounded-lg text-red-700 font-bold text-sm cursor-pointer transition-all flex items-center gap-1"
            >
              <span>{isCredit ? 'Udhaar / Credit' : 'Payment / Jama'}</span>
              <span className="text-[10px] text-red-500 font-normal">⇄</span>
            </button>
            {itemName && (
              <span className="px-3 py-1 bg-red-50/70 border border-red-200 rounded-lg text-red-600 font-bold text-sm">
                {itemName}
              </span>
            )}
            {qtyText && (
              <span className="px-3 py-1 bg-red-50/70 border border-red-200 rounded-lg text-red-600 font-bold text-sm">
                {qtyText}
              </span>
            )}
            <span className="px-3 py-1 bg-red-50/70 border border-red-200 rounded-lg text-red-600 font-bold text-sm">
              ₹{amountVal}
            </span>
          </div>

          {/* 3-Column Breakdown with Watermark Stamp */}
          <div className="relative border-t border-b border-stone-100 py-4 mb-5 grid grid-cols-3 gap-2">
            {/* Watermark Red Stamp over Amount Column */}
            <div className="absolute right-2 top-1 pointer-events-none select-none transform rotate-[-8deg] border-2 border-red-300/60 rounded-xl px-4 py-1.5 bg-red-50/30 transition-all duration-200">
              <span className="text-2xl font-black text-red-400/50 tracking-wider uppercase font-mono">
                {isCredit ? 'UDHAAR' : 'JAMA'}
              </span>
            </div>

            <div>
              <label htmlFor="confirm-customer" className="text-xs font-semibold text-stone-500 block mb-0.5">
                Customer (ग्राहक)
              </label>
              <input
                id="confirm-customer"
                type="text"
                value={currentEntry.customer || ''}
                onChange={(e) =>
                  setCurrentEntry((prev) => (prev ? { ...prev, customer: e.target.value } : prev))
                }
                placeholder="Customer name"
                className="w-full text-lg font-black text-[#1C1917] bg-transparent border-b border-dashed border-stone-300 focus:border-red-500 focus:bg-stone-50/50 focus:outline-hidden py-0.5 leading-tight transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm-item" className="text-xs font-semibold text-stone-500 block mb-0.5">
                Items (सामान)
              </label>
              <input
                id="confirm-item"
                type="text"
                value={currentEntry.item || ''}
                onChange={(e) =>
                  setCurrentEntry((prev) => (prev ? { ...prev, item: e.target.value } : prev))
                }
                placeholder="Item (optional)"
                className="w-full text-lg font-black text-[#1C1917] bg-transparent border-b border-dashed border-stone-300 focus:border-red-500 focus:bg-stone-50/50 focus:outline-hidden py-0.5 leading-tight transition-colors"
              />
            </div>

            <div className="relative z-10">
              <label htmlFor="confirm-amount" className="text-xs font-semibold text-stone-500 block mb-0.5">
                Amount (रकम)
              </label>
              <div className="flex items-center">
                <span className="text-xl font-black font-mono text-[#1C1917]">₹</span>
                <input
                  id="confirm-amount"
                  type="number"
                  step="any"
                  value={currentEntry.amount || ''}
                  onChange={(e) =>
                    setCurrentEntry((prev) =>
                      prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : prev
                    )
                  }
                  className="w-full text-2xl font-black font-mono text-[#1C1917] bg-transparent border-b border-dashed border-stone-300 focus:border-red-500 focus:bg-stone-50/50 focus:outline-hidden py-0.5 leading-tight pl-1 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Uncertain Match Confirmation Row */}
          {isUncertainMatch && (
            <div className="flex items-center justify-between bg-stone-50/80 border border-stone-200 rounded-2xl p-3 mb-5">
              <span className="text-sm font-bold text-stone-800">
                Did you mean {customerName}? (क्या मतलब {customerName} है?)
              </span>
              <button
                onClick={handleConfirmMatch}
                className="touch-target px-4 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-sm transition-all bg-white border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Yes (हाँ)</span>
              </button>
            </div>
          )}

          {/* Solid Dark Button: "Add to Khata / Save to ledger" */}
          <button
            disabled={currentEntry.confidence <= 0 || (requiresCustomer && !currentEntry.customer?.trim()) || (requiresCustomer && currentEntry.amount <= 0)}
            onClick={() => onSave(currentEntry)}
            className="w-full touch-target bg-[#18181B] hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-md flex flex-col items-center justify-center active:scale-[0.98] transition-all"
          >
            <span className="text-lg font-black leading-tight">Add to Khata</span>
            <span className="text-xs text-stone-400 font-medium leading-none mt-0.5">
              खाते में जोड़ें · Save to ledger
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
