/**
 * LIFF Client - Type-safe wrapper for LIFF SDK API
 *
 * Provides abstraction layer for LIFF SDK operations with proper error handling
 * and TypeScript type safety. This module handles low-level LIFF API calls
 * and error boundary management.
 */

import liff from '@line/liff';
import type { LiffClientInterface, Profile } from './types';

/**
 * LiffClient class implementing type-safe LIFF SDK wrapper
 */
export class LiffClient implements LiffClientInterface {
  /**
   * Initialize LIFF SDK
   * @param liffId - LIFF ID from environment variables
   * @returns Promise that resolves on success, rejects on failure
   * @throws Error if LIFF ID is not set or initialization fails
   */
  async initialize(liffId: string): Promise<void> {
    await liff.init({ liffId });
  }

  /**
   * Check if running inside LINE app
   * @returns true if inside LINE app, false if external browser
   */
  isInClient(): boolean {
    return liff.isInClient();
  }

  /**
   * Check login state
   * @returns true if logged in, false if not logged in
   */
  isLoggedIn(): boolean {
    return liff.isLoggedIn();
  }

  /**
   * Execute login (for external browser)
   * @returns Promise that starts login flow
   */
  async login(): Promise<void> {
    liff.login();
  }

  /**
   * Execute logout
   * @returns Promise that completes logout
   */
  async logout(): Promise<void> {
    liff.logout();
  }

  /**
   * Get profile information - Returns official Profile type from @line/liff
   * @returns Promise with profile information
   * @throws Error if not logged in or API call fails
   */
  async getProfile(): Promise<Profile> {
    return await liff.getProfile();
  }
}
