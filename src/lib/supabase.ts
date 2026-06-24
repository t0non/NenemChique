import { createClient } from '@supabase/supabase-js'
import { errToString } from '@/lib/utils'

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
  console.error(
    'Supabase configuration missing. URL or Anon Key is empty. Verifique seu .env.local ou /env.js.'
  )
}

export const supabase = createClient(supabaseUrl || 'https://example.invalid', supabaseAnonKey || 'anon')
