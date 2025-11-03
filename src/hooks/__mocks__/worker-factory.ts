/**
 * Mock Worker Factory for tests
 * Avoids import.meta.url parsing issues in Jest
 */

import type { AIWorkerRequest, AIWorkerResponse } from '@/lib/ai/types';

/**
 * Mock Worker class implementation for testing
 * Implements the Worker interface with test helper methods
 */
export class MockWorker implements Worker {
  url: string | URL;
  onmessage: ((this: Worker, ev: MessageEvent) => void) | null = null;
  onmessageerror: ((this: Worker, ev: MessageEvent) => void) | null = null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => void) | null = null;
  private listeners: Map<string, Set<EventListenerOrEventListenerObject>>;
  private isTerminated = false;

  constructor(scriptURL: string | URL, _options?: WorkerOptions) {
    this.url = scriptURL;
    this.listeners = new Map();
  }

  postMessage(_message: AIWorkerRequest): void {
    if (this.isTerminated) {
      throw new Error('Worker has been terminated');
    }
    // Test can override this behavior in individual tests
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  terminate(): void {
    this.isTerminated = true;
    this.listeners.clear();
  }

  dispatchEvent(_event: Event): boolean {
    return false;
  }

  // Test helper: simulate message from worker
  simulateMessage(data: AIWorkerResponse): void {
    const event = new MessageEvent('message', { data });
    this.listeners.get('message')?.forEach((listener) => {
      if (typeof listener === 'function') {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    });
    if (this.onmessage) {
      this.onmessage.call(this, event);
    }
  }

  // Test helper: check if worker is terminated
  isWorkerTerminated(): boolean {
    return this.isTerminated;
  }
}

/**
 * Mock function for createAIWorker
 * Default returns null, can be configured per test
 */
export const createAIWorker = jest.fn<Worker | null, []>(() => null);
