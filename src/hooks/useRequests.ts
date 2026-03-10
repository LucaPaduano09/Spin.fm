'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { SongRequest } from '@/types'

/**
 * Hook per ascoltare le richieste in tempo reale via Supabase Realtime.
 * Usato dalla dashboard DJ e dalla pagina pubblica del locale.
 */
export function useRequests(venueId: string) {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!venueId) return
    const supabase = createClient()

    // Carica richieste iniziali
    supabase
      .from('song_requests')
      .select('*, track:tracks(*)')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRequests(data as SongRequest[])
        setLoading(false)
      })

    // Subscription realtime
    const channel = supabase
      .channel(`requests:${venueId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table:  'song_requests',
        filter: `venue_id=eq.${venueId}`,
      }, async (payload) => {
        // Fetch completo con join track
        const { data } = await supabase
          .from('song_requests')
          .select('*, track:tracks(*)')
          .eq('id', payload.new.id)
          .single()
        if (data) setRequests(prev => [data as SongRequest, ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table:  'song_requests',
        filter: `venue_id=eq.${venueId}`,
      }, (payload) => {
        setRequests(prev =>
          prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } as SongRequest : r)
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [venueId])

  const pendingRequests  = requests.filter(r => r.status === 'pending')
  const acceptedRequests = requests.filter(r => r.status === 'accepted')

  return { requests, pendingRequests, acceptedRequests, loading }
}
