# SWIPESS-2.0 Database Schema Reference

## Table: `profiles`
User profiles (extends Supabase auth.users)

```sql
id UUID (Primary Key) - User ID from auth.users
name TEXT - Display name
avatar TEXT - Avatar image URL
bio TEXT - User bio
looking_for listing_category - What they're looking for (property, moto, bicycle, tasker)
budget TEXT - Budget range
location TEXT - User location
reliability_score DECIMAL - Reputation score (0.00 - 5.00)
created_at TIMESTAMP - Account creation time
updated_at TIMESTAMP - Last profile update
```

**Relationships**: One-to-many with listings, messages, interactions, preferences

---

## Table: `listings`
Marketplace items (properties, vehicles, bikes, freelance jobs)

```sql
id UUID (Primary Key)
owner_id UUID (Foreign Key) → profiles.id
title TEXT - Listing title
category listing_category - Type: property | moto | bicycle | tasker
price TEXT - Price or hourly rate
location TEXT - Location
image TEXT - Main image URL
description TEXT - Full description
features TEXT[] - Feature array
tags TEXT[] - Tag array for searching
transaction_type transaction_type - rent | sale | both | project | hourly

-- Property-specific
bedrooms INTEGER
bathrooms INTEGER
sqft INTEGER

-- Vehicle-specific
year INTEGER
mileage TEXT
engine_size TEXT

-- Bicycle-specific
frame_material TEXT
weight TEXT

-- Tasker/Freelance-specific
skills TEXT[]
experience_level experience_level - Entry | Intermediate | Expert
hourly_rate TEXT
project_fee TEXT
duration TEXT

created_at TIMESTAMP
updated_at TIMESTAMP
```

**Indexes**: owner_id, category, location
**Relationships**: One-to-many with messages, interactions

---

## Table: `messages`
Chat/conversation history (AI chat + user interactions)

```sql
id UUID (Primary Key)
user_id UUID (Foreign Key) → profiles.id
listing_id UUID (Foreign Key) → listings.id (nullable)
role TEXT - 'user' or 'model' (AI responses)
text TEXT - Message content
timestamp TIMESTAMP - When message was sent
```

**Indexes**: user_id, listing_id
**Use Cases**: AI chat history, user inquiries about listings

---

## Table: `interactions`
User behavior tracking for recommendations

```sql
id UUID (Primary Key)
user_id UUID (Foreign Key) → profiles.id
listing_id UUID (Foreign Key) → listings.id
action interaction_action - 'like' | 'nope' | 'view'
duration INTEGER - Time spent viewing (milliseconds)
timestamp TIMESTAMP - When interaction occurred
```

**Indexes**: user_id, listing_id
**Use Cases**: Recommendation algorithm training, user preferences learning

---

## Table: `preferences`
ML recommendation profile per user

```sql
id UUID (Primary Key)
user_id UUID (Foreign Key) → profiles.id (UNIQUE)
affinity_tags TEXT[] - Tags the user likes
disliked_tags TEXT[] - Tags the user dislikes
price_preference TEXT - Price range preference
reasoning TEXT - Why these preferences
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Relationships**: One-to-one with profiles
**Use Cases**: ML model training, personalized recommendations

---

## Enums

### listing_category
- `property` - Real estate (apartments, houses, etc.)
- `moto` - Motorcycles and scooters
- `bicycle` - Bicycles and e-bikes
- `tasker` - Freelance services/jobs

### transaction_type
- `rent` - Rental/lease
- `sale` - Purchase
- `both` - Can be either
- `project` - Project-based work
- `hourly` - Hourly rate work

### interaction_action
- `like` - User liked the listing
- `nope` - User passed on listing
- `view` - User viewed listing

### experience_level
- `Entry` - Entry level (tasker only)
- `Intermediate` - Mid-level experience
- `Expert` - Expert level

---

## Row Level Security (RLS) Policies

### profiles
- ✅ Anyone can view all profiles
- ✅ Users can view their own profile
- ✅ Users can edit only their own profile
- ✅ Only users can insert their own profile

### listings
- ✅ Anyone can view all listings
- ✅ Users can create listings
- ✅ Users can edit only their own listings
- ✅ Users can delete only their own listings

### messages
- ✅ Users can view their own messages
- ✅ Users can create messages
- ❌ Cannot modify/delete messages (audit trail)

### interactions
- ✅ Users can view their own interactions
- ✅ Users can create interactions
- ❌ Cannot modify/delete (immutable for analytics)

### preferences
- ✅ Users can view their own preferences
- ✅ Users can create preferences
- ✅ Users can edit only their own preferences

---

## Common Queries

### Get user's listings
```sql
SELECT * FROM listings WHERE owner_id = auth.uid();
```

### Get listings by category and location
```sql
SELECT * FROM listings
WHERE category = 'property' AND location = 'San Francisco';
```

### Get user's interaction history
```sql
SELECT i.*, l.title, l.price FROM interactions i
JOIN listings l ON i.listing_id = l.id
WHERE i.user_id = auth.uid()
ORDER BY i.timestamp DESC;
```

### Get user's chat messages
```sql
SELECT * FROM messages
WHERE user_id = auth.uid()
ORDER BY timestamp DESC
LIMIT 50;
```

### Get user's preferences
```sql
SELECT * FROM preferences WHERE user_id = auth.uid();
```

---

## Data Relationships

```
profiles (1) ──→ (many) listings
         ├──→ (many) messages
         ├──→ (many) interactions
         └──→ (one)  preferences

listings (1) ──→ (many) messages
         └──→ (many) interactions
```

---

## Indexes for Performance

- `listings(owner_id)` - Fast lookup of user's listings
- `listings(category)` - Fast filtering by category
- `listings(location)` - Fast location-based search
- `messages(user_id)` - Fast message retrieval
- `interactions(user_id)` - Fast interaction history
- `interactions(listing_id)` - Fast interaction analytics per listing
- `preferences(user_id)` - Fast preference lookup

---

## Auto-Updated Fields

Timestamps are automatically updated using PostgreSQL triggers:

- `profiles.updated_at` - Updated on any profile change
- `listings.updated_at` - Updated on any listing change
- `preferences.updated_at` - Updated on any preference change
