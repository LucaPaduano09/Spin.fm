'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface VenueSettings {
  min_offer:         number
  max_offer:         number
  auction_mode:      boolean
  dynamic_pricing:   boolean
  blacklist_artists: string[]
  allowed_genres:    string[]
}

interface Venue {
  id:       string
  name:     string
  slug:     string
  plan:     string
  settings: VenueSettings
  stripe_account_id: string | null
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="tog">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="tog-sl" />
    </label>
  )
}

export default function SettingsPage() {
  const [venue,   setVenue]   = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [tab,     setTab]     = useState<'venue' | 'pricing' | 'account'>('venue')
  const [form,    setForm]    = useState({ name: '', slug: '' })
  const [settings, setSettings] = useState<VenueSettings>({
    min_offer: 2, max_offer: 20,
    auction_mode: false, dynamic_pricing: false,
    blacklist_artists: [], allowed_genres: [],
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('venues').select('*').eq('owner_id', user.id).limit(1).single()
      if (data) {
        setVenue(data)
        setForm({ name: data.name, slug: data.slug })
        setSettings(data.settings ?? {
          min_offer: 2, max_offer: 20, auction_mode: false,
          dynamic_pricing: false, blacklist_artists: [], allowed_genres: [],
        })
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!venue) return
    setSaving(true)
    await supabase.from('venues').update({
      name:     form.name,
      slug:     form.slug,
      settings: settings,
    }).eq('id', venue.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toSlug = (s: string) => s.toLowerCase()
    .replace(/[àáâäå]/g,'a').replace(/[èéêë]/g,'e')
    .replace(/[ìíî]/g,'i').replace(/[òóô]/g,'o').replace(/[ùúû]/g,'u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />
      <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">IMPOSTAZIONI</h2>
          <p className="ss">{venue?.name} · Piano {venue?.plan}</p>
        </div>
        <button className="btn btn-a" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spin" /> Salvo...</> : saved ? '✓ Salvato' : 'Salva modifiche'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {(['venue', 'pricing', 'account'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-a' : 'btn-g'}`} style={{ padding: '8px 20px' }} onClick={() => setTab(t)}>
            {t === 'venue' ? 'Locale' : t === 'pricing' ? 'Prezzi & Regole' : 'Account'}
          </button>
        ))}
      </div>

      {/* TAB: Venue */}
      {tab === 'venue' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
            <p className="dc-title" style={{ marginBottom: 20 }}>Info locale</p>

            <div className="field">
              <label className="lbl">Nome del locale</label>
              <input className="inp" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })) }} />
            </div>

            <div className="field">
              <label className="lbl">Slug URL</label>
              <input className="inp" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))} />
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', marginTop: 6 }}>
                drop.fm/venue/<span style={{ color: 'var(--acid)' }}>{form.slug}</span>
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
            <p className="dc-title" style={{ marginBottom: 20 }}>Piano attivo</p>
            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--acid)', marginBottom: 8 }}>
              {venue?.plan?.toUpperCase()}
            </p>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
              {venue?.plan === 'basic'  && 'Fino a 1 locale · 10% commissione · Import Rekordbox'}
              {venue?.plan === 'pro'    && 'Fino a 3 locali · 10% commissione · Asta live · Analytics'}
              {venue?.plan === 'agency' && 'Locali illimitati · 8% commissione · White label · API'}
            </p>
            <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }}>
              Cambia piano →
            </button>
          </div>
        </div>
      )}

      {/* TAB: Pricing */}
      {tab === 'pricing' && (
        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
          <p className="dc-title" style={{ marginBottom: 20 }}>Regole offerte</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="field">
              <label className="lbl">Offerta minima (€)</label>
              <input type="number" className="inp" min={1} max={50}
                value={settings.min_offer}
                onChange={e => setSettings(s => ({ ...s, min_offer: Number(e.target.value) }))} />
            </div>
            <div className="field">
              <label className="lbl">Offerta massima (€)</label>
              <input type="number" className="inp" min={1} max={500}
                value={settings.max_offer}
                onChange={e => setSettings(s => ({ ...s, max_offer: Number(e.target.value) }))} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div className="tog-row">
              <div>
                <p className="tog-lbl">Modalità asta live</p>
                <p className="tog-sub">I clienti possono superare l&apos;offerta più alta per scalare la coda</p>
              </div>
              <Toggle
                checked={settings.auction_mode}
                onChange={v => setSettings(s => ({ ...s, auction_mode: v }))}
              />
            </div>
            <div className="tog-row">
              <div>
                <p className="tog-lbl">Prezzi dinamici</p>
                <p className="tog-sub">Il prezzo minimo aumenta automaticamente nelle ore di punta</p>
              </div>
              <Toggle
                checked={settings.dynamic_pricing}
                onChange={v => setSettings(s => ({ ...s, dynamic_pricing: v }))}
              />
            </div>
          </div>

          {(settings.auction_mode || settings.dynamic_pricing) && venue?.plan === 'basic' && (
            <div style={{ marginTop: 16, background: 'rgba(255,200,0,.08)', border: '1px solid rgba(255,200,0,.2)', padding: '12px 16px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#ffc800' }}>
              ⚠ Queste funzioni richiedono il piano Pro o superiore
            </div>
          )}
        </div>
      )}

      {/* TAB: Account */}
      {tab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
            <p className="dc-title" style={{ marginBottom: 20 }}>Stripe Connect</p>
            {venue?.stripe_account_id ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--green)' }}>Connesso</span>
                </div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', wordBreak: 'break-all', marginBottom: 16 }}>
                  {venue.stripe_account_id}
                </p>
                <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                  Apri Stripe Dashboard ↗
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 16 }}>
                  Connetti il tuo account Stripe per ricevere i pagamenti direttamente sul tuo conto bancario.
                </p>
                <button className="btn btn-a" style={{ width: '100%', justifyContent: 'center' }}>
                  Connetti Stripe →
                </button>
              </>
            )}
          </div>

          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
            <p className="dc-title" style={{ marginBottom: 20 }}>Zona pericolosa</p>
            <div className="tog-row" style={{ paddingTop: 0 }}>
              <div>
                <p className="tog-lbl" style={{ color: '#555' }}>Elimina locale</p>
                <p className="tog-sub">Questa azione è irreversibile</p>
              </div>
              <button className="btn btn-r" style={{ padding: '8px 16px', fontSize: 9 }}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
