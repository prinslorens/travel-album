import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dbskremuxjpjkxkjwgsz.supabase.co'
const supabaseAnonKey = 'sb_publishable_M67nwwK4HWgE_BC_TstqvA_Pkq8lxxX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)