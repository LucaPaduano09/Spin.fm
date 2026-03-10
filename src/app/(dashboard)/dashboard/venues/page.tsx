'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Venue {
  id:                string
  name:              string
  slug:              string
  plan:              string
  stripe_account_id: string | null
  created_at:        string
  settings:          { min_offer: number; max_offer: number; auction_mode: boolean }
}

interface VenueStats {
  requests: number
  revenue:  number
}

export default function VenuesPage() {
  const [venues,  setVenues]  = useState<Venue[]>([])
  const [stats,   setStats]   = useState<Record<string, VenueStats>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('venues').select('*').eq('owner_id', user.id).order('created_at')

    if (!data) { setLoading(false); return }
    setVenues(data)

    // Carica stats per ogni venue
    const statsMap: Record<string, VenueStats> = {}
    await Promise.all(data.map(async v => {
      const { data: reqs } = await supabase
        .from('song_requests')
        .select('amount, status')
        .eq('venue_id', v.id)
        .in('status', ['accepted', 'played'])
      statsMap[v.id] = {
        requests: reqs?.length ?? 0,
        revenue:  reqs?.reduce((s, r) => s + r.amount * 0.9, 0) ?? 0,
      }
    }))
    setStats(statsMap)
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"? Questa azione è irreversibile.`)) return
    setDeleting(id)
    await supabase.from('venues').delete().eq('id', id)
    setVenues(prev => prev.filter(v => v.id !== id))
    setDeleting(null)
  }

  const planColor = (plan: string) => plan === 'agency' ? '#ff6b6b' : plan === 'pro' ? 'var(--acid)' : '#aaa'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">I MIEI LOCALI</h2>
          <p className="ss">{venues.length} locale{venues.length !== 1 ? 'i' : 'e'} attivo{venues.length !== 1 ? 'i' : ''}</p>
        </div>
        <Link href="/dashboard/venues/new" className="btn btn-a" style={{ textDecoration: 'none' }}>
          + Aggiungi locale
        </Link>
      </div>

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}

      {!loading && venues.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🏛️</div>
          <p className="empty-t">NESSUN LOCALE</p>
          <p className="empty-s">Aggiungi il tuo primo locale per iniziare</p>
          <Link href="/dashboard/venues/new" className="btn btn-a" style={{ textDecoration: 'none', marginTop: 24, display: 'inline-flex' }}>
            + Aggiungi locale
          </Link>
        </div>
      )}

      {!loading && venues.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {venues.map(v => (
            <div key={v.id} style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24 }}>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 1, color: 'var(--white)' }}>{v.name}</p>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', padding: '2px 8px', border: `1px solid ${planColor(v.plan)}`, color: planColor(v.plan) }}>
                    {v.plan}
                  </span>
                  {!v.stripe_account_id && (
                    <span className="badge b-pending">Stripe non configurato</span>
                  )}
                </div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#555' }}>
                  drop.fm/venue/<span style={{ color: 'var(--acid)' }}>{v.slug}</span>
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 32, textAlign: 'center' }}>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--white)' }}>{stats[v.id]?.requests ?? 0}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Richieste</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--acid)' }}>€{(stats[v.id]?.revenue ?? 0).toFixed(0)}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Revenue</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  href={`/dashboard/dashboard?venue=${v.id}`}
                  className="btn btn-a"
                  style={{ padding: '8px 16px', fontSize: 9, textDecoration: 'none' }}
                >
                  ⚡ Live
                </Link>
                <Link
                  href={`/dashboard/qrcode?venue=${v.id}`}
                  className="btn btn-g"
                  style={{ padding: '8px 16px', fontSize: 9, textDecoration: 'none' }}
                >
                  📱 QR
                </Link>
                {!v.stripe_account_id && (
                  <Link
                    href="/dashboard/stripe"
                    className="btn btn-g"
                    style={{ padding: '8px 16px', fontSize: 9, textDecoration: 'none', borderColor: '#ffc800', color: '#ffc800' }}
                  >
                    💳 Stripe
                  </Link>
                )}
                <button
                  className="btn btn-r"
                  style={{ padding: '8px 16px', fontSize: 9 }}
                  disabled={deleting === v.id}
                  onClick={() => handleDelete(v.id, v.name)}
                >
                  {deleting === v.id ? <span className="spin" /> : '✕'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Piano upgrade nudge */}
      {!loading && (
        <div style={{ marginTop: 24, background: 'rgba(212,240,0,0.04)', border: '1px solid rgba(212,240,0,0.15)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--acid)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              Hai bisogno di più locali?
            </p>
            <p style={{ fontSize: 13, color: '#666' }}>
              Piano Pro: 3 locali · Piano Agency: illimitati
            </p>
          </div>
          <Link href="/dashboard/upgrade" className="btn btn-g" style={{ textDecoration: 'none', borderColor: 'rgba(212,240,0,0.3)', color: 'var(--acid)' }}>
            Vedi piani →
          </Link>
        </div>
      )}
    </>
  )
}
