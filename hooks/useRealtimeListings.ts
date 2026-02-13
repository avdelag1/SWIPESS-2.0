
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { fetchListings, dbRowToListing } from '../services/listingService';
import { Listing, ListingCategory } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeListingsState {
  /** All listings fetched from Supabase (across all categories). */
  listings: Listing[];
  /** Whether the initial fetch is still loading. */
  loading: boolean;
  /** A newly arrived listing (via realtime) to show as a notification. */
  newListingAlert: Listing | null;
  /** Dismiss the new-listing notification. */
  dismissAlert: () => void;
  /** Manually add a listing to local state (used as optimistic update after publish). */
  addListing: (listing: Listing) => void;
}

/**
 * Hook that fetches listings from Supabase on mount and subscribes to
 * Supabase Realtime INSERT events on the `listings` table.
 *
 * When a new listing is inserted by any user, it is automatically appended
 * to the local listings array and a notification alert is surfaced.
 */
export function useRealtimeListings(): RealtimeListingsState {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListingAlert, setNewListingAlert] = useState<Listing | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a set of known IDs so we don't duplicate on realtime echo-back
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const data = await fetchListings();
      if (!cancelled) {
        setListings(data);
        knownIdsRef.current = new Set(data.map((l) => l.id));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('listings-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'listings' },
        (payload) => {
          const newRow = payload.new;
          if (!newRow || knownIdsRef.current.has(newRow.id)) return;

          const listing = dbRowToListing(newRow);
          knownIdsRef.current.add(listing.id);

          setListings((prev) => [listing, ...prev]);

          // Show alert notification (auto-dismiss after 5s)
          setNewListingAlert(listing);
          if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = setTimeout(() => {
            setNewListingAlert(null);
          }, 5000);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      channel.unsubscribe();
    };
  }, []);

  const dismissAlert = useCallback(() => {
    setNewListingAlert(null);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
  }, []);

  const addListing = useCallback((listing: Listing) => {
    knownIdsRef.current.add(listing.id);
    setListings((prev) => [listing, ...prev]);
  }, []);

  return { listings, loading, newListingAlert, dismissAlert, addListing };
}
