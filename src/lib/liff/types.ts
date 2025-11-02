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
  login: () => void;

  /** Execute logout */
  logout: () => void;
}
