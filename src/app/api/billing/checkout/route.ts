import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

// Price IDs da configurare in Stripe Dashboard
// Stripe Dashboard → Products → crea i 3 prodotti con i prezzi mensili/annuali
const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  basic:  { monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY  ?? '', annual: process.env.STRIPE_PRICE_BASIC_ANNUAL  ?? '' },
  pro:    { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY    ?? '', annual: process.env.STRIPE_PRICE_PRO_ANNUAL    ?? '' },
  agency: { monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? '', annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL ?? '' },
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, venueId, annual = false } = await req.json()

  const priceId = PRICE_IDS[plan]?.[annual ? 'annual' : 'monthly']

  // Se i price IDs non sono configurati, fallback al dev mode
  if (!priceId) {
    return NextResponse.json({ error: 'price_not_configured' }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode:        'subscription',
    line_items:  [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    metadata:    { user_id: user.id, venue_id: venueId, plan },
    success_url: `${origin}/dashboard/upgrade?success=1&plan=${plan}`,
    cancel_url:  `${origin}/dashboard/upgrade`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { user_id: user.id, venue_id: venueId, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
