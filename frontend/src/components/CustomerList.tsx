'use client';

import React from 'react';
import { EnrichedCustomer } from '@/mock/data';
import { ChevronRight, Plus } from 'lucide-react';

interface CustomerListProps {
  customers: EnrichedCustomer[];
  onSelectCustomer: (customerId: number) => void;
  onAddCustomer?: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
}) => {
  return (
    <section className="px-4 py-2 max-w-lg mx-auto pb-28">
      {/* Header section matching screenshot */}
      <div className="flex items-center justify-between mb-4 mt-2 px-1">
        <div>
          <h2 className="text-3xl font-black text-[#1C1917] tracking-tight">
            किससे लेना है?
          </h2>
          <p className="text-xs text-[#57534E] font-medium mt-0.5">
            Customers with credit
          </p>
        </div>
        <button
          onClick={onAddCustomer}
          className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 hover:text-stone-900 hover:border-stone-400 active:scale-95 transition-all"
          aria-label="Add entry or customer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Customer rows matching screenshot */}
      <div className="bg-white rounded-3xl border border-[#E7E5E0] divide-y divide-[#F2EFE9] shadow-xs overflow-hidden">
        {customers.map((c) => {
          const hasDebt = c.balance > 0;
          const initial = c.name ? c.name.charAt(0) : '?';

          return (
            <button
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="w-full text-left p-4 hover:bg-[#FAF8F3]/60 transition-colors flex items-center justify-between group touch-target"
            >
              {/* Left side: Avatar + Name + Subtitle */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    c.avatar_bg || 'bg-stone-100'
                  } ${c.avatar_text || 'text-stone-700'}`}
                >
                  {initial}
                </div>
                <div className="truncate">
                  <div className="text-lg font-bold text-[#1C1917] truncate leading-tight">
                    {c.name}
                  </div>
                  <div className="text-xs text-[#78716C] font-medium mt-0.5 truncate">
                    {c.recent_item ? `${c.recent_item} · ` : ''}
                    {c.recent_time || 'Recent'}
                  </div>
                </div>
              </div>

              {/* Right side: Red Amount + Chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`text-xl font-bold font-mono tracking-tight ${
                    hasDebt ? 'text-[#DC2626]' : 'text-stone-400'
                  }`}
                >
                  ₹{c.balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-800 transition-colors" />
              </div>
            </button>
          );
        })}

        {customers.length === 0 && (
          <div className="p-8 text-center text-stone-500">
            <p className="text-base font-bold text-[#1C1917]">No pending credit</p>
            <p className="text-xs text-stone-400 mt-1">Tap the mic to add an entry</p>
          </div>
        )}
      </div>
    </section>
  );
};
