export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function assertSupabaseClientEnv(): void {
  if (!supabaseUrl) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function assertSupabaseAdminEnv(): void {
  if (!supabaseUrl) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceRoleKey) throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY')
}
