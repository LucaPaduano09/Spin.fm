// Client per Server Components e Route Handlers — USA next/headers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name)              { return cookieStore.get(name)?.value },
        set(name, value, opts) { try { cookieStore.set({ name, value, ...opts }) } catch {} },
        remove(name, opts)     { try { cookieStore.set({ name, value: '', ...opts }) } catch {} },
      },
    }
  )
}

export function createAdminClient() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
