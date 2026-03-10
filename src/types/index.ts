// ============================================================
// DOMAIN TYPES — Drop.fm
// ============================================================

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'played'
export type PlanType      = 'basic' | 'pro' | 'agency'

// ---------- Venue (locale) ----------
export interface Venue {
  id:          string
  name:        string
  slug:        string
  owner_id:    string
  plan:        PlanType
  stripe_account_id: string | null
  qr_code_url: string | null
  settings:    VenueSettings
  created_at:  string
}

export interface VenueSettings {
  min_offer:      number   // default 2
  max_offer:      number   // default 20
  auction_mode:   boolean
  dynamic_pricing: boolean
  blacklist_artists: string[]
  allowed_genres: string[]
}

// ---------- DJ ----------
export interface DJProfile {
  id:       string
  venue_id: string
  user_id:  string
  name:     string
  library_last_sync: string | null
}

// ---------- Track (dalla libreria Rekordbox) ----------
export interface Track {
  id:       string
  venue_id: string
  title:    string
  artist:   string
  bpm:      number | null
  key:      string | null
  genre:    string | null
  duration: number | null  // secondi
}

// ---------- Song Request ----------
export interface SongRequest {
  id:          string
  venue_id:    string
  track_id:    string
  track:       Track
  amount:      number        // in euro
  status:      RequestStatus
  dedication:  string | null
  customer_name: string | null
  stripe_payment_intent_id: string
  created_at:  string
  accepted_at: string | null
  played_at:   string | null
}

// ---------- WebSocket events ----------
export type WSEventMap = {
  // Client → Server
  'join:venue':    { venueId: string }
  'request:new':   Omit<SongRequest, 'id' | 'created_at' | 'track'>

  // Server → Client (DJ)
  'request:incoming': SongRequest
  'request:updated':  Pick<SongRequest, 'id' | 'status'>

  // Server → Client (pubblico)
  'queue:updated': SongRequest[]
  'now:playing':   Track | null
}

// ---------- Stripe ----------
export interface StripeConnectAccount {
  id:           string
  charges_enabled: boolean
  payouts_enabled: boolean
}
