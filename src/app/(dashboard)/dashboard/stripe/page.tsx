'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Venue {
  id:                string
  name:              string
  slug:              string
  stripe_account_id: string | null
}

export default function StripePage() {
  const [venues,  setVenues]  = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Messaggi da redirect Stripe
  const success = searchParams.get('success')
  const error   = searchParams.get('error')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('venues').select('id,name,slug,stripe_account_id').eq('owner_id', user.id)
      setVenues(data ?? [])
      setLoading(false)
    })
  }, [])

  const handleConnect = async (venueId: string) => {
    setConnecting(venueId)
    const res = await fetch('/api/stripe/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      setConnecting(null)
    }
  }

  const handleDashboard = async (venueId: string) => {
    const res = await fetch('/api/stripe/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
    })
    const body = await res.json()
    if (res.ok) {
      if (body.incomplete) {
        // Onboarding non completato — reindirizza a completarlo
        window.location.href = body.url
      } else {
        window.open(body.url, '_blank')
      }
    } else {
      console.error('Stripe dashboard error:', body.error)
      alert('Errore Stripe: ' + (body.error ?? 'Riprova più tardi'))
    }
  }

  const connected    = venues.filter(v => v.stripe_account_id)
  const disconnected = venues.filter(v => !v.stripe_account_id)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">STRIPE CONNECT</h2>
          <p className="ss">Collega i tuoi locali per ricevere pagamenti</p>
        </div>
      </div>

      {/* Feedback messages */}
      {success && (
        <div style={{ background: 'rgba(0,230,118,.08)', border: '1px solid rgba(0,230,118,.2)', padding: '12px 20px', marginBottom: 24, fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#00e676' }}>
          ✓ Account Stripe collegato con successo!
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(255,45,45,.08)', border: '1px solid rgba(255,45,45,.2)', padding: '12px 20px', marginBottom: 24, fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--red)' }}>
          ✗ Errore durante la connessione Stripe. Riprova.
        </div>
      )}

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}

      {!loading && (
        <>
          {/* How it works */}
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
            <p className="dc-title" style={{ marginBottom: 20 }}>Come funziona</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[
                { n:'01', t:'Connetti Stripe', d:'Collega il tuo account Stripe (o creane uno nuovo). Ci vogliono 5 minuti.' },
                { n:'02', t:'I clienti pagano', d:'Quando un cliente richiede un brano, la carta viene pre-autorizzata ma non addebitata.' },
                { n:'03', t:'Tu incassi', d:'Se accetti la richiesta, Stripe addebita e ti accredita il 90% automaticamente.' },
              ].map(row => (
                <div key={row.n}>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--acid)', lineHeight: 1, marginBottom: 8 }}>{row.n}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 6 }}>{row.t}</p>
                  <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{row.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connected venues */}
          {connected.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>
                Connessi ({connected.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {connected.map(v => (
                  <div key={v.id} style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00e676', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1, color: 'var(--white)' }}>{v.name}</p>
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', marginTop: 2 }}>{v.stripe_account_id}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-g" style={{ padding: '8px 16px', fontSize: 9 }}
                        onClick={() => handleDashboard(v.id)}>
                        Apri Stripe ↗
                      </button>
                      <button className="btn btn-g" style={{ padding: '8px 16px', fontSize: 9 }}
                        onClick={() => handleConnect(v.id)}>
                        Riconfigura
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disconnected venues */}
          {disconnected.length > 0 && (
            <div>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>
                Da connettere ({disconnected.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {disconnected.map(v => (
                  <div key={v.id} style={{ background: 'var(--mid)', border: '1px solid rgba(255,200,0,.2)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffc800', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1, color: 'var(--white)' }}>{v.name}</p>
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#ffc800', marginTop: 2 }}>
                        Stripe non configurato — i pagamenti non funzioneranno
                      </p>
                    </div>
                    <button
                      className="btn btn-a"
                      disabled={connecting === v.id}
                      onClick={() => handleConnect(v.id)}
                    >
                      {connecting === v.id ? <><span className="spin" /> Connessione...</> : '💳 Connetti Stripe →'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {venues.length === 0 && (
            <div className="empty">
              <div className="empty-icon">💳</div>
              <p className="empty-t">NESSUN LOCALE</p>
              <p className="empty-s">Aggiungi prima un locale per configurare Stripe</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
