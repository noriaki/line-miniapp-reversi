/**
 * LIFF Integration Type Definitions
 *
 * Uses official type definitions from @line/liff package directly.
 * Extracts Profile type from liff.getProfile() return type.
 */

import liff from '@line/liff';

/**
 * Profile type from @line/liff
 * Extracted from the return type of liff.getProfile()
 */
export type Profile = Awaited<ReturnType<typeof liff.getProfile>>;

/**
 * LIFF Context Type
 * Defines the shape of LIFF state provided through React Context
 */
export interface LiffContextType {
  /** LIFF SDK initialization complete flag */
  isReady: boolean;

  /** LIFF initialization error (null if successful) */
  error: string | null;

  /** LINE app execution environment check (null if undetermined) */
  isInClient: boolean | null;

  /** Login state (null if undetermined) */
  isLoggedIn: boolean | null;

  /** Profile information (null if not retrieved or not logged in) - Uses official Profile type from @line/liff */
  profile: Profile | null;

  /** Execute login (for external browser) */
  login: () => Promise<void>;

  /** Execute logout */
  logout: () => Promise<void>;
}

/**
 * LIFF Client Interface
 * Type-safe wrapper for LIFF SDK API operations
 */
export interface LiffClientInterface {
  /**
   * Initialize LIFF SDK
   * @param liffId - LIFF ID from environment variables
   * @returns Promise that resolves on success, rejects on failure
   * @throws Error if LIFF ID is not set or initialization fails
   */
  initialize(liffId: string): Promise<void>;

  /**
   * Check if running inside LINE app
   * @returns true if inside LINE app, false if external browser
   */
  isInClient(): boolean;

  /**
   * Check login state
   * @returns true if logged in, false if not logged in
   */
  isLoggedIn(): boolean;

  /**
   * Execute login (for external browser)
   * @returns Promise that starts login flow
   */
  login(): Promise<void>;

  /**
   * Execute logout
   * @returns Promise that completes logout
   */
  logout(): Promise<void>;

  /**
   * Get profile information - Returns official Profile type from @line/liff
   * @returns Promise with profile information
   * @throws Error if not logged in or API call fails
   */
  getProfile(): Promise<Profile>;
}
