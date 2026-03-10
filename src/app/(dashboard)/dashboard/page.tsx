'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface SongRequest {
  id: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected' | 'played'
  dedication: string | null
  customer_name: string | null
  created_at: string
  stripe_payment_intent_id: string
  track: { id: string; title: string; artist: string }
}

export default function LiveRequestsPage() {
  const [venueId,    setVenueId]    = useState<string | null>(null)
  const [requests,   setRequests]   = useState<SongRequest[]>([])
  const [processing, setProcessing] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const supabase = createClient()

  // Carica venue corrente
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('venues').select('id').eq('owner_id', user.id).limit(1).single()
      if (data) setVenueId(data.id)
    })
  }, [])

  // Load + realtime
  useEffect(() => {
    if (!venueId) return
    setLoading(true)
    supabase
      .from('song_requests')
      .select('*, track:tracks(id,title,artist)')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setRequests(data as SongRequest[])
        setLoading(false)
      })

    const channel = supabase
      .channel(`live:${venueId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'song_requests',
        filter: `venue_id=eq.${venueId}`,
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase
            .from('song_requests').select('*, track:tracks(id,title,artist)')
            .eq('id', payload.new.id).single()
          if (data) setRequests(prev => [data as SongRequest, ...prev])
        }
        if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(r =>
            r.id === payload.new.id ? { ...r, ...payload.new } as SongRequest : r
          ))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [venueId])

  const handleAction = useCallback(async (id: string, action: 'accept' | 'reject') => {
    setProcessing(id)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } as SongRequest : r
    ))
    setProcessing(null)
  }, [])

  const pending  = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')
  const earnings = accepted.reduce((s, r) => s + r.amount * 0.9, 0)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      {/* Stats */}
      <div className="g4">
        <div className="dc">
          <p className="dc-title">In attesa</p>
          <p className="dc-val" style={{ color: pending.length > 0 ? '#ffc800' : 'var(--white)' }}>{pending.length}</p>
          <p className="dc-sub">richieste pending</p>
        </div>
        <div className="dc">
          <p className="dc-title">Accettate</p>
          <p className="dc-val a">{accepted.length}</p>
          <p className="dc-sub">questa sessione</p>
        </div>
        <div className="dc">
          <p className="dc-title">Guadagno serata</p>
          <p className="dc-val a">€{earnings.toFixed(0)}</p>
          <p className="dc-sub">quota tua (90%)</p>
        </div>
        <div className="dc">
          <p className="dc-title">Stato</p>
          <div className="live" style={{ marginTop: 8 }}>
            <div className="live-dot" /> LIVE
          </div>
          <p className="dc-sub">connesso realtime</p>
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="sh">
            <div>
              <h2 className="st">RICHIESTE IN ARRIVO</h2>
              <p className="ss">{pending.length} in attesa di risposta</p>
            </div>
          </div>
          {pending.map((req, i) => (
            <div key={req.id} className={`req${i === 0 ? ' new' : ''}`}>
              <span className="req-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="req-info">
                <p className="req-track">{req.track.title}</p>
                <p className="req-artist">{req.track.artist}</p>
                {req.dedication && <p className="req-ded">💌 {req.dedication}</p>}
                {req.customer_name && (
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#555', marginTop: 4 }}>
                    da {req.customer_name}
                  </p>
                )}
              </div>
              <span className="req-amt">€{req.amount}</span>
              <div className="req-acts">
                <button className="acc" disabled={processing === req.id}
                  onClick={() => handleAction(req.id, 'accept')}>
                  {processing === req.id ? <span className="spin" /> : '✓ Accetta'}
                </button>
                <button className="rej" disabled={processing === req.id}
                  onClick={() => handleAction(req.id, 'reject')}>
                  ✗ Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted queue */}
      {accepted.length > 0 && (
        <div>
          <div className="sh">
            <div>
              <h2 className="st">CODA ACCETTATA</h2>
              <p className="ss">{accepted.length} brani in coda</p>
            </div>
          </div>
          {accepted.map((req, i) => (
            <div key={req.id} className="req">
              <span className="req-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="req-info">
                <p className="req-track">{req.track.title}</p>
                <p className="req-artist">{req.track.artist}</p>
                {req.dedication && <p className="req-ded">💌 {req.dedication}</p>}
              </div>
              <span className="req-amt">€{req.amount}</span>
              <div className="req-acts">
                <span className="badge b-accepted">accettata</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && requests.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🎧</div>
          <p className="empty-t">IN ATTESA DI RICHIESTE</p>
          <p className="empty-s">Mostra il QR code ai clienti per iniziare</p>
        </div>
      )}

      {loading && (
        <div className="empty">
          <span className="spin" style={{ width: 32, height: 32 }} />
        </div>
      )}
    </>
  )
}
