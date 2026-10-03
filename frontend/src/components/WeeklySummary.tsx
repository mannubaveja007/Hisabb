'use client';

import React from 'react';
import { WeeklyReminderItem } from '@/types/hisabb';
import { MessageCircle, ArrowLeft, CalendarCheck } from 'lucide-react';

interface WeeklySummaryProps {
  items: WeeklyReminderItem[];
  onBack: () => void;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  items,
  onBack,
}) => {
  const totalPending = items.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-28">
      {/* Back button */}
      <button
        onClick={onBack}
        className="touch-target inline-flex items-center gap-2 text-stone-700 font-bold mb-3 active:scale-95"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>वापस (Back)</span>
      </button>

      {/* Header Banner */}
      <div className="bg-[#1C1917] text-white rounded-3xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-2.5 text-stone-300 text-xs font-bold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4 text-emerald-400" />
          <span>हफ्ते का तगादा (Weekly Reminders)</span>
        </div>
        <h2 className="text-2xl font-black">कुल बकाया उधार</h2>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-black font-mono text-emerald-400">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-sm text-stone-300 font-medium">
            {items.length} ग्राहकों से बाकी
          </span>
        </div>
      </div>

      {/* Pending Customer List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.customer.id}
            className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-[#1C1917]">
                  {item.customer.name}
                </h3>
                {item.customer.phone && (
                  <p className="text-xs font-semibold text-stone-500 font-mono mt-0.5">
                    +91 {item.customer.phone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#DC2626] font-mono block">
                  ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">
                  बाकी रकम
                </span>
              </div>
            </div>

            {/* Reminder text preview */}
            <div className="bg-[#FAF8F3] border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed font-medium">
              &ldquo;{item.reminder_text}&rdquo;
            </div>

            {/* Large Send Reminder WhatsApp Button */}
            <a
              href={item.wa_link}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target w-full bg-[#25D366] hover:bg-[#1fa851] text-stone-950 font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-sm transition-all text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>व्हाट्सएप पर तगादा भेजें</span>
            </a>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-white border border-stone-200 p-8 text-center rounded-3xl text-stone-500">
            <p className="text-lg font-bold text-[#1C1917]">कोई बकाया नहीं है</p>
            <p className="text-sm text-stone-500 mt-1">सभी ग्राहकों का हिसाब साफ है!</p>
          </div>
        )}
      </div>
    </div>
  );
};
