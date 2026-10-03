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
        {/* Brand / Logo */}
        <div>
          <button
            onClick={() => onSelectTab('home')}
            className="text-left focus:outline-none group"
          >
            <h1 className="text-3xl font-black tracking-tight text-[#1C1917] leading-none">
              खाता <span className="text-lg font-bold text-stone-500 font-sans tracking-normal">/ Khata</span>
            </h1>
            <p className="text-xs text-[#57534E] font-medium mt-0.5">Hisabb ledger</p>
          </button>
        </div>

        {/* Top-right Actions matching screenshot */}
        <div className="flex items-center gap-3">
          {/* Green outlined stock pill button */}
          <button
            onClick={() => onSelectTab('inventory')}
            className={`touch-target px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all text-sm font-bold ${
              currentTab === 'inventory'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                : 'bg-white border-emerald-600 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
            <span>स्टॉक {lowStockCount > 0 ? lowStockCount : ''}</span>
          </button>

          {/* Weekly tab with underline */}
          <button
            onClick={() => onSelectTab('weekly')}
            className={`relative py-1 text-sm font-bold transition-all text-stone-700 hover:text-stone-900 ${
              currentTab === 'weekly'
                ? 'text-[#1C1917] font-black after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#1C1917]'
                : ''
            }`}
          >
            हफ्ता (Weekly)
          </button>
        </div>
      </div>
    </header>
  );
};
