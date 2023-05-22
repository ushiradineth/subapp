import { createClient } from '@supabase/supabase-js'
import { env } from '~/env.mjs'

export const supabase = createClient(`https://${env.NEXT_PUBLIC_SUPABASE_PROJECT}.supabase.co`, env.NEXT_PUBLIC_ANON_KEY)