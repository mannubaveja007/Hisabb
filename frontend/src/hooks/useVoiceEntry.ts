'use client';

import { useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { api } from '@/lib/api';
import { ParsedDraftEntry, EntryInput } from '@/types/hisabb';
import { revalidateAllData } from '@/hooks/useData';
import { MOCK_DRAFT_ENTRY, MOCK_TRANSCRIPTION_TEXT } from '@/mock/data';

export interface UseVoiceEntryResult {
  micState: 'idle' | 'recording' | 'processing';
  transcriptionText: string;
  draftEntry: ParsedDraftEntry | null;
  isConfirmOpen: boolean;
  error: string | null;
  toggleRecording: () => Promise<void>;
  saveEntry: (entry: ParsedDraftEntry) => Promise<boolean>;
  discardEntry: () => void;
  openManualEntry: () => void;
}

export function useVoiceEntry(): UseVoiceEntryResult {
  const { state: recorderState, error: recorderError, start, stop } = useRecorder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [draftEntry, setDraftEntry] = useState<ParsedDraftEntry | null>(null);
  const [pendingEntries, setPendingEntries] = useState<ParsedDraftEntry[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combined mic state
  const micState: 'idle' | 'recording' | 'processing' =
    recorderState === 'recording'
      ? 'recording'
      : isProcessing || recorderState === 'processing'
      ? 'processing'
      : 'idle';

  const toggleRecording = async () => {
    setError(null);

    if (recorderState === 'idle') {
      await start();
    } else if (recorderState === 'recording') {
      const blob = await stop();
      setIsProcessing(true);

      if (blob && blob.size > 0) {
        try {
          // 1. Transcribe audio
          const transcribeRes = await api.transcribe(blob);
          const text = transcribeRes.text || '';
          setTranscriptionText(text);

          // 2. Parse text with Ollama
          const parseRes = await api.parse(text);
          if (parseRes.entries && parseRes.entries.length > 0) {
            const validEntries = parseRes.entries.filter((entry) => entry.confidence > 0);
            if (validEntries.length === 0) {
              throw new Error('We could not confidently understand that entry. Please try again or add it manually.');
            }
            setPendingEntries(validEntries.slice(1));
            setDraftEntry(validEntries[0]);
            setIsConfirmOpen(true);
            setIsProcessing(false);
            return;
          }
          throw new Error('No ledger entry was found in that recording. Please try again.');
        } catch (apiErr: any) {
          setError(apiErr instanceof Error ? apiErr.message : 'Voice entry processing failed. Please try again.');
        }
      } else {
        setError('No audio was recorded. Please try again.');
      }

      setIsProcessing(false);
    }
  };

  const saveEntry = async (entry: ParsedDraftEntry): Promise<boolean> => {
    const requiresCustomer = entry.type === 'credit' || entry.type === 'payment';
    if (entry.confidence <= 0 || (requiresCustomer && !entry.customer?.trim()) || (requiresCustomer && entry.amount <= 0)) {
      setError('Please confirm a customer and a valid amount before saving.');
      return false;
    }

    setIsProcessing(true);
    try {
      const payload: EntryInput = {
        customer_id: entry.customer_match?.id || null,
        raw_customer_name: entry.customer,
        type: entry.type,
        item_id: null,
        raw_item_name: entry.item,
        qty: entry.qty,
        unit: entry.unit,
        amount: entry.amount,
        notes: 'Voice logged entry via Hisabb',
      };

      await api.createEntries([payload]);
      await revalidateAllData();
      if (pendingEntries.length > 0) {
        setDraftEntry(pendingEntries[0]);
        setPendingEntries((entries) => entries.slice(1));
      } else {
        setIsConfirmOpen(false);
        setDraftEntry(null);
      }
      setIsProcessing(false);
      return true;
    } catch (saveErr) {
      setError(saveErr instanceof Error ? saveErr.message : 'Could not save this entry. Please try again.');
      setIsProcessing(false);
      return false;
    }
  };

  const discardEntry = () => {
    setIsConfirmOpen(false);
    setDraftEntry(null);
    setPendingEntries([]);
  };

  const openManualEntry = () => {
    setTranscriptionText(MOCK_TRANSCRIPTION_TEXT);
    setDraftEntry(MOCK_DRAFT_ENTRY);
    setIsConfirmOpen(true);
  };

  return {
    micState,
    transcriptionText,
    draftEntry,
    isConfirmOpen,
    error: error || recorderError,
    toggleRecording,
    saveEntry,
    discardEntry,
    openManualEntry,
  };
}
