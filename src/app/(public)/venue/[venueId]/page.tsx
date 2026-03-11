'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Track { id: string; title: string; artist: string; bpm: number | null; key: string | null; genre: string | null; duration: number | null }
interface Venue  { id: string; name: string; settings: { min_offer: number; max_offer: number } }

type Step = 'search' | 'offer' | 'confirm' | 'sent'

const GENRES = ['House','Trap','Hip-Hop','Pop','R&B','Latin','Disco','Techno','Funk','Reggaeton']

export default function VenuePage({ params }: { params: { venueId: string } }) {
  const [venue,       setVenue]       = useState<Venue | null>(null)
  const [tracks,      setTracks]      = useState<Track[]>([])
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState<Track | null>(null)
  const [offer,       setOffer]       = useState(5)
  const [dedication,  setDedication]  = useState('')
  const [step,        setStep]        = useState<Step>('search')
  const [loading,     setLoading]     = useState(false)
  const [venueLoading,setVenueLoading]= useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const supabase  = createClient()

  const MIN_OFFER = venue?.settings?.min_offer ?? 2
  const MAX_OFFER = venue?.settings?.max_offer ?? 20

  useEffect(() => {
    const load = async () => {
      // params.venueId puo essere uno slug (es. "amnesia-milano") o un UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.venueId)
      const { data: v } = await supabase
        .from('venues').select('id,name,settings')
        .eq(isUuid ? 'id' : 'slug', params.venueId)
        .single()
      setVenue(v)
      setVenueLoading(false)
      if (v) {
        const { data: t } = await supabase.from('tracks').select('*').eq('venue_id', v.id).order('artist').limit(500)
        setTracks(t ?? [])
      }
    }
    load()
  }, [params.venueId])

  useEffect(() => {
    if (step === 'search') setTimeout(() => searchRef.current?.focus(), 100)
  }, [step])

  const filtered = tracks.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !search || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    const matchGenre  = !activeGenre || t.genre === activeGenre
    return matchSearch && matchGenre
  })

  const handleSelect = (t: Track) => {
    setSelected(t)
    setOffer(MIN_OFFER)
    setDedication('')
    setStep('offer')
  }

  const handleSubmit = async () => {
    if (!selected || !venue) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: venue.id, trackId: selected.id, amount: offer, dedication: dedication || null }),
      })
      if (res.ok) {
        setStep('sent')
      } else {
        const b = await res.json()
        setError(b.error ?? 'Errore durante la richiesta')
      }
    } catch {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  const reset = () => { setStep('search'); setSelected(null); setSearch(''); setActiveGenre(null) }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #0a0a0a; --mid: #111; --card: #161616; --border: #222;
      --acid: #d4f000; --white: #f0ece0; --muted: #444; --red: #ff2d2d;
    }
    html, body { background: var(--black); color: var(--white); font-family: 'DM Sans', sans-serif; min-height: 100dvh; cursor: default; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; max-width: 480px; margin: 0 auto; }

    /* Header */
    .header { padding: 20px 20px 0; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: var(--acid); }
    .venue-name { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }

    /* Hero */
    .hero { padding: 28px 20px 20px; }
    .hero-tag { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
    .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: .95; color: var(--white); margin-bottom: 4px; }
    .hero-title span { color: var(--acid); }
    .hero-sub { font-size: 13px; color: var(--muted); font-weight: 300; line-height: 1.5; }

    /* Search */
    .search-wrap { padding: 0 20px; margin-bottom: 12px; position: sticky; top: 0; z-index: 10; background: var(--black); padding-top: 12px; padding-bottom: 12px; }
    .search-box { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1px solid var(--border); padding: 0 16px; height: 50px; transition: border-color .2s; }
    .search-box:focus-within { border-color: var(--acid); }
    .search-icon { color: var(--muted); font-size: 16px; flex-shrink: 0; }
    .search-inp { flex: 1; background: none; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: var(--white); }
    .search-inp::placeholder { color: var(--muted); }
    .search-clear { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; line-height: 1; padding: 4px; transition: color .15s; }
    .search-clear:hover { color: var(--white); }

    /* Genres */
    .genres { display: flex; gap: 6px; overflow-x: auto; padding: 0 20px 12px; scrollbar-width: none; }
    .genres::-webkit-scrollbar { display: none; }
    .genre-pill { flex-shrink: 0; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 6px 12px; border: 1px solid var(--border); color: var(--muted); background: none; cursor: pointer; transition: all .15s; white-space: nowrap; }
    .genre-pill.active { border-color: var(--acid); color: var(--acid); background: rgba(212,240,0,.06); }

    /* Track list */
    .tracks { padding: 0 20px; flex: 1; }
    .tracks-header { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); padding: 0 0 10px; display: flex; justify-content: space-between; }
    .track-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; border-radius: 0; }
    .track-item:active { opacity: .7; }
    .track-num { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); width: 20px; text-align: right; flex-shrink: 0; }
    .track-avatar { width: 44px; height: 44px; background: var(--card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
    .track-info { flex: 1; min-width: 0; }
    .track-title { font-size: 14px; font-weight: 500; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
    .track-artist { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
    .track-bpm { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--acid); }
    .track-key { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--muted); }
    .track-arrow { color: var(--muted); font-size: 14px; margin-left: 4px; }

    /* Offer sheet */
    .sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 100; display: flex; align-items: flex-end; animation: fadeIn .2s; }
    .sheet { width: 100%; max-width: 480px; margin: 0 auto; background: var(--mid); border-top: 1px solid var(--border); padding: 0 0 env(safe-area-inset-bottom,20px); animation: slideUp .25s cubic-bezier(.32,.72,0,1); }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
    .sheet-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 12px auto 0; }
    .sheet-inner { padding: 24px 20px 20px; }
    .sheet-track { display: flex; gap: 14px; align-items: center; padding: 16px; background: var(--card); border: 1px solid var(--border); margin-bottom: 28px; }
    .sheet-track-title { font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 2px; }
    .sheet-track-artist { font-size: 12px; color: var(--muted); }
    .sheet-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }

    /* Offer slider */
    .offer-display { text-align: center; margin-bottom: 20px; }
    .offer-amount { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; color: var(--acid); }
    .offer-hint { font-size: 11px; color: var(--muted); margin-top: 4px; }
    .offer-slider { width: 100%; -webkit-appearance: none; height: 4px; background: var(--border); outline: none; margin-bottom: 6px; }
    .offer-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; background: var(--acid); cursor: pointer; border-radius: 50%; }
    .offer-slider::-moz-range-thumb { width: 24px; height: 24px; background: var(--acid); cursor: pointer; border-radius: 50%; border: none; }
    .offer-range { display: flex; justify-content: space-between; font-family: 'Space Mono', monospace; font-size: 9px; color: var(--muted); margin-bottom: 24px; }
    .offer-presets { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 24px; }
    .preset-btn { padding: 10px; border: 1px solid var(--border); background: var(--card); color: var(--muted); font-family: 'Space Mono', monospace; font-size: 11px; cursor: pointer; transition: all .15s; }
    .preset-btn.active { border-color: var(--acid); color: var(--acid); background: rgba(212,240,0,.06); }

    /* Dedication */
    .dedication-inp { width: 100%; background: var(--card); border: 1px solid var(--border); padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--white); outline: none; resize: none; height: 70px; margin-bottom: 20px; transition: border-color .2s; }
    .dedication-inp::placeholder { color: var(--muted); }
    .dedication-inp:focus { border-color: var(--acid); }

    /* CTA */
    .cta-btn { width: 100%; height: 56px; background: var(--acid); color: var(--black); font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity .15s; }
    .cta-btn:disabled { opacity: .5; cursor: not-allowed; }
    .cta-btn:active:not(:disabled) { opacity: .85; }
    .cta-cancel { width: 100%; margin-top: 8px; padding: 14px; border: 1px solid var(--border); background: none; color: var(--muted); font-family: 'Space Mono', monospace; font-size: 10px; cursor: pointer; }

    /* Error */
    .error-banner { margin: 0 20px 12px; background: rgba(255,45,45,.08); border: 1px solid rgba(255,45,45,.2); padding: 10px 14px; font-family: 'Space Mono', monospace; font-size: 10px; color: var(--red); }

    /* Success */
    .success { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
    .success-ring { width: 80px; height: 80px; border: 2px solid var(--acid); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 28px; animation: pop .4s cubic-bezier(.34,1.56,.64,1); }
    @keyframes pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    .success-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 2px; color: var(--white); margin-bottom: 8px; }
    .success-sub { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 32px; }
    .success-track { background: var(--card); border: 1px solid var(--border); padding: 16px; width: 100%; text-align: left; margin-bottom: 32px; }
    .success-track-title { font-size: 16px; font-weight: 600; color: var(--white); }
    .success-track-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .success-offer { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--acid); margin-top: 8px; }
    .success-note { font-family: 'Space Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 1px; line-height: 1.8; }

    /* Empty */
    .empty-tracks { padding: 48px 20px; text-align: center; }
    .empty-tracks p { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }

    /* Spinner */
    @keyframes spin { to { transform: rotate(360deg) } }
    .spin { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(0,0,0,.3); border-top-color: var(--black); border-radius: 50%; animation: spin .6s linear infinite; }

    /* Loading full */
    .loading-full { flex: 1; display: flex; align-items: center; justify-content: center; }
    .loading-full .spin { width: 32px; height: 32px; border-color: var(--border); border-top-color: var(--acid); }
  `

  const genreEmoji: Record<string,string> = {
    House:'🏠', Trap:'🔥', 'Hip-Hop':'🎤', Pop:'✨', 'R&B':'🎵',
    Latin:'💃', Disco:'🪩', Techno:'⚡', Funk:'🎸', Reggaeton:'🌴',
  }

  if (venueLoading) return (
    <>
      <style>{css}</style>
      <div className="page"><div className="loading-full"><span className="spin" /></div></div>
    </>
  )

  if (!venue) return (
    <>
      <style>{css}</style>
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: '#333' }}>404</p>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#444', marginTop: 8, letterSpacing: 2 }}>LOCALE NON TROVATO</p>
      </div>
    </>
  )

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 'sent') return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="header">
          <span className="logo">DROP.FM</span>
          <span className="venue-name">{venue.name}</span>
        </div>
        <div className="success">
          <div className="success-ring">🎧</div>
          <h1 className="success-title">RICHIESTA INVIATA!</h1>
          <p className="success-sub">La tua offerta è stata mandata al DJ.<br />La carta verrà addebitata solo se accetta.</p>
          {selected && (
            <div className="success-track">
              <div className="success-track-title">{selected.title}</div>
              <div className="success-track-sub">{selected.artist}</div>
              <div className="success-offer">€{offer}</div>
            </div>
          )}
          <p className="success-note">
            ADDEBITO SOLO SE ACCETTATA<br />
            RIMBORSO AUTOMATICO SE RIFIUTATA
          </p>
          <button className="cta-btn" style={{ marginTop: 32 }} onClick={reset}>
            + NUOVA RICHIESTA
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="page">

        {/* Header */}
        <div className="header">
          <span className="logo">DROP.FM</span>
          <span className="venue-name">{venue.name}</span>
        </div>

        {/* Hero */}
        <div className="hero">
          <p className="hero-tag">Jukebox digitale</p>
          <h1 className="hero-title">FALLO<br /><span>SUONARE</span></h1>
          <p className="hero-sub">Scegli una canzone, fai la tua offerta.<br />Paghi solo se il DJ la accetta.</p>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input ref={searchRef} className="search-inp" placeholder="Cerca titolo o artista..." value={search}
              onChange={e => setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
          </div>
        </div>

        {/* Genre pills */}
        {!search && (
          <div className="genres">
            {GENRES.filter(g => tracks.some(t => t.genre === g)).map(g => (
              <button key={g} className={`genre-pill${activeGenre === g ? ' active' : ''}`}
                onClick={() => setActiveGenre(activeGenre === g ? null : g)}>
                {genreEmoji[g] ?? '🎵'} {g}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Track list */}
        <div className="tracks">
          {filtered.length > 0 && (
            <div className="tracks-header">
              <span>{filtered.length} brani {activeGenre ? `· ${activeGenre}` : ''}</span>
              <span>BPM / KEY</span>
            </div>
          )}

          {filtered.map((t, i) => (
            <div key={t.id} className="track-item" onClick={() => handleSelect(t)}>
              <span className="track-num">{i + 1}</span>
              <div className="track-avatar">{genreEmoji[t.genre ?? ''] ?? '🎵'}</div>
              <div className="track-info">
                <div className="track-title">{t.title}</div>
                <div className="track-artist">{t.artist}</div>
              </div>
              <div className="track-meta">
                {t.bpm   && <span className="track-bpm">{t.bpm}</span>}
                {t.key   && <span className="track-key">{t.key}</span>}
              </div>
              <span className="track-arrow">›</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-tracks">
              <p>{search ? `Nessun risultato per "${search}"` : 'Nessun brano disponibile'}</p>
            </div>
          )}
        </div>

        {/* Offer sheet */}
        {(step === 'offer' || step === 'confirm') && selected && (
          <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setStep('search')}>
            <div className="sheet">
              <div className="sheet-handle" />
              <div className="sheet-inner">

                {/* Selected track */}
                <div className="sheet-track">
                  <div style={{ width: 44, height: 44, background: 'var(--black)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {genreEmoji[selected.genre ?? ''] ?? '🎵'}
                  </div>
                  <div>
                    <div className="sheet-track-title">{selected.title}</div>
                    <div className="sheet-track-artist">{selected.artist}</div>
                  </div>
                </div>

                {/* Offer */}
                <p className="sheet-label">La tua offerta</p>
                <div className="offer-display">
                  <div className="offer-amount">€{offer}</div>
                  <div className="offer-hint">Addebitato solo se il DJ accetta</div>
                </div>

                <input type="range" className="offer-slider"
                  min={MIN_OFFER} max={MAX_OFFER} step={1} value={offer}
                  onChange={e => setOffer(Number(e.target.value))} />
                <div className="offer-range"><span>€{MIN_OFFER}</span><span>€{MAX_OFFER}</span></div>

                {/* Presets */}
                <div className="offer-presets">
                  {[MIN_OFFER, 5, 10, MAX_OFFER].filter((v,i,a) => a.indexOf(v) === i).slice(0,4).map(v => (
                    <button key={v} className={`preset-btn${offer === v ? ' active' : ''}`} onClick={() => setOffer(v)}>€{v}</button>
                  ))}
                </div>

                {/* Dedication */}
                <p className="sheet-label">Dedica (opzionale)</p>
                <textarea className="dedication-inp" placeholder="es. Per Laura che compie 25 anni! 🎂"
                  value={dedication} maxLength={120}
                  onChange={e => setDedication(e.target.value)} />

                <button className="cta-btn" disabled={loading} onClick={handleSubmit}>
                  {loading ? <><span className="spin" /> INVIO...</> : `🎧 RICHIEDI PER €${offer}`}
                </button>
                <button className="cta-cancel" onClick={() => setStep('search')}>Annulla</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
