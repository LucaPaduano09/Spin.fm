import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { createPendingPaymentIntent } from '@/lib/stripe'
import { z } from 'zod'

const CreateRequestSchema = z.object({
  venue_id:      z.string().uuid(),
  track_id:      z.string().uuid(),
  amount:        z.number().min(2).max(20),
  dedication:    z.string().max(120).optional(),
  customer_name: z.string().max(50).optional(),
})

// GET /api/requests?venue_id=xxx — coda pubblica del locale
export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get('venue_id')
  if (!venueId) return NextResponse.json({ error: 'venue_id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('song_requests')
    .select('*, track:tracks(*)')
    .eq('venue_id', venueId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/requests — crea nuova richiesta + PaymentIntent Stripe
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { venue_id, track_id, amount, dedication, customer_name } = parsed.data
  const supabase = createAdminClient()

  // Recupera stripe_account_id del locale
  const { data: venue } = await supabase
    .from('venues')
    .select('stripe_account_id, name')
    .eq('id', venue_id)
    .single()

  if (!venue?.stripe_account_id) {
    return NextResponse.json({ error: 'Venue not connected to Stripe' }, { status: 400 })
  }

  // Crea PaymentIntent con capture_method: manual (addebito solo se DJ accetta)
  const pi = await createPendingPaymentIntent({
    amount,
    venueStripeAccountId: venue.stripe_account_id,
    metadata: { venue_id, track_id, dedication: dedication ?? '' },
  })

  // Salva la richiesta in pending
  const { data: request, error } = await supabase
    .from('song_requests')
    .insert({
      venue_id,
      track_id,
      amount,
      dedication,
      customer_name,
      stripe_payment_intent_id: pi.id,
      status: 'pending',
    })
    .select('*, track:tracks(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    request,
    client_secret: pi.client_secret, // usato da Stripe Elements lato client
  })
}
