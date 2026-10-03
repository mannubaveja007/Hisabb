'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { MicButton, MicState } from '@/components/MicButton';
import { CustomerList } from '@/components/CustomerList';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { CustomerDetail } from '@/components/CustomerDetail';
import { WeeklySummary } from '@/components/WeeklySummary';
import { InventoryList } from '@/components/InventoryList';

import {
  CustomerBalanceItem,
  InventoryItem,
  WeeklyReminderItem,
  CustomerHistoryResponse,
  ParsedDraftEntry,
} from '@/types/hisabb';

import {
  MOCK_CUSTOMERS,
  MOCK_INVENTORY,
  MOCK_WEEKLY_SUMMARY,
  MOCK_CUSTOMER_HISTORIES,
  MOCK_DRAFT_ENTRY,
} from '@/mock/data';

export default function HisabbApp() {
  // Navigation screen states: 'home' | 'weekly' | 'inventory'
  const [currentTab, setCurrentTab] = useState<'home' | 'weekly' | 'inventory'>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Ledger and Inventory Data states
  const [customers, setCustomers] = useState<CustomerBalanceItem[]>(MOCK_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [weeklyReminders, setWeeklyReminders] = useState<WeeklyReminderItem[]>(MOCK_WEEKLY_SUMMARY);

  // Mic and Confirm Sheet states
  const [micState, setMicState] = useState<MicState>('idle');
  const [draftEntry, setDraftEntry] = useState<ParsedDraftEntry | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Dynamically resolve API URL: port 3000 proxies to 8000; port 8000 uses direct relative paths
  const getApiUrl = (endpoint: string) => {
    if (typeof window !== 'undefined' && window.location.port === '3000') {
      return `http://localhost:8000${endpoint}`;
    }
    return endpoint;
  };

  // Fetch real data from backend API if available, else keep mock data
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [balRes, invRes, sumRes] = await Promise.allSettled([
          fetch(getApiUrl('/api/customers/balances')),
          fetch(getApiUrl('/api/inventory')),
          fetch(getApiUrl('/api/summary/weekly')),
        ]);

        if (balRes.status === 'fulfilled' && balRes.value.ok) {
          const balData = await balRes.value.json();
          if (balData.customers && balData.customers.length > 0) {
            setCustomers(balData.customers);
          }
        }

        if (invRes.status === 'fulfilled' && invRes.value.ok) {
          const invData = await invRes.value.json();
          if (invData.items && invData.items.length > 0) {
            setInventory(invData.items);
          }
        }

        if (sumRes.status === 'fulfilled' && sumRes.value.ok) {
          const sumData = await sumRes.value.json();
          if (Array.isArray(sumData) && sumData.length > 0) {
            setWeeklyReminders(sumData);
          }
        }
      } catch {
        // Standalone or mock fallback
      }
    }

    loadBackendData();
  }, []);

  const lowStockCount = inventory.filter((item) => item.low_stock).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mic Button handler
  const handleMicPress = async () => {
    if (micState === 'idle') {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.onstop = async () => {
            stream.getTracks().forEach((track) => track.stop());
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            processAudio(audioBlob);
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
          setMicState('recording');
        } else {
          // Fallback simulation for unsupported browsers/contexts
          setMicState('recording');
        }
      } catch {
        // Fallback simulation when mic permission is blocked or non-HTTPS
        setMicState('recording');
      }
    } else if (micState === 'recording') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setMicState('processing');
      } else {
        // Fallback simulation processing
        setMicState('processing');
        setTimeout(() => {
          processAudio(null);
        }, 1200);
      }
    }
  };

  // Audio processing to API or mock
  const processAudio = async (blob: Blob | null) => {
    setMicState('processing');

    if (blob) {
      try {
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');

        const transcribeRes = await fetch(getApiUrl('/api/transcribe'), {
          method: 'POST',
          body: formData,
        });

        if (transcribeRes.ok) {
          const { text } = await transcribeRes.json();
          const parseRes = await fetch(getApiUrl('/api/parse'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });

          if (parseRes.ok) {
            const parseData = await parseRes.json();
            if (parseData.entries && parseData.entries.length > 0) {
              setDraftEntry(parseData.entries[0]);
              setIsConfirmOpen(true);
              setMicState('idle');
              return;
            }
          }
        }
      } catch {
        // Fall through to mock entry demonstration
      }
    }

    // Default demonstration entry with uncertain match ("Did you mean Anita Sharma?")
    setDraftEntry(MOCK_DRAFT_ENTRY);
    setIsConfirmOpen(true);
    setMicState('idle');
  };

  // Save confirmed entry
  const handleSaveEntry = async (entry: ParsedDraftEntry) => {
    setIsConfirmOpen(false);

    // Call backend API if connected
    try {
      await fetch(getApiUrl('/api/entries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              customer_id: entry.customer_match?.id || null,
              raw_customer_name: entry.customer,
              type: entry.type,
              item_id: null,
              raw_item_name: entry.item,
              qty: entry.qty,
              unit: entry.unit,
              amount: entry.amount,
              notes: 'Recorded via Hisabb Voice',
            },
          ],
        }),
      });
    } catch {
      // Offline / mock mode
    }

    // Update local state reactively
    const custName = entry.customer || 'Customer';
    const amount = entry.amount;
    const isCredit = entry.type === 'credit';

    setCustomers((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.name.toLowerCase() === custName.toLowerCase() ||
          (entry.customer_match && c.id === entry.customer_match.id)
      );

      if (idx >= 0) {
        const existing = prev[idx];
        const newCredit = existing.total_credit + (isCredit ? amount : 0);
        const newPaid = existing.total_paid + (!isCredit ? amount : 0);
        const updated = {
          ...existing,
          total_credit: newCredit,
          total_paid: newPaid,
          balance: newCredit - newPaid,
          last_transaction_at: new Date().toISOString(),
        };
        const nextList = [...prev];
        nextList[idx] = updated;
        return nextList;
      } else {
        const newCust: CustomerBalanceItem = {
          id: Date.now(),
          name: custName,
          phone: null,
          total_credit: isCredit ? amount : 0,
          total_paid: !isCredit ? amount : 0,
          balance: isCredit ? amount : -amount,
          last_transaction_at: new Date().toISOString(),
        };
        return [newCust, ...prev];
      }
    });

    showToast(
      isCredit
        ? `₹${amount} credit added for ${custName}!`
        : `₹${amount} payment recorded for ${custName}!`
    );
  };

  const handleDiscardEntry = () => {
    setIsConfirmOpen(false);
    setDraftEntry(null);
  };

  // Customer detail navigation
  const selectedCustomerHistory: CustomerHistoryResponse | null = selectedCustomerId
    ? MOCK_CUSTOMER_HISTORIES[selectedCustomerId] || {
        customer: {
          id: selectedCustomerId,
          name:
            customers.find((c) => c.id === selectedCustomerId)?.name || 'Customer',
          phone:
            customers.find((c) => c.id === selectedCustomerId)?.phone || null,
          balance:
            customers.find((c) => c.id === selectedCustomerId)?.balance || 0,
        },
        history: [],
      }
    : null;

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
        {selectedCustomerId && selectedCustomerHistory ? (
          <CustomerDetail
            customer={selectedCustomerHistory.customer}
            history={selectedCustomerHistory.history}
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
          /* Home Screen */
          <div className="animate-in fade-in duration-150">
            {/* Giant Round Mic Button in center */}
            <MicButton
              state={micState}
              onPress={handleMicPress}
            />

            {/* Who Owes What Ledger List */}
            <CustomerList
              customers={customers}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
            />
          </div>
        )}
      </main>

      {/* Confirmation Bottom Drawer */}
      <ConfirmSheet
        isOpen={isConfirmOpen}
        entry={draftEntry}
        onSave={handleSaveEntry}
        onDiscard={handleDiscardEntry}
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
