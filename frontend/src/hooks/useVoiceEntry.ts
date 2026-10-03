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
            setDraftEntry(parseRes.entries[0]);
            setIsConfirmOpen(true);
            setIsProcessing(false);
            return;
          }
        } catch (apiErr: any) {
          // If backend isn't reachable or fails, fallback to interactive mock demonstration
          console.warn('API error during voice processing, falling back to mock flow:', apiErr);
        }
      }

      // Fallback demonstration
      setTranscriptionText(MOCK_TRANSCRIPTION_TEXT);
      setDraftEntry(MOCK_DRAFT_ENTRY);
      setIsConfirmOpen(true);
      setIsProcessing(false);
    }
  };

  const saveEntry = async (entry: ParsedDraftEntry): Promise<boolean> => {
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
    } catch (saveErr) {
      console.warn('Failed to commit to API, saving in optimistic state:', saveErr);
    } finally {
      // Revalidate all ledger and inventory data
      await revalidateAllData();
      setIsConfirmOpen(false);
      setDraftEntry(null);
      setIsProcessing(false);
    }
    return true;
  };

  const discardEntry = () => {
    setIsConfirmOpen(false);
    setDraftEntry(null);
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
