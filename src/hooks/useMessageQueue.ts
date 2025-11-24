/**
 * useMessageQueue hook
 * Manages message queue state, timer control, and rate limiting for unified message box
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, UseMessageQueueReturn } from '@/types';

/**
 * Minimum interval between messages (milliseconds)
 * Messages sent more frequently than this will trigger a warning
 */
const MIN_MESSAGE_INTERVAL_MS = 100;

/**
 * Custom hook for message queue management
 * Implements message display with automatic timeout and rate control
 *
 * @returns {UseMessageQueueReturn} Object containing currentMessage, addMessage, and clearMessage
 */
export function useMessageQueue(): UseMessageQueueReturn {
  // State: Current message being displayed (null if no message)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  // Ref: Timer ID for auto-clear timeout
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref: Last message timestamp for rate control
  const lastMessageTimeRef = useRef<number>(0);

  /**
   * Clear the current message and cancel any pending timer
   */
  const clearMessage = useCallback(() => {
    // Clear timer if exists
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Clear message
    setCurrentMessage(null);
  }, []);

  /**
   * Add a new message to the queue
   * Replaces existing message immediately and starts new timeout
   *
   * @param message - Message to display with timeout configuration
   */
  const addMessage = useCallback((message: Message) => {
    // Validation: Check for empty text
    if (!message.text || message.text.trim() === '') {
      console.warn('Invalid message: text is empty');
      return;
    }

    // Validation: Check for positive timeout
    if (message.timeout <= 0) {
      console.warn('Invalid message: timeout must be a positive number');
      return;
    }

    // Rate control: Track message frequency
    const now = Date.now();
    const interval = now - lastMessageTimeRef.current;

    if (
      interval < MIN_MESSAGE_INTERVAL_MS &&
      lastMessageTimeRef.current !== 0
    ) {
      console.warn(
        `High-frequency message detected (${interval}ms interval, minimum: ${MIN_MESSAGE_INTERVAL_MS}ms)`
      );
    }

    lastMessageTimeRef.current = now;

    // Clear existing timer (if any)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Set new message immediately
    setCurrentMessage(message);

    // Start new timeout with message's custom timeout value
    timerRef.current = setTimeout(() => {
      setCurrentMessage(null);
      timerRef.current = null;
    }, message.timeout);
  }, []);

  // Cleanup on unmount: Clear timer to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    currentMessage,
    addMessage,
    clearMessage,
  };
}
