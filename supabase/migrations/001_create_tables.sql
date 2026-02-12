-- Create ENUM types for PostgreSQL
CREATE TYPE listing_category AS ENUM ('property', 'moto', 'bicycle', 'tasker');
CREATE TYPE transaction_type AS ENUM ('rent', 'sale', 'both', 'project', 'hourly');
CREATE TYPE interaction_action AS ENUM ('like', 'nope', 'view');
CREATE TYPE experience_level AS ENUM ('Entry', 'Intermediate', 'Expert');

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  looking_for listing_category,
  budget TEXT,
  location TEXT,
  reliability_score DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles, but only edit their own
CREATE POLICY "Users can view their own profiles" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category listing_category NOT NULL,
  price TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT,
  description TEXT,
  features TEXT[],
  tags TEXT[],
  transaction_type transaction_type NOT NULL,
  -- Property specific fields
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft INTEGER,
  -- Vehicle specific fields
  year INTEGER,
  mileage TEXT,
  engine_size TEXT,
  -- Bicycle specific fields
  frame_material TEXT,
  weight TEXT,
  -- Tasker specific fields
  skills TEXT[],
  experience_level experience_level,
  hourly_rate TEXT,
  project_fee TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all listings
CREATE POLICY "Users can view all listings" ON listings
  FOR SELECT USING (true);

-- Policy: Users can create listings
CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = owner_id);

-- Messages table (for chat functionality)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create messages
CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Interactions table (track user behavior for recommendations)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  action interaction_action NOT NULL,
  duration INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on interactions
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own interactions
CREATE POLICY "Users can view their own interactions" ON interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create interactions
CREATE POLICY "Users can create interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Preferences table (for ML recommendation profile)
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  affinity_tags TEXT[],
  disliked_tags TEXT[],
  price_preference TEXT,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on preferences
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create preferences
CREATE POLICY "Users can create preferences" ON preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_listing_id ON interactions(listing_id);
CREATE INDEX idx_preferences_user_id ON preferences(user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
