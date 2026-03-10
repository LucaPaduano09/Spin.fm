import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Carica i locali dell'utente
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug, plan, stripe_account_id')
    .eq('owner_id', user.id)
    .order('created_at')

  // ⚠️ Serializza solo i campi plain — Next.js non può passare
  // oggetti Supabase (classi) direttamente ai Client Components
  const serializedUser = {
    id:    user.id,
    email: user.email ?? '',
  }

  return (
    <DashboardShell user={serializedUser} venues={venues ?? []}>
      {children}
    </DashboardShell>
  )
}
