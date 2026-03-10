import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createConnectAccount } from '@/lib/stripe'
import { z } from 'zod'

const CreateVenueSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  city: z.string().min(2).max(60).optional(),
  plan: z.enum(['basic', 'pro', 'agency']).default('pro'),
})

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = CreateVenueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Crea Stripe Connect account (non-blocking: se fallisce, venue viene creata senza stripe)
  let stripeAccountId: string | null = null
  try {
    const account = await createConnectAccount(user.email!)
    stripeAccountId = account.id
  } catch (e) {
    console.warn('Stripe Connect creation failed, continuing without:', e)
  }

  const { data: venue, error } = await supabase
    .from('venues')
    .insert({
      name:              parsed.data.name,
      slug:              parsed.data.slug,
      owner_id:          user.id,
      plan:              parsed.data.plan,
      stripe_account_id: stripeAccountId,
      settings: {
        min_offer: 2, max_offer: 20,
        auction_mode: false, dynamic_pricing: false,
        blacklist_artists: [], allowed_genres: [],
      },
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ venue })
}
