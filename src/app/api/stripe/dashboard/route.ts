import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venueId } = await req.json()

  const { data: venue } = await supabase
    .from('venues').select('stripe_account_id').eq('id', venueId).eq('owner_id', user.id).single()

  if (!venue?.stripe_account_id) {
    return NextResponse.json({ error: 'No Stripe account' }, { status: 400 })
  }

  try {
    // Verifica prima che l'account abbia completato l'onboarding
    const account = await stripe.accounts.retrieve(venue.stripe_account_id)

    if (!account.details_submitted) {
      // Onboarding non completato — rimanda all'onboarding
      const origin = req.headers.get('origin') ?? 'http://localhost:3000'
      const accountLink = await stripe.accountLinks.create({
        account: venue.stripe_account_id,
        refresh_url: `${origin}/api/stripe/callback?venue=${venueId}&status=refresh`,
        return_url:  `${origin}/api/stripe/callback?venue=${venueId}&status=success`,
        type: 'account_onboarding',
      })
      return NextResponse.json({ url: accountLink.url, incomplete: true })
    }

    const loginLink = await stripe.accounts.createLoginLink(venue.stripe_account_id)
    return NextResponse.json({ url: loginLink.url })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('Stripe dashboard error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
