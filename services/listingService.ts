
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Listing, ListingCategory, TransactionType } from '../types';

/**
 * Maps a Supabase DB row (snake_case) to the app's Listing type (camelCase).
 */
export function dbRowToListing(row: Record<string, any>): Listing {
  return {
    id: row.id,
    title: row.title,
    category: row.category as ListingCategory,
    price: row.price,
    location: row.location,
    image: row.image || '',
    description: row.description || '',
    features: row.features || [],
    tags: row.tags || [],
    ownerId: row.owner_id,
    transactionType: (row.transaction_type as TransactionType) || TransactionType.SALE,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    sqft: row.sqft ?? undefined,
    year: row.year ?? undefined,
    mileage: row.mileage ?? undefined,
    engineSize: row.engine_size ?? undefined,
    frameMaterial: row.frame_material ?? undefined,
    weight: row.weight ?? undefined,
    skills: row.skills || [],
    experienceLevel: row.experience_level ?? undefined,
    hourlyRate: row.hourly_rate ?? undefined,
    projectFee: row.project_fee ?? undefined,
    duration: row.duration ?? undefined,
  };
}

/**
 * Maps the app's Listing type (camelCase) to a Supabase DB row (snake_case).
 */
export function listingToDbRow(listing: Listing): Record<string, any> {
  const row: Record<string, any> = {
    title: listing.title,
    category: listing.category,
    price: listing.price,
    location: listing.location,
    image: listing.image,
    description: listing.description,
    features: listing.features || [],
    tags: listing.tags || [],
    owner_id: listing.ownerId,
    transaction_type: listing.transactionType,
  };

  // Category-specific fields
  if (listing.bedrooms != null) row.bedrooms = listing.bedrooms;
  if (listing.bathrooms != null) row.bathrooms = listing.bathrooms;
  if (listing.sqft != null) row.sqft = listing.sqft;
  if (listing.year != null) row.year = listing.year;
  if (listing.mileage != null) row.mileage = listing.mileage;
  if (listing.engineSize != null) row.engine_size = listing.engineSize;
  if (listing.frameMaterial != null) row.frame_material = listing.frameMaterial;
  if (listing.weight != null) row.weight = listing.weight;
  if (listing.skills && listing.skills.length > 0) row.skills = listing.skills;
  if (listing.experienceLevel != null) row.experience_level = listing.experienceLevel;
  if (listing.hourlyRate != null) row.hourly_rate = listing.hourlyRate;
  if (listing.projectFee != null) row.project_fee = listing.projectFee;
  if (listing.duration != null) row.duration = listing.duration;

  return row;
}

/**
 * Fetches all listings from Supabase, optionally filtered by category.
 */
export async function fetchListings(category?: ListingCategory): Promise<Listing[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  let query = supabase.from('listings').select('*').order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch listings:', error);
    return [];
  }

  return (data || []).map(dbRowToListing);
}

/**
 * Publishes a listing to Supabase. Returns the inserted listing or null on failure.
 */
export async function publishListing(listing: Listing): Promise<Listing | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const row = listingToDbRow(listing);

  const { data, error } = await supabase
    .from('listings')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Failed to publish listing:', error);
    return null;
  }

  return data ? dbRowToListing(data) : null;
}
