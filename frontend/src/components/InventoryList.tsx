'use client';

import React from 'react';
import { InventoryItem } from '@/types/hisabb';
import { Package, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onBack: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onBack,
}) => {
  const lowStockItems = items.filter((it) => it.low_stock);

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

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-[#1C1917]">दुकान का सामान (Stock)</h2>
          <p className="text-xs text-stone-500 font-semibold">
            कुल {items.length} आइटम · {lowStockItems.length} में कम स्टॉक
          </p>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const isLow = item.low_stock;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-2 transition-all shadow-xs flex items-center justify-between ${
                isLow
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-[#E7E5E0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLow ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1C1917]">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-850 bg-amber-200/70 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        कम स्टॉक (मंगवाना है)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                        पर्याप्त स्टॉक
                      </span>
                    )}
                    <span className="text-xs text-stone-400">
                      न्यूनतम: {item.min_stock_threshold} {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity in Stock */}
              <div className="text-right pl-3">
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    isLow ? 'text-amber-900' : 'text-stone-900'
                  }`}
                >
                  {item.current_stock}
                </div>
                <span className="text-xs font-bold text-stone-500 uppercase">
                  {item.unit}
                </span>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="bg-white border border-stone-200 p-8 text-center rounded-2xl text-stone-500">
            सामान की सूची खाली है
          </div>
        )}
      </div>
    </div>
  );
};
