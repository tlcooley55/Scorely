import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as
  | string
  | undefined

export function assertSupabaseClientEnv(): void {
  if (!supabaseUrl) throw new Error('Missing env VITE_SUPABASE_URL')
  if (!supabaseAnonKey) throw new Error('Missing env VITE_SUPABASE_ANON_KEY')
}

export function assertSupabaseAdminEnv(): void {
  if (!supabaseUrl) throw new Error('Missing env VITE_SUPABASE_URL')
  if (!supabaseServiceRoleKey) throw new Error('Missing env VITE_SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = (() => {
  assertSupabaseClientEnv()
  return createClient(supabaseUrl as string, supabaseAnonKey as string)
})()
