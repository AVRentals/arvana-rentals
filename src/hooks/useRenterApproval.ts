import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { hasApprovedApplication, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Is the person browsing an approved renter?
 *
 * This is what decides whether a car is a real product page or an invitation
 * to apply. Every "Book"/"Reserve" control routes on it, so the two audiences
 * get completely different journeys from the same components:
 *
 *   not approved → the application form (we need documents first)
 *   approved     → the car page, dates, and booking
 *
 * The answer is cached per email for the session — this gets called by every
 * car card on a listing page and there's no reason to ask the database once
 * per card.
 */
const cache = new Map<string, boolean>();

export const useRenterApproval = () => {
  const { user, profile } = useAuth();
  const email = user?.email || profile?.email || '';
  const [approved, setApproved] = useState<boolean>(() => cache.get(email) ?? false);
  const [checked, setChecked] = useState<boolean>(() => cache.has(email));

  useEffect(() => {
    let cancelled = false;

    if (!email || !isSupabaseConfigured) {
      setApproved(false);
      setChecked(true);
      return;
    }
    if (cache.has(email)) {
      setApproved(cache.get(email)!);
      setChecked(true);
      return;
    }

    hasApprovedApplication(email).then(ok => {
      cache.set(email, ok);
      if (cancelled) return;
      setApproved(ok);
      setChecked(true);
    });

    return () => { cancelled = true; };
  }, [email]);

  return { approved, checked };
};
