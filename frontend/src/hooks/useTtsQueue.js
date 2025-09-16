import { useState, useEffect, useRef } from 'react';

/**
 * Centralised speech-queue manager (extracted from ChatArea).
 * Keeps behaviour identical to the original in-component logic.
 */
export function useTtsQueue(messages, autoPlayAiAudio, isThinking /* reserved */) {
  const [speakQueue, setSpeakQueue] = useState([]);
  const prevMsgLenRef = useRef(messages.length);

  /* enqueue new assistant messages when they arrive */
  useEffect(() => {
    if (!autoPlayAiAudio) return;          // muted
    if (messages.length > prevMsgLenRef.current) {
      const newIdx = [];
      for (let i = prevMsgLenRef.current; i < messages.length; i++) {
        if (messages[i].role === 'assistant') newIdx.push(i);
      }
      if (newIdx.length) setSpeakQueue(q => [...q, ...newIdx]);
      prevMsgLenRef.current = messages.length;
    } else if (messages.length < prevMsgLenRef.current) {
      // conversation reset
      prevMsgLenRef.current = messages.length;
      setSpeakQueue([]);
    }
  }, [messages, autoPlayAiAudio]);

  /* clear queue when muted */
  useEffect(() => {
    if (!autoPlayAiAudio) setSpeakQueue([]);
  }, [autoPlayAiAudio]);

  /* retro-play Dr Carol welcome */
  useEffect(() => {
    if (autoPlayAiAudio && messages.length === 1) {
      const hasUserMsg = messages.some(m => m.role === 'user' || m.sender_type === 'USER');
      if (!hasUserMsg &&
          (messages[0].role === 'assistant' || messages[0].sender_type === 'ASSISTANT')) {
        setSpeakQueue(prev => (prev.length === 0 ? [0] : prev));
      }
    }
  }, [autoPlayAiAudio, messages.length]);

  /* helper for ChatArea's manual send */
  const clearQueue = () => {
    setSpeakQueue([]);
    prevMsgLenRef.current = messages.length;
  };

  return { speakQueue, setSpeakQueue, clearQueue };
} 