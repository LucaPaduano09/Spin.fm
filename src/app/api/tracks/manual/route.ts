import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venueId, title, artist, bpm, key, genre, duration } = await req.json()
  if (!venueId || !title || !artist) return NextResponse.json({ error: 'venueId, title e artist sono obbligatori' }, { status: 400 })

  const { data: venue } = await supabase
    .from('venues').select('id').eq('id', venueId).eq('owner_id', user.id).single()
  if (!venue) return NextResponse.json({ error: 'Venue non trovata' }, { status: 404 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('tracks')
    .insert({ venue_id: venueId, title, artist, bpm: bpm ?? null, key: key ?? null, genre: genre ?? null, duration: duration ?? null })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trackId = req.nextUrl.searchParams.get('id')
  if (!trackId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data: track } = await supabase
    .from('tracks').select('id, venues(owner_id)').eq('id', trackId).single()

  const owner = (track?.venues as unknown as { owner_id: string } | null)?.owner_id
  if (!track || owner !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const admin = createAdminClient()
  await admin.from('tracks').delete().eq('id', trackId)
  return NextResponse.json({ ok: true })
}
