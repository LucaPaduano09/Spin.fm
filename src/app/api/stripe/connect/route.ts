import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venueId } = await req.json()

  // Verifica ownership
  const { data: venue } = await supabase
    .from('venues').select('id,name,stripe_account_id').eq('id', venueId).eq('owner_id', user.id).single()
  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

  let accountId = venue.stripe_account_id

  // Crea account Stripe Connect se non esiste
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: { venue_id: venueId, user_id: user.id },
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    })
    accountId = account.id

    // Salva nel DB
    const admin = createAdminClient()
    await admin.from('venues').update({ stripe_account_id: accountId }).eq('id', venueId)
  }

  // Crea onboarding link
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/api/stripe/callback?venue=${venueId}&status=refresh`,
    return_url:  `${origin}/api/stripe/callback?venue=${venueId}&status=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
