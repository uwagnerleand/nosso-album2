import { createBrowserClient } from '@supabase/ssr'

// Fallback values allow the build to complete without real Supabase credentials.
// In production these env vars must be set to actual Supabase values.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
