import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { parseRekordboxXML } from '@/lib/rekordbox'

// GET /api/tracks?venue_id=xxx&q=query — ricerca nella libreria del DJ
export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get('venue_id')
  const query   = req.nextUrl.searchParams.get('q') ?? ''

  if (!venueId) return NextResponse.json({ error: 'venue_id required' }, { status: 400 })

  const supabase = createAdminClient()

  const dbQuery = supabase
    .from('tracks')
    .select('*')
    .eq('venue_id', venueId)
    .limit(20)

  // Full-text search se c'è una query
  const { data, error } = query
    ? await dbQuery.textSearch('title || \' \' || artist', query, { type: 'plain' })
    : await dbQuery.order('title')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/tracks/import — importa XML Rekordbox
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const venueId  = formData.get('venue_id') as string | null

  if (!file || !venueId) return NextResponse.json({ error: 'file and venue_id required' }, { status: 400 })

  const xmlContent = await file.text()
  const tracks     = parseRekordboxXML(xmlContent, venueId)

  if (tracks.length === 0) return NextResponse.json({ error: 'No tracks found in XML' }, { status: 400 })

  const admin = createAdminClient()

  // Cancella la libreria precedente e reinserisce
  await admin.from('tracks').delete().eq('venue_id', venueId)
  const { error } = await admin.from('tracks').insert(tracks)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: tracks.length })
}
