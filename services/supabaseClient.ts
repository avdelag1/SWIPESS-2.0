
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credentials provided by the user to connect the backend
const supabaseUrl = 'https://vplgtcguxujxwrgguxqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseInstance;
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) return;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabase) return;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signInWithGithub = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo read:user',
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
