'use client';

import { useState, useRef, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'processing';

export interface UseRecorderResult {
  state: RecorderState;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  reset: () => void;
}

export function useRecorder(): UseRecorderResult {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Determine supported mimeType (webm/opus preferred)
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // 100ms timeslice
      setState('recording');
    } catch (err: any) {
      const message =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow mic access in your browser settings.'
          : err.message || 'Failed to start microphone recording.';
      setError(message);
      setState('idle');
    }
  }, []);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setState('idle');
        resolve(null);
        return;
      }

      setState('processing');

      recorder.onstop = () => {
        try {
          const type = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type });
          audioChunksRef.current = [];

          // Stop all audio stream tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          setState('idle');
          resolve(blob);
        } catch (e: any) {
          setError(e.message || 'Error creating audio blob');
          setState('idle');
          resolve(null);
        }
      };

      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setState('idle');
    setError(null);
  }, []);

  return {
    state,
    error,
    start,
    stop,
    reset,
  };
}
