import { useState, useEffect, useRef } from 'react';

/**
 * Holds auto-record toggle state plus the "pending-send" flag.
 * Pure state holder: actual microphone side-effects remain in ChatArea
 * so behaviour is unchanged.
 */
export function useAutoRecord(
  isThinking,
  isConnected,
  /* isListening (unused for now) */ _isListening,
  inputMessage
) {
  const [autoRecord, setAutoRecord] = useState(false);
  const autoRecordRef = useRef(false);

  const [pendingSend, setPendingSend] = useState(false);
  const pendingSendRef = useRef(false);

  /* keep refs in sync so ChatArea's existing effects still work */
  useEffect(() => { autoRecordRef.current = autoRecord; }, [autoRecord]);
  useEffect(() => { pendingSendRef.current = pendingSend; }, [pendingSend]);

  return {
    autoRecord,
    setAutoRecord,
    autoRecordRef,
    pendingSend,
    setPendingSend,
    pendingSendRef,
  };
} 