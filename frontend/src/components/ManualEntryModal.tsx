'use client';

import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { EntryType, ParsedDraftEntry } from '@/types/hisabb';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ParsedDraftEntry) => Promise<boolean>;
}

export function ManualEntryModal({ isOpen, onClose, onSave }: ManualEntryModalProps) {
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<EntryType>('credit');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!customer.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;

    setIsSaving(true);
    const saved = await onSave({
      customer: customer.trim(),
      type,
      item: null,
      qty: null,
      unit: null,
      amount: numericAmount,
      confidence: 1,
      customer_match: null,
    });
    setIsSaving(false);
    if (saved) {
      setCustomer('');
      setAmount('');
      setType('credit');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center" role="presentation">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF8F3] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="manual-entry-title">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="manual-entry-title" className="text-2xl font-black text-[#1C1917]">नया हिसाब</h2>
            <p className="mt-1 text-sm font-medium text-stone-500">Add an entry manually</p>
          </div>
          <button type="button" onClick={onClose} className="touch-target rounded-full p-2 text-stone-500 hover:bg-stone-200" aria-label="Close manual entry">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-stone-700">
            ग्राहक का नाम
            <input autoFocus value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="जैसे शर्मा जी" className="min-h-12 rounded-2xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-bold text-stone-700">हिसाब का प्रकार</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Entry type">
              {([['credit', 'उधार / Credit'], ['payment', 'जमा / Payment']] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setType(value)} className={`min-h-12 rounded-2xl border px-3 text-sm font-bold transition-colors ${type === value ? 'border-red-600 bg-red-50 text-red-700' : 'border-stone-300 bg-white text-stone-600'}`} aria-pressed={type === value}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-bold text-stone-700">
            रकम
            <div className="flex min-h-12 items-center rounded-2xl border border-stone-300 bg-white px-4 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100">
              <span className="mr-2 text-lg font-black text-stone-500">₹</span>
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="700" className="w-full bg-transparent text-lg font-black text-stone-900 outline-none" />
            </div>
          </label>

          <button type="submit" disabled={isSaving || !customer.trim() || Number(amount) <= 0} className="touch-target mt-2 min-h-14 rounded-2xl bg-[#18181B] text-lg font-black text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? 'सहेज रहे हैं…' : 'खाते में जोड़ें'}
          </button>
        </form>
      </div>
    </div>
  );
}
