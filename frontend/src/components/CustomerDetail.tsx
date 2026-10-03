'use client';

import React from 'react';
import { CustomerHistoryProfile, CustomerHistoryRecord } from '@/types/hisabb';
import { ArrowLeft, MessageCircle, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface CustomerDetailProps {
  customer: CustomerHistoryProfile;
  history: CustomerHistoryRecord[];
  onBack: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  history,
  onBack,
}) => {
  const hasDebt = customer.balance > 0;

  const handleWhatsAppReminder = () => {
    const text = `Hello ${customer.name}, your outstanding store credit balance is ₹${customer.balance.toFixed(
      2
    )}. Please arrange payment when convenient. Thank you!`;
    const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-28">
      {/* Top back navigation */}
      <button
        onClick={onBack}
        className="touch-target inline-flex items-center gap-2 text-stone-700 font-bold mb-4 active:scale-95"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Ledger (वापस)</span>
      </button>

      {/* Customer Header Card & Big Balance */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm mb-5 text-center">
        <h2 className="text-2xl font-black text-[#1C1917]">{customer.name}</h2>
        {customer.phone && (
          <p className="text-sm font-semibold text-stone-500 font-mono mt-0.5">
            +91 {customer.phone}
          </p>
        )}

        <div className="my-5 py-4 border-y border-stone-100 bg-[#FAF8F3]/60 rounded-2xl">
          <span className="text-xs font-black uppercase tracking-wider text-stone-500 block mb-1">
            Net Balance · कुल बाकी
          </span>
          <div
            className={`text-4xl font-black font-mono tracking-tight ${
              hasDebt ? 'text-[#DC2626]' : 'text-stone-400'
            }`}
          >
            ₹{customer.balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-xs font-bold text-stone-500 mt-1 block">
            {hasDebt ? 'Udhaar Baki (Owed to Store)' : 'Hisabb Chukta (Settled)'}
          </span>
        </div>

        {/* WhatsApp Reminder Button */}
        {hasDebt && (
          <button
            onClick={handleWhatsAppReminder}
            className="w-full touch-target bg-[#25D366] hover:bg-[#1fa851] text-stone-950 font-black text-lg py-4 rounded-2xl shadow-md flex items-center justify-center gap-2.5 active:scale-95 transition-all"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>Send WhatsApp Reminder (तगादा भेजें)</span>
          </button>
        )}
      </div>

      {/* Transaction Timeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Clock className="w-4 h-4 text-stone-500" />
          <h3 className="text-lg font-black text-[#1C1917]">Transaction History (लेन-देन)</h3>
        </div>

        {history.map((record) => {
          const isCredit = record.type === 'credit';
          const dateStr = new Date(record.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={record.id}
              className="bg-white border border-[#E7E5E0] rounded-2xl p-4 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isCredit ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isCredit ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1C1917]">
                      {isCredit ? 'Udhaar Taken (उधार)' : 'Payment Received (जमा)'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{dateStr}</span>
                  </div>
                  {record.item_name && (
                    <p className="text-sm font-semibold text-stone-700 mt-0.5">
                      {record.item_name}
                      {record.qty ? ` · ${record.qty} ${record.unit || ''}` : ''}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-stone-500 italic mt-0.5">{record.notes}</p>
                  )}
                </div>
              </div>

              <div className="text-right pl-2">
                <span
                  className={`text-xl font-black font-mono ${
                    isCredit ? 'text-[#DC2626]' : 'text-green-700'
                  }`}
                >
                  {isCredit ? '+' : '-'}₹{record.amount}
                </span>
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="bg-white border border-stone-200 p-6 text-center rounded-2xl text-stone-500">
            No transactions on record
          </div>
        )}
      </div>
    </div>
  );
};
