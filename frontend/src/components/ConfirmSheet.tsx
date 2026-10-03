'use client';

import React, { useState } from 'react';
import { ParsedDraftEntry } from '@/types/hisabb';
import { Check, X, Edit3, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface ConfirmSheetProps {
  entry: ParsedDraftEntry | null;
  isOpen: boolean;
  onSave: (confirmedEntry: ParsedDraftEntry) => void;
  onDiscard: () => void;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  entry,
  isOpen,
  onSave,
  onDiscard,
}) => {
  if (!isOpen || !entry) return null;

  const [currentEntry, setCurrentEntry] = useState<ParsedDraftEntry>({ ...entry });
  const [isEditing, setIsEditing] = useState(false);
  const [confirmedMatch, setConfirmedMatch] = useState<boolean | null>(null);

  // Check if customer match is uncertain (score between 0.70 and 0.85)
  const isUncertainMatch =
    currentEntry.customer_match &&
    currentEntry.customer_match.score >= 0.70 &&
    currentEntry.customer_match.score < 0.85 &&
    confirmedMatch === null;

  const handleMatchResolution = (accept: boolean) => {
    if (accept && currentEntry.customer_match) {
      setCurrentEntry((prev) => ({
        ...prev,
        customer: currentEntry.customer_match!.name,
      }));
      setConfirmedMatch(true);
    } else {
      setConfirmedMatch(false);
    }
  };

  const handleSave = () => {
    onSave(currentEntry);
  };

  const isCredit = currentEntry.type === 'credit';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF8F3] rounded-t-3xl border-t border-stone-300 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Top drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-[#1C1917]">
            Confirm Entry
          </h3>
          <button
            onClick={onDiscard}
            className="text-stone-500 hover:text-stone-900 p-2 touch-target"
            aria-label="Discard"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Uncertain Customer Match Alert Card */}
        {isUncertainMatch && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-base font-bold text-amber-950">
                  Did you mean &quot;{currentEntry.customer_match?.name}&quot;?
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Fuzzy match confidence: {Math.round((currentEntry.customer_match?.score || 0) * 100)}%
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleMatchResolution(true)}
                    className="touch-target px-4 py-2 bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Yes
                  </button>
                  <button
                    onClick={() => handleMatchResolution(false)}
                    className="touch-target px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl text-sm active:scale-95"
                  >
                    No, New Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parsed Entry Card */}
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Customer & Type Chip */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Customer
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={currentEntry.customer || ''}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, customer: e.target.value })
                  }
                  className="text-lg font-black border-b-2 border-stone-800 bg-stone-50 px-2 py-1 outline-none w-full"
                />
              ) : (
                <span className="text-2xl font-black text-[#1C1917]">
                  {currentEntry.customer || 'Unknown Customer'}
                </span>
              )}
            </div>

            {/* Type Chip */}
            <div
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-sm ${
                isCredit
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}
            >
              {isCredit ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-red-700" />
                  <span>Credit</span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-4 h-4 text-green-700" />
                  <span>Payment</span>
                </>
              )}
            </div>
          </div>

          {/* Amount (Big & Bold) */}
          <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-stone-600">Amount:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold">₹</span>
                <input
                  type="number"
                  value={currentEntry.amount}
                  onChange={(e) =>
                    setCurrentEntry({
                      ...currentEntry,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="text-2xl font-black font-mono border-b-2 border-stone-800 w-32 px-1 text-right outline-none"
                />
              </div>
            ) : (
              <span
                className={`text-3xl font-black font-mono ${
                  isCredit ? 'text-[#DC2626]' : 'text-green-700'
                }`}
              >
                ₹{currentEntry.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>

          {/* Item & Quantity Details if present */}
          {(currentEntry.item || currentEntry.qty || isEditing) && (
            <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-stone-500 block">Item</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentEntry.item || ''}
                    placeholder="Item name"
                    onChange={(e) =>
                      setCurrentEntry({ ...currentEntry, item: e.target.value })
                    }
                    className="font-bold border-b border-stone-400 w-full py-1 outline-none"
                  />
                ) : (
                  <span className="font-bold text-stone-800">
                    {currentEntry.item || '—'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-500 block">Quantity</span>
                {isEditing ? (
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={currentEntry.qty || ''}
                      placeholder="Qty"
                      onChange={(e) =>
                        setCurrentEntry({
                          ...currentEntry,
                          qty: parseFloat(e.target.value) || null,
                        })
                      }
                      className="font-bold border-b border-stone-400 w-16 py-1 outline-none"
                    />
                    <input
                      type="text"
                      value={currentEntry.unit || ''}
                      placeholder="Unit"
                      onChange={(e) =>
                        setCurrentEntry({ ...currentEntry, unit: e.target.value })
                      }
                      className="font-bold border-b border-stone-400 w-16 py-1 outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-bold text-stone-800">
                    {currentEntry.qty ? `${currentEntry.qty} ${currentEntry.unit || ''}` : '—'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Big Green Save, Edit, Discard */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleSave}
            className="w-full touch-target bg-[#15803D] hover:bg-green-800 text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-green-700/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>Save to Ledger</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="touch-target bg-white border-2 border-stone-300 text-stone-800 font-bold text-base py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Done' : 'Edit'}</span>
            </button>
            <button
              onClick={onDiscard}
              className="touch-target bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-base py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Discard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
