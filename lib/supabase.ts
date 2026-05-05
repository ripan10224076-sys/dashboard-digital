import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cezndnmewzcazeakblyp.supabase.co'
const supabaseAnonKey = 'sb_publishable_-gGHF6y2kxwz_4naOGfLag_qVHzJIyh'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)