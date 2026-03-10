import { XMLParser } from 'fast-xml-parser'
import type { Track } from '@/types'

interface RekordboxTrack {
  '@_TrackID':  string
  '@_Name':     string
  '@_Artist':   string
  '@_Tonality': string
  '@_Genre':    string
  '@_TotalTime': string
  '@_AverageBpm': string
}

/**
 * Parsa un file XML esportato da Rekordbox
 * e restituisce un array di Track pronti per Supabase
 *
 * Come esportare da Rekordbox:
 * File → Export Collection in xml format
 */
export function parseRekordboxXML(xmlContent: string, venueId: string): Omit<Track, 'id' | 'created_at'>[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const parsed = parser.parse(xmlContent)

  const collection = parsed?.DJ_PLAYLISTS?.COLLECTION?.TRACK
  if (!collection) return []

  const tracks: RekordboxTrack[] = Array.isArray(collection) ? collection : [collection]

  return tracks
    .filter(t => t['@_Name'] && t['@_Artist'])
    .map(t => ({
      venue_id: venueId,
      title:    t['@_Name']?.trim() ?? 'Unknown',
      artist:   t['@_Artist']?.trim() ?? 'Unknown',
      bpm:      t['@_AverageBpm'] ? parseFloat(t['@_AverageBpm']) : null,
      key:      t['@_Tonality'] ?? null,
      genre:    t['@_Genre'] ?? null,
      duration: t['@_TotalTime'] ? parseInt(t['@_TotalTime']) : null,
    }))
}

/**
 * Formatta durata in mm:ss
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
