import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Global singleton wrapper for the client-side Supabase SDK
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
