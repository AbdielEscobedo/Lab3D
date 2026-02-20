import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Bypass NavigatorLockAcquireTimeoutError caused by Vite HMR or fast reloads
        lock: async (name, acquireTimeout, fn) => {
            return await fn()
        }
    }
})
