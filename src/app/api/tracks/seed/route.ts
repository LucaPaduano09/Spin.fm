import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'

const MOCK_TRACKS = [
  // House / Electronic
  { title: 'Levels',                 artist: 'Avicii',               bpm: 126, key: 'C#m', genre: 'Progressive House', duration: 322 },
  { title: 'One More Time',          artist: 'Daft Punk',            bpm: 123, key: 'Fm',  genre: 'House',             duration: 320 },
  { title: 'Get Lucky',              artist: 'Daft Punk',            bpm: 116, key: 'Bm',  genre: 'Nu-Disco',          duration: 369 },
  { title: 'Strobe',                 artist: 'deadmau5',             bpm: 128, key: 'F#m', genre: 'Progressive House', duration: 602 },
  { title: 'Animals',                artist: 'Martin Garrix',        bpm: 128, key: 'Am',  genre: 'Big Room',          duration: 274 },
  { title: "Don't You Worry Child",  artist: 'Swedish House Mafia',  bpm: 128, key: 'Db',  genre: 'Progressive House', duration: 264 },
  { title: 'Lean On',                artist: 'Major Lazer',          bpm: 98,  key: 'Dbm', genre: 'Electronic',        duration: 176 },
  { title: 'Clarity',                artist: 'Zedd',                 bpm: 128, key: 'Gm',  genre: 'Electro House',     duration: 268 },
  { title: 'Titanium',               artist: 'David Guetta',         bpm: 126, key: 'Gm',  genre: 'EDM',               duration: 245 },
  { title: 'In My Mind',             artist: 'Dynoro',               bpm: 128, key: 'Am',  genre: 'House',             duration: 163 },
  // Hip-Hop / Trap
  { title: 'HUMBLE.',                artist: 'Kendrick Lamar',       bpm: 150, key: 'Bm',  genre: 'Hip-Hop',           duration: 177 },
  { title: "God's Plan",             artist: 'Drake',                bpm: 77,  key: 'Bb',  genre: 'Hip-Hop',           duration: 198 },
  { title: 'Sicko Mode',             artist: 'Travis Scott',         bpm: 155, key: 'Fm',  genre: 'Trap',              duration: 312 },
  { title: 'Rockstar',               artist: 'Post Malone',          bpm: 160, key: 'Bbm', genre: 'Trap',              duration: 218 },
  { title: 'Lucid Dreams',           artist: 'Juice WRLD',           bpm: 84,  key: 'Dm',  genre: 'Emo Rap',           duration: 239 },
  { title: 'Mo Bamba',               artist: 'Sheck Wes',            bpm: 140, key: 'Cm',  genre: 'Trap',              duration: 183 },
  { title: 'Antidote',               artist: 'Travis Scott',         bpm: 130, key: 'Cm',  genre: 'Trap',              duration: 249 },
  { title: 'Bad and Boujee',         artist: 'Migos',                bpm: 130, key: 'Cm',  genre: 'Trap',              duration: 343 },
  // Pop / Mainstream
  { title: 'Blinding Lights',        artist: 'The Weeknd',           bpm: 171, key: 'Fm',  genre: 'Synth-Pop',         duration: 200 },
  { title: 'Save Your Tears',        artist: 'The Weeknd',           bpm: 118, key: 'Am',  genre: 'Synth-Pop',         duration: 215 },
  { title: 'Starboy',                artist: 'The Weeknd',           bpm: 186, key: 'Dm',  genre: 'Synth-Pop',         duration: 230 },
  { title: 'Shape of You',           artist: 'Ed Sheeran',           bpm: 96,  key: 'C#m', genre: 'Pop',               duration: 234 },
  { title: 'Bad Guy',                artist: 'Billie Eilish',        bpm: 135, key: 'Gm',  genre: 'Electropop',        duration: 194 },
  { title: 'As It Was',              artist: 'Harry Styles',         bpm: 174, key: 'Am',  genre: 'Pop',               duration: 167 },
  { title: 'Stay',                   artist: 'The Kid LAROI',        bpm: 170, key: 'Cm',  genre: 'Pop',               duration: 141 },
  { title: 'Industry Baby',          artist: 'Lil Nas X',            bpm: 150, key: 'Dbm', genre: 'Pop Rap',           duration: 212 },
  // R&B / Soul
  { title: 'Essence',                artist: 'Wizkid',               bpm: 109, key: 'Fm',  genre: 'Afrobeats',         duration: 177 },
  { title: 'Peaches',                artist: 'Justin Bieber',        bpm: 90,  key: 'Ab',  genre: 'R&B',               duration: 198 },
  { title: 'Leave The Door Open',    artist: 'Bruno Mars',           bpm: 90,  key: 'Db',  genre: 'R&B',               duration: 243 },
  { title: 'Mood',                   artist: '24kGoldn',             bpm: 91,  key: 'Gm',  genre: 'Pop Rap',           duration: 141 },
  // Latin / Reggaeton
  { title: 'Despacito',              artist: 'Luis Fonsi',           bpm: 89,  key: 'Bm',  genre: 'Reggaeton',         duration: 229 },
  { title: 'Con Calma',              artist: 'Daddy Yankee',         bpm: 97,  key: 'Am',  genre: 'Reggaeton',         duration: 192 },
  { title: 'Taki Taki',              artist: 'DJ Snake',             bpm: 98,  key: 'Fm',  genre: 'Latin',             duration: 202 },
  { title: 'Hawái',                  artist: 'Maluma',               bpm: 93,  key: 'F#m', genre: 'Reggaeton',         duration: 189 },
  // Funk / Disco / Classic
  { title: 'Uptown Funk',            artist: 'Mark Ronson',          bpm: 115, key: 'Dm',  genre: 'Funk',              duration: 270 },
  { title: "Can't Stop the Feeling", artist: 'Justin Timberlake',    bpm: 113, key: 'C',   genre: 'Pop',               duration: 234 },
  { title: 'Happy',                  artist: 'Pharrell Williams',    bpm: 160, key: 'F',   genre: 'Soul',              duration: 233 },
  { title: 'Treasure',               artist: 'Bruno Mars',           bpm: 126, key: 'Bb',  genre: 'Funk',              duration: 176 },
  { title: 'Superstition',           artist: 'Stevie Wonder',        bpm: 98,  key: 'Ebm', genre: 'Funk',              duration: 245 },
  { title: 'Le Freak',               artist: 'Chic',                 bpm: 120, key: 'Am',  genre: 'Disco',             duration: 210 },
]

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venueId } = await req.json()
  if (!venueId) return NextResponse.json({ error: 'venueId required' }, { status: 400 })

  const { data: venue } = await supabase
    .from('venues').select('id').eq('id', venueId).eq('owner_id', user.id).single()
  if (!venue) return NextResponse.json({ error: 'Venue non trovata' }, { status: 404 })

  const admin = createAdminClient()
  const tracks = MOCK_TRACKS.map(t => ({ ...t, venue_id: venueId }))

  // Elimina eventuali tracce mock precedenti e reinserisce
  // (identifica i mock cercando titoli che coincidono)
  const titles = tracks.map(t => t.title)
  await admin.from('tracks').delete().eq('venue_id', venueId).in('title', titles)

  const { error } = await admin.from('tracks').insert(tracks)

  if (error) {
    console.error('[seed] Supabase error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ added: tracks.length, message: `${tracks.length} tracce mock aggiunte con successo` })
}
