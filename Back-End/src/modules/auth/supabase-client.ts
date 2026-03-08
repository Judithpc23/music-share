import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
