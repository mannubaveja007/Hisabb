'use client';

import React from 'react';
import { Mic, Loader2, Square } from 'lucide-react';

export type MicState = 'idle' | 'recording' | 'processing';

interface MicButtonProps {
  state: MicState;
  onPress: () => void;
  subtext?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  onPress,
  subtext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative flex items-center justify-center">
        {/* Pulsing visual glow in recording mode */}
        {state === 'recording' && (
          <div className="absolute w-36 h-36 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
        )}

        <button
          onClick={onPress}
          disabled={state === 'processing'}
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 border-4 ${
            state === 'recording'
              ? 'bg-[#DC2626] border-red-300 text-white animate-mic-pulse shadow-red-500/40'
              : state === 'processing'
              ? 'bg-[#44403C] border-stone-500 text-stone-200 cursor-not-allowed shadow-stone-500/20'
              : 'bg-[#1C1917] border-stone-300 text-white hover:bg-stone-800 shadow-stone-900/30'
          }`}
          aria-label={
            state === 'recording'
              ? 'Stop Recording'
              : state === 'processing'
              ? 'Processing'
              : 'Tap to Record'
          }
        >
          {state === 'recording' ? (
            <>
              <Square className="w-10 h-10 fill-current text-white animate-pulse" />
              <span className="text-xs font-bold mt-1 uppercase tracking-wider">
                Stop
              </span>
            </>
          ) : state === 'processing' ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-white" />
              <span className="text-xs font-bold mt-1 tracking-wider">
                Thinking...
              </span>
            </>
          ) : (
            <>
              <Mic className="w-12 h-12 text-white" />
              <span className="text-xs font-bold mt-1 tracking-wider uppercase">
                Speak
              </span>
            </>
          )}
        </button>
      </div>

      {/* Helper label beneath the giant mic */}
      <div className="mt-3 text-center">
        <p className="text-base font-bold text-[#1C1917]">
          {state === 'recording'
            ? 'Listening to speech...'
            : state === 'processing'
            ? 'Preparing ledger entry...'
            : 'Tap to Speak (Voice Entry)'}
        </p>
        <p className="text-xs text-[#57534E] mt-0.5">
          {subtext ||
            (state === 'idle'
              ? 'e.g. "Sharma 2kg sugar on credit, 90 rupees" or "Gupta paid 500"'
              : 'Tap red button when finished')}
        </p>
      </div>
    </div>
  );
};
