'use client';

import React from 'react';
import { Package } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'weekly' | 'inventory';
  onSelectTab: (tab: 'home' | 'weekly' | 'inventory') => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E7E5E0] px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <button
            onClick={() => onSelectTab('home')}
            className="text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#1C1917]">
                Hisabb
              </span>
              <span className="text-xs bg-[#1C1917] text-[#FAF8F3] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Store
              </span>
            </div>
            <p className="text-xs text-[#57534E] font-medium">Voice Credit Ledger</p>
          </button>
        </div>

        {/* Right side navigation & low-stock badge */}
        <div className="flex items-center gap-2">
          {/* Low stock badge */}
          <button
            onClick={() => onSelectTab('inventory')}
            className={`touch-target px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-sm font-bold ${
              lowStockCount > 0
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm animate-pulse'
                : 'bg-white border-[#E7E5E0] text-[#57534E]'
            }`}
            title="Low Stock Items"
          >
            <Package className="w-4 h-4 text-amber-700" />
            <span>Stock</span>
            {lowStockCount > 0 && (
              <span className="bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full font-black">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Weekly summary button */}
          <button
            onClick={() => onSelectTab('weekly')}
            className={`touch-target px-3 py-1.5 rounded-xl border text-sm font-bold transition-all ${
              currentTab === 'weekly'
                ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-sm'
                : 'bg-white border-[#E7E5E0] text-[#1C1917]'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>
    </header>
  );
};
