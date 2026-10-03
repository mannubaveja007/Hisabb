'use client';

import React from 'react';
import { CustomerBalanceItem } from '@/types/hisabb';
import { ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CustomerListProps {
  customers: CustomerBalanceItem[];
  onSelectCustomer: (customerId: number) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
}) => {
  const totalPending = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

  return (
    <section className="px-4 py-2 max-w-lg mx-auto pb-24">
      {/* Header with summary stats */}
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div>
          <h2 className="text-xl font-black text-[#1C1917] tracking-tight">
            किसका कितना बाकी
          </h2>
          <p className="text-xs text-[#57534E] font-semibold">
            Who owes what ({customers.length} ग्राहक)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#57534E] uppercase">कुल बाकी</span>
          <div className="text-lg font-black text-[#DC2626] font-mono">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Customer ledger cards */}
      <div className="space-y-2.5">
        {customers.map((c) => {
          const hasDebt = c.balance > 0;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="w-full text-left bg-white border border-[#E7E5E0] hover:border-stone-400 p-4 rounded-2xl shadow-sm transition-all active:scale-[0.99] flex items-center justify-between group touch-target"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#1C1917] leading-tight group-hover:text-black">
                    {c.name}
                  </span>
                  {c.phone && (
                    <span className="text-xs text-[#57534E] font-medium font-mono">
                      · {c.phone.slice(-4)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#57534E] font-medium">
                  <span className="flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-600" /> उधार: ₹{c.total_credit}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" /> जमा: ₹{c.total_paid}
                  </span>
                </div>
              </div>

              {/* Outstanding balance column */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div
                    className={`text-xl font-black font-mono tracking-tight ${
                      hasDebt ? 'text-[#DC2626]' : 'text-stone-400'
                    }`}
                  >
                    ₹{c.balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      hasDebt ? 'text-red-700' : 'text-stone-400'
                    }`}
                  >
                    {hasDebt ? 'बाकी है' : 'हिसाब साफ'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-900 transition-colors" />
              </div>
            </button>
          );
        })}

        {customers.length === 0 && (
          <div className="bg-white border border-[#E7E5E0] p-8 text-center rounded-2xl">
            <p className="text-lg font-bold text-[#1C1917]">कोई हिसाब नहीं मिला</p>
            <p className="text-sm text-[#57534E] mt-1">ऊपर माइक बटन दबाकर नया उधार जोड़ें</p>
          </div>
        )}
      </div>
    </section>
  );
};
