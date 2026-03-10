'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Track {
  id: string
  title: string
  artist: string
  bpm: number | null
  key: string | null
  duration: number | null
  genre: string | null
}

function fmtDuration(sec: number | null) {
  if (!sec) return '--'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function LibraryPage() {
  const [venueId, setVenueId] = useState<string | null>(null)
  const [tracks,  setTracks]  = useState<Track[]>([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ added: number; total: number } | null>(null)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('venues').select('id').eq('owner_id', user.id).limit(1).single()
      if (data) setVenueId(data.id)
    })
  }, [])

  useEffect(() => {
    if (!venueId) return
    fetchTracks()
  }, [venueId, search])

  const fetchTracks = async () => {
    if (!venueId) return
    setLoading(true)
    let q = supabase.from('tracks').select('*').eq('venue_id', venueId)
    if (search) q = q.or(`title.ilike.%${search}%,artist.ilike.%${search}%`)
    const { data } = await q.order('artist').order('title').limit(200)
    setTracks(data ?? [])
    setLoading(false)
  }

  const handleImport = async (file: File) => {
    if (!venueId) return
    setImporting(true)
    setImportResult(null)
    const xml = await file.text()
    const res = await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xml, venueId }),
    })
    if (res.ok) {
      const body = await res.json()
      setImportResult({ added: body.added, total: body.total })
      fetchTracks()
    }
    setImporting(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('tracks').delete().eq('id', id)
    setTracks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = tracks.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      {/* Header */}
      <div className="sh">
        <div>
          <h2 className="st">LIBRERIA DJ</h2>
          <p className="ss">{tracks.length} brani importati</p>
        </div>
        <button className="btn btn-a" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? <><span className="spin" /> Importando...</> : '↑ Import Rekordbox'}
        </button>
        <input
          ref={fileRef} type="file" accept=".xml" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
        />
      </div>

      {/* Import result */}
      {importResult && (
        <div style={{ background: 'rgba(212,240,0,.08)', border: '1px solid rgba(212,240,0,.2)', padding: '12px 20px', marginBottom: 24, fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'var(--acid)' }}>
          ✓ Importati {importResult.added} brani nuovi su {importResult.total} totali
        </div>
      )}

      {/* Drop zone (when empty) */}
      {tracks.length === 0 && !loading && (
        <div
          className={`upload${drag ? ' drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => {
            e.preventDefault(); setDrag(false)
            const f = e.dataTransfer.files[0]
            if (f) handleImport(f)
          }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="upload-icon">📂</div>
          <p className="upload-t">IMPORTA REKORDBOX</p>
          <p className="upload-s">
            Trascina il file XML qui oppure clicca per sfogliare<br />
            Rekordbox → File → Export Collection → XML
          </p>
        </div>
      )}

      {/* Search */}
      {tracks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            className="inp"
            placeholder="Cerca per titolo o artista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Tracks table */}
      {filtered.length > 0 && (
        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Artista</th>
                <th>BPM</th>
                <th>Chiave</th>
                <th>Durata</th>
                <th>Genere</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="td-w">{t.title}</td>
                  <td>{t.artist}</td>
                  <td className="td-m">{t.bpm ?? '--'}</td>
                  <td className="td-m" style={{ color: 'var(--acid)' }}>{t.key ?? '--'}</td>
                  <td className="td-m">{fmtDuration(t.duration)}</td>
                  <td>{t.genre ?? '--'}</td>
                  <td>
                    <button
                      className="btn btn-r"
                      style={{ padding: '6px 12px', fontSize: 9 }}
                      onClick={() => handleDelete(t.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>
      )}

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
