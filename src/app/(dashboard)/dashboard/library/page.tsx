'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Track {
  id:       string
  title:    string
  artist:   string
  bpm:      number | null
  key:      string | null
  duration: number | null
  genre:    string | null
}

const EMPTY_FORM = { title: '', artist: '', bpm: '', key: '', genre: '', duration: '' }

function fmtDuration(sec: number | null) {
  if (!sec) return '--'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function LibraryPage() {
  const [venueId,         setVenueId]         = useState<string | null>(null)
  const [tracks,          setTracks]          = useState<Track[]>([])
  const [search,          setSearch]          = useState('')
  const [loading,         setLoading]         = useState(true)
  const [importing,       setImporting]       = useState(false)
  const [importResult,    setImportResult]    = useState<number | null>(null)
  const [drag,            setDrag]            = useState(false)
  const [showAddForm,     setShowAddForm]     = useState(false)
  const [showSeedConfirm, setShowSeedConfirm] = useState(false)
  const [newTrack,        setNewTrack]        = useState(EMPTY_FORM)
  const [addingTrack,     setAddingTrack]     = useState(false)
  const [addError,        setAddError]        = useState<string | null>(null)
  const [seeding,         setSeeding]         = useState(false)
  const [seedResult,      setSeedResult]      = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('venues').select('id').eq('owner_id', user.id).limit(1).single()
      if (data) setVenueId(data.id)
    })
  }, [])

  useEffect(() => { if (venueId) fetchTracks() }, [venueId, search])

  const fetchTracks = async () => {
    if (!venueId) return
    setLoading(true)
    let q = supabase.from('tracks').select('*').eq('venue_id', venueId)
    if (search) q = q.or(`title.ilike.%${search}%,artist.ilike.%${search}%`)
    const { data } = await q.order('artist').order('title').limit(500)
    setTracks(data ?? [])
    setLoading(false)
  }

  const handleImport = async (file: File) => {
    if (!venueId) return
    setImporting(true); setImportResult(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('venue_id', venueId)
    const res = await fetch('/api/tracks', { method: 'POST', body: formData })
    if (res.ok) { const b = await res.json(); setImportResult(b.imported); fetchTracks() }
    setImporting(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('tracks').delete().eq('id', id)
    setTracks(prev => prev.filter(t => t.id !== id))
  }

  const handleAddTrack = async () => {
    if (!venueId || !newTrack.title || !newTrack.artist) return
    setAddingTrack(true); setAddError(null)
    const res = await fetch('/api/tracks/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId,
        title:    newTrack.title,
        artist:   newTrack.artist,
        bpm:      newTrack.bpm      ? Number(newTrack.bpm)      : null,
        key:      newTrack.key      || null,
        genre:    newTrack.genre    || null,
        duration: newTrack.duration ? Number(newTrack.duration) : null,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setTracks(prev => [...prev, data].sort((a, b) => a.artist.localeCompare(b.artist)))
      setNewTrack(EMPTY_FORM); setShowAddForm(false)
    } else {
      const b = await res.json()
      setAddError(b.error ?? 'Errore durante il salvataggio')
    }
    setAddingTrack(false)
  }

  const handleSeed = async () => {
    if (!venueId) return
    setSeeding(true)
    const res = await fetch('/api/tracks/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
    })
    if (res.ok) { const b = await res.json(); setSeedResult(b.message); setShowSeedConfirm(false); fetchTracks() }
    setSeeding(false)
  }

  const filtered = tracks.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">LIBRERIA DJ</h2>
          <p className="ss">{tracks.length} brani nella libreria</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-g" onClick={() => setShowSeedConfirm(s => !s)}>🎲 Seed Mock</button>
          <button className="btn btn-g" onClick={() => { setShowAddForm(f => !f); setAddError(null); setNewTrack(EMPTY_FORM) }}>
            {showAddForm ? '✕ Chiudi' : '+ Aggiungi manuale'}
          </button>
          <button className="btn btn-a" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <><span className="spin" /> Importando...</> : '↑ Import Rekordbox'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".xml" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])} />
      </div>

      {showSeedConfirm && (
        <div style={{ background: 'rgba(212,240,0,.05)', border: '1px solid rgba(212,240,0,.2)', padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--acid)' }}>
            Aggiunge ~40 tracce mock reali — ideale per testare
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-g" style={{ padding: '6px 14px', fontSize: 9 }} onClick={() => setShowSeedConfirm(false)}>Annulla</button>
            <button className="btn btn-a" style={{ padding: '6px 14px', fontSize: 9 }} disabled={seeding} onClick={handleSeed}>
              {seeding ? <><span className="spin" /> Carico...</> : 'Conferma →'}
            </button>
          </div>
        </div>
      )}

      {seedResult && (
        <div style={{ background: 'rgba(0,230,118,.06)', border: '1px solid rgba(0,230,118,.2)', padding: '12px 20px', marginBottom: 16, fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#00e676', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ✓ {seedResult}
          <button style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }} onClick={() => setSeedResult(null)}>✕</button>
        </div>
      )}

      {showAddForm && (
        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24, marginBottom: 16 }}>
          <p className="dc-title" style={{ marginBottom: 16 }}>Aggiungi brano manualmente</p>
          {addError && (
            <div style={{ background: 'rgba(255,45,45,.08)', border: '1px solid rgba(255,45,45,.2)', padding: '10px 14px', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--red)', marginBottom: 14 }}>
              {addError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">Titolo *</label>
              <input className="inp" placeholder="es. Blinding Lights" value={newTrack.title} autoFocus
                onChange={e => setNewTrack(t => ({ ...t, title: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">Artista *</label>
              <input className="inp" placeholder="es. The Weeknd" value={newTrack.artist}
                onChange={e => setNewTrack(t => ({ ...t, artist: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">BPM</label>
              <input className="inp" type="number" placeholder="128" value={newTrack.bpm}
                onChange={e => setNewTrack(t => ({ ...t, bpm: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">Chiave</label>
              <input className="inp" placeholder="Am" value={newTrack.key}
                onChange={e => setNewTrack(t => ({ ...t, key: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">Genere</label>
              <input className="inp" placeholder="House" value={newTrack.genre}
                onChange={e => setNewTrack(t => ({ ...t, genre: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="lbl">Durata (sec)</label>
              <input className="inp" type="number" placeholder="240" value={newTrack.duration}
                onChange={e => setNewTrack(t => ({ ...t, duration: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-a" disabled={!newTrack.title || !newTrack.artist || addingTrack} onClick={handleAddTrack}>
              {addingTrack ? <><span className="spin" /> Aggiungo...</> : '+ Aggiungi brano'}
            </button>
            <button className="btn btn-g" onClick={() => setNewTrack(EMPTY_FORM)}>Pulisci</button>
          </div>
        </div>
      )}

      {importResult !== null && (
        <div style={{ background: 'rgba(212,240,0,.08)', border: '1px solid rgba(212,240,0,.2)', padding: '12px 20px', marginBottom: 16, fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'var(--acid)' }}>
          ✓ Importati {importResult} brani con successo
        </div>
      )}

      {!loading && tracks.length === 0 && (
        <div className={`upload${drag ? ' drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleImport(f) }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="upload-icon">📂</div>
          <p className="upload-t">NESSUN BRANO IN LIBRERIA</p>
          <p className="upload-s">
            Importa da Rekordbox XML, aggiungi manualmente<br />oppure carica le tracce mock con <strong style={{ color: 'var(--acid)' }}>🎲 Seed Mock</strong>
          </p>
        </div>
      )}

      {tracks.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <input className="inp" placeholder="🔍  Cerca per titolo o artista..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th><th>Titolo</th><th>Artista</th><th>BPM</th><th>Chiave</th><th>Durata</th><th>Genere</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td className="td-m" style={{ color: '#444' }}>{i + 1}</td>
                  <td className="td-w">{t.title}</td>
                  <td>{t.artist}</td>
                  <td className="td-m">{t.bpm ?? '--'}</td>
                  <td className="td-m" style={{ color: 'var(--acid)' }}>{t.key ?? '--'}</td>
                  <td className="td-m">{fmtDuration(t.duration)}</td>
                  <td style={{ color: '#555' }}>{t.genre ?? '--'}</td>
                  <td><button className="btn btn-r" style={{ padding: '5px 10px', fontSize: 9 }} onClick={() => handleDelete(t.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}
      {!loading && tracks.length > 0 && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <p className="empty-t">NESSUN RISULTATO</p>
          <p className="empty-s">Prova con un altro termine di ricerca</p>
        </div>
      )}
    </>
  )
}
