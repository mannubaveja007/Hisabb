'use client';

import React, { useState } from 'react';
import { ManualEntryModal } from '@/components/ManualEntryModal';
import { Header } from '@/components/Header';
import { MicButton } from '@/components/MicButton';
import { CustomerList } from '@/components/CustomerList';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { CustomerDetail } from '@/components/CustomerDetail';
import { WeeklySummary } from '@/components/WeeklySummary';
import { InventoryList } from '@/components/InventoryList';

import { useVoiceEntry } from '@/hooks/useVoiceEntry';
import {
  useCustomerBalances,
  useInventory,
  useWeeklySummary,
  useCustomerHistory,
} from '@/hooks/useData';

export default function HisabbApp() {
  // Navigation screen states: 'home' | 'weekly' | 'inventory'
  const [currentTab, setCurrentTab] = useState<'home' | 'weekly' | 'inventory'>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  // SWR real-time data hooks
  const { customers } = useCustomerBalances();
  const { items: inventory, lowStockCount } = useInventory();
  const { summary: weeklyReminders } = useWeeklySummary();
  const { customerHistory } = useCustomerHistory(selectedCustomerId);

  // Voice entry workflow hook
  const {
    micState,
    transcriptionText,
    draftEntry,
    queuePosition,
    isConfirmOpen,
    error: voiceError,
    toggleRecording,
    saveEntry,
    discardEntry,
    openManualEntry,
  } = useVoiceEntry();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (entry: any) => {
    const saved = await saveEntry(entry);
    if (saved) {
      showToast(
        entry.type === 'credit'
          ? `₹${entry.amount} credit added for ${entry.customer || 'Customer'}!`
          : `₹${entry.amount} payment recorded for ${entry.customer || 'Customer'}!`
      );
    }
    return saved;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col font-sans pb-10">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedCustomerId(null);
          setCurrentTab(tab);
        }}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* Customer Detail View */}
        {selectedCustomerId && customerHistory ? (
          <CustomerDetail
            customer={customerHistory.customer}
            history={customerHistory.history}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : currentTab === 'weekly' ? (
          /* Weekly Summary View */
          <WeeklySummary
            items={weeklyReminders}
            onBack={() => setCurrentTab('home')}
          />
        ) : currentTab === 'inventory' ? (
          /* Inventory View */
          <InventoryList
            items={inventory}
            onBack={() => setCurrentTab('home')}
          />
        ) : (
          /* Home Screen matching screenshot layout */
          <div className="animate-in fade-in duration-150">
            {/* Who Owes What Ledger List */}
            <CustomerList
              customers={customers as any}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onAddCustomer={() => {
                openManualEntry();
                setIsManualEntryOpen(true);
              }}
            />

            {/* Mic Button centered */}
            <div className="py-2">
              <MicButton
                state={micState}
                onPress={toggleRecording}
                subtext={voiceError || undefined}
              />
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Bottom Drawer matching screenshot */}
      <ConfirmSheet
        isOpen={isConfirmOpen}
        entry={draftEntry}
        transcriptionText={transcriptionText}
        onSave={handleSave}
        onDiscard={discardEntry}
        queuePosition={queuePosition}
      />

      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSave={handleSave}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 border border-stone-600 animate-in slide-in-from-bottom duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
