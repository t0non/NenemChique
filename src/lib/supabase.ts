import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  ((typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_URL) as string) ||
  ''
).trim()
const supabaseAnonKey = (
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  ((typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_ANON_KEY) as string) ||
  ''
).trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing! Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
