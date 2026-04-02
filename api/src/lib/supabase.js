const { createClient } = require('@supabase/supabase-js')

// Make this module robust when imported before server.js or from different CWDs.
// dotenv is already loaded in server.js, but this helps produce clearer errors.
try {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: require('path').join(process.cwd(), '.env') })
} catch (_) {
  // ignore
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing env NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL). Create api/.env with your Supabase project URL.'
  )
}

if (!serviceRoleKey) {
  throw new Error(
    'Missing env SUPABASE_SERVICE_ROLE_KEY. Create api/.env with your Supabase service_role key (server-only).' 
  )
}

// Service role client: server-side only.
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

module.exports = { supabaseAdmin }
