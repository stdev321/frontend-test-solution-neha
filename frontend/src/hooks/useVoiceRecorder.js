import { useState, useRef, useCallback, useEffect } from 'react';
import { speechToText } from '../services/api';

/**
 * Voice recording helper hook extracted from ChatArea.
 * It owns microphone recording, speech-to-text, and related UI state.
 *
 * @param {Object}   params
 * @param {Function} params.setInputMessage  – ChatArea's setter so we can append transcribed text.
 * @param {String}   params.currentText        – live value of the textbox
 * @param {Function} params.onTranscriptionDone – Optional callback to call when transcription is done.
 * @param {Function} params.onLongRecording    – Optional callback to call when a long recording is done.
 * @param {Object}   params.suppressSilenceErrorRef – Ref to flag for suppressing "No speech detected" errors
 * @returns {Object} state + helpers
 */
export function useVoiceRecorder({
  setInputMessage,
  currentText,
  onTranscriptionDone,
  onLongRecording,
  suppressSilenceErrorRef,
}) {
  const [isListening, setIsListening]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState('');

  // Refs to hold recorder & chunks across renders
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const snapshotTextRef  = useRef('');
  /* ----- 30-sec failsafe refs ----- */
  const longRecTimerRef      = useRef(null);
  const longRecTriggeredRef  = useRef(false);

  // Hoisted helper – clears the 30-s timer and flag
  function clearLongTimer() {
    if (longRecTimerRef.current) {
      clearTimeout(longRecTimerRef.current);
      longRecTimerRef.current = null;
    }
    longRecTriggeredRef.current = false;
  }

  // Holds the full text (typed + transcribed) that should be sent
  const builtMessageRef  = useRef('');

  // Keep the latest textarea value so we can prepend it to STT text
  const prevTextRef      = useRef('');
  const currentTextRef = useRef('');
  const liveTextRef = useRef('');

  useEffect(() => { prevTextRef.current = currentTextRef.current; }, [currentTextRef.current]);
  useEffect(() => { liveTextRef.current = currentText; }, [currentText]);

  const setInputMessageSafe = (fnOrText) => {
    setInputMessage((prev) => {
      const next = typeof fnOrText === 'function' ? fnOrText(prev) : fnOrText;
      prevTextRef.current = next;
      return next;
    });
  };

  /* ---------------- internal helpers ---------------- */
  const transcribeAudio = useCallback(async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) return;

    // Very simple silence detection before sending to backend
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer  = await audioBlob.arrayBuffer();
      const audioBuffer  = await new Promise((res, rej) => {
        audioContext.decodeAudioData(arrayBuffer, res, rej);
      });
      const channelData  = audioBuffer.getChannelData(0);
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i += 100) {
        const sample = channelData[i];
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / (channelData.length / 100));
      if (rms < 0.02) {
        const alreadyTyped = liveTextRef.current.trim() !== '';
        const shouldSuppressError = suppressSilenceErrorRef?.current || false;

        // Show the "No speech" warning ONLY if nothing was typed AND not suppressing errors
        if (!shouldSuppressError) {
          setRecordingError(alreadyTyped ? '' : 'No speech detected.');
        }

        // Let the parent know the STT step is done (empty result)
        if (onTranscriptionDone) onTranscriptionDone('');
        return;
      }
    } catch (_) { /* ignore decode errors */ }

    setIsTranscribing(true);
    setRecordingError('');
    try {
      const result = await speechToText(audioBlob, 'recording.webm');
      if (result?.text && setInputMessageSafe) {
        const base    = liveTextRef.current.trim();
        const newText = base ? base + ' ' + result.text : result.text;
        builtMessageRef.current = newText;
        setInputMessageSafe(newText);
      } else {
        const shouldSuppressError = suppressSilenceErrorRef?.current || false;
        if (!shouldSuppressError) {
          setRecordingError('No speech detected in recording.');
        }
      }
    } catch (err) {
      setRecordingError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
      if (onTranscriptionDone) onTranscriptionDone(builtMessageRef.current.trim());
      builtMessageRef.current = '';
    }
  }, [setInputMessage, onTranscriptionDone]);

  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    snapshotTextRef.current = prevTextRef.current;
    try {
      setRecordingError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (longRecTriggeredRef.current && onLongRecording) {
          onLongRecording(blob);              // hand control to parent
        } else {
          await transcribeAudio(blob);        // normal path
        }
        audioChunksRef.current = [];          // <-- prevent double STT
        clearLongTimer();
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();

      /* 30-second safety timer */
      clearLongTimer();                 // clear stale timer first
      longRecTimerRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          longRecTriggeredRef.current = true;   // signal onstop to skip auto-STT
          mediaRecorder.stop();                 // pauses recording
        }
      }, 30_000);
    } catch (err) {
      setRecordingError('Failed to access microphone. Please check permissions.');
      setIsListening(false);
    }
  }, [transcribeAudio]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearLongTimer();
    } else if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await transcribeAudio(blob);
    }
  }, [transcribeAudio]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      stopRecording();
    } else {
      setIsListening(true);
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  return {
    isListening, setIsListening,
    isTranscribing, setIsTranscribing,
    recordingError, setRecordingError,
    startRecording,
    stopRecording,
    toggleListening,
  };
} 