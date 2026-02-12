
export enum DashboardMode {
  CLIENT = 'client',
  OWNER = 'owner'
}

export enum ListingCategory {
  PROPERTY = 'property',
  MOTO = 'moto',
  BICYCLE = 'bicycle',
  TASKER = 'tasker'
}

export enum AppView {
  DISCOVERY = 'discovery',
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  GITHUB = 'github',
  PROFILE = 'profile'
}

export enum TransactionType {
  RENT = 'rent',
  SALE = 'sale',
  BOTH = 'both',
  PROJECT = 'project',
  HOURLY = 'hourly'
}

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  price: string;
  location: string;
  image: string;
  description: string;
  features?: string[];
  tags: string[];
  ownerId: string;
  transactionType: TransactionType;
  // Category specific fields
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year?: number;
  mileage?: string;
  engineSize?: string;
  frameMaterial?: string;
  weight?: string;
  // Tasker specific fields
  skills?: string[];
  experienceLevel?: 'Entry' | 'Intermediate' | 'Expert';
  hourlyRate?: string;
  projectFee?: string;
  duration?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  lookingFor: ListingCategory;
  budget: string;
  location: string;
  reliabilityScore: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AIFilters {
  maxPrice?: number;
  category?: ListingCategory;
  location?: string;
  tags?: string[];
  searchQuery?: string;
  transactionType?: TransactionType;
}

export interface InteractionRecord {
  listingId: string;
  action: 'like' | 'nope' | 'view';
  duration: number; // in milliseconds
  timestamp: number;
}

export interface PreferenceProfile {
  affinityTags: string[];
  dislikedTags: string[];
  pricePreference: string;
  reasoning: string;
}
