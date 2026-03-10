'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

function toSlug(s: string) {
  return s.toLowerCase()
    .replace(/[àáâäå]/g,'a').replace(/[èéêë]/g,'e')
    .replace(/[ìíî]/g,'i').replace(/[òóô]/g,'o').replace(/[ùúû]/g,'u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

export default function NewVenuePage() {
  const [name,    setName]    = useState('')
  const [slug,    setSlug]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!name || !slug) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non autenticato.'); setLoading(false); return }

    // Controlla piano e numero locali esistenti
    const { data: existing } = await supabase
      .from('venues').select('id, plan').eq('owner_id', user.id)

    const plan     = existing?.[0]?.plan ?? 'basic'
    const maxVenues = plan === 'agency' ? 999 : plan === 'pro' ? 3 : 1

    if ((existing?.length ?? 0) >= maxVenues) {
      setError(`Il piano ${plan} supporta massimo ${maxVenues} locale${maxVenues > 1 ? '' : 'e'}. Fai l'upgrade per aggiungerne altri.`)
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name, slug, plan }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error === 'slug_taken' ? 'Questo slug è già in uso.' : body.error ?? 'Errore.')
      setLoading(false)
      return
    }

    router.push('/dashboard/venues')
    router.refresh()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">NUOVO LOCALE</h2>
          <p className="ss">Aggiungi un locale al tuo account</p>
        </div>
        <button className="btn btn-g" onClick={() => router.back()}>← Indietro</button>
      </div>

      <div style={{ maxWidth: 540 }}>
        {error && (
          <div style={{ background: 'rgba(255,45,45,.08)', border: '1px solid rgba(255,45,45,.2)', padding: '12px 16px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--red)', marginBottom: 24 }}>
            {error}
            {error.includes('upgrade') && (
              <a href="/dashboard/upgrade" style={{ color: 'var(--acid)', marginLeft: 8 }}>Vai ai piani →</a>
            )}
          </div>
        )}

        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 32 }}>
          <div className="field">
            <label className="lbl">Nome del locale</label>
            <input
              className="inp" placeholder="es. Amnesia Milano"
              value={name} autoFocus
              onChange={e => { setName(e.target.value); setSlug(toSlug(e.target.value)) }}
            />
          </div>

          <div className="field">
            <label className="lbl">Slug URL</label>
            <input
              className="inp" placeholder="amnesia-milano"
              value={slug}
              onChange={e => setSlug(toSlug(e.target.value))}
            />
            {slug && (
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', marginTop: 6 }}>
                drop.fm/venue/<span style={{ color: 'var(--acid)' }}>{slug}</span>
              </p>
            )}
          </div>

          <button
            className="btn btn-a"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={!name || !slug || loading}
            onClick={handleCreate}
          >
            {loading ? <><span className="spin" /> Creazione...</> : 'Crea locale →'}
          </button>
        </div>
      </div>
    </>
  )
}
