/**
 * LIFF Provider
 *
 * Client Component that initializes LIFF SDK and provides LIFF state
 * to the application through React Context.
 *
 * This component directly uses @line/liff SDK APIs without wrapper classes.
 * Following official LIFF SDK patterns for Next.js integration.
 */

'use client';

import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import { LiffContext } from './LiffContext';
import type { Profile } from '@/lib/liff/types';

interface LiffProviderProps {
  children: React.ReactNode;
}

/**
 * LiffProvider Component
 * Initializes LIFF SDK on mount and provides LIFF state to children
 *
 * Uses official @line/liff SDK APIs directly without abstraction layers.
 */
export function LiffProvider({ children }: LiffProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInClient, setIsInClient] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    let initialized = false; // Track if this effect has started initialization

    const initializeLiff = async () => {
      // Prevent duplicate initialization within this effect
      if (initialized) {
        return;
      }
      initialized = true;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      // Check if LIFF_ID is set
      if (!liffId) {
        console.warn('LIFF_ID not set: LIFF features are disabled');
        if (isMounted) {
          setIsReady(true);
        }
        return;
      }

      try {
        // Initialize LIFF SDK directly
        await liff.init({ liffId });

        if (!isMounted) {
          return; // Don't update state if unmounted
        }

        // Check environment and login status using liff API directly
        const inClient = liff.isInClient();
        const loggedIn = liff.isLoggedIn();

        setIsInClient(inClient);
        setIsLoggedIn(loggedIn);

        // Try to get profile if logged in
        if (loggedIn) {
          try {
            const userProfile = await liff.getProfile();
            if (isMounted) {
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error('Profile retrieval failed:', profileError);
            if (isMounted) {
              setError(
                'Failed to retrieve profile information. Default icon will be displayed.'
              );
            }
            // Keep isReady=true even if profile fails
          }
        }

        if (isMounted) {
          setIsReady(true);
        }
      } catch (initError) {
        console.error('LIFF initialization failed:', initError);
        if (isMounted) {
          setError(
            'LINE integration is unavailable. You can continue playing in normal mode.'
          );
          setIsReady(true); // Set ready even on error (fallback mode)
        }
      }
    };

    initializeLiff();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function for external browser - uses liff.login() directly
  const login = () => {
    if (!isReady) {
      throw new Error('LIFF not initialized');
    }
    liff.login();
  };

  // Logout function - uses liff.logout() directly
  const logout = () => {
    if (!isReady) {
      throw new Error('LIFF not initialized');
    }
    liff.logout();
    setProfile(null);
    setIsLoggedIn(false);
  };

  const contextValue = {
    isReady,
    error,
    isInClient,
    isLoggedIn,
    profile,
    login,
    logout,
  };

  return (
    <LiffContext.Provider value={contextValue}>{children}</LiffContext.Provider>
  );
}
