import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { z } from 'zod'

const Schema = z.object({
  userId: z.string().uuid(),
  name:   z.string().min(2).max(80),
  slug:   z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  plan:   z.enum(['basic', 'pro', 'agency']).default('pro'),
})

/**
 * POST /api/auth/register
 * Chiamata subito dopo supabase.auth.signUp().
 * Usa la service role key (admin) per creare la venue bypassando RLS —
 * sicuro perché userId viene dal server, non dal client.
 */
export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = Schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { userId, name, slug, plan } = parsed.data
  const supabase = createAdminClient()

  // Controlla slug duplicato
  const { data: existing } = await supabase
    .from('venues')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
  }

  const { error } = await supabase
    .from('venues')
    .insert({
      name,
      slug,
      owner_id: userId,
      plan,
      settings: {
        min_offer: 2, max_offer: 20,
        auction_mode: false, dynamic_pricing: false,
        blacklist_artists: [], allowed_genres: [],
      },
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
