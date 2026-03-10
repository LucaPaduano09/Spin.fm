'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Venue } from '@/types'

export function useVenue(venueId: string) {
  const [venue,   setVenue]   = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!venueId) return
    const supabase = createClient()

    supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setVenue(data as Venue)
        setLoading(false)
      })
  }, [venueId])

  return { venue, loading, error }
}

/** Recupera tutti i locali dell'utente corrente */
export function useMyVenues() {
  const [venues,  setVenues]  = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/venues')
      .then(r => r.json())
      .then(data => { setVenues(data); setLoading(false) })
  }, [])

  return { venues, loading }
}
