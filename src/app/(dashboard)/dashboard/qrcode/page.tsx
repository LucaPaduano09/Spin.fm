'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

declare global {
  interface Window { QRCode: new (el: HTMLElement, opts: object) => void }
}

interface Venue { id: string; name: string; slug: string; plan: string }

export default function QRCodePage() {
  const [venues,  setVenues]  = useState<Venue[]>([])
  const [active,  setActive]  = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const qrRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Carica script QRCode.js da CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.async = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('venues').select('id,name,slug,plan').eq('owner_id', user.id)
      if (data) { setVenues(data); setActive(data[0] ?? null) }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!active || !qrRef.current) return
    qrRef.current.innerHTML = ''

    const url = `${window.location.origin}/venue/${active.id}`

    const tryGenerate = () => {
      if (window.QRCode) {
        new window.QRCode(qrRef.current!, {
          text: url, width: 256, height: 256,
          colorDark: '#000000', colorLight: '#ffffff',
          correctLevel: 2,
        })
      } else {
        setTimeout(tryGenerate, 200)
      }
    }
    setTimeout(tryGenerate, 100)
  }, [active])

  const venueUrl = active ? `${typeof window !== 'undefined' ? window.location.origin : 'https://drop.fm'}/venue/${active.id}` : ''

  const handlePrint = () => window.print()

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${active?.slug}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />
      <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>

      <div className="sh no-print">
        <div>
          <h2 className="st">QR CODE</h2>
          <p className="ss">Da stampare e mettere sui tavoli</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-g" onClick={handlePrint}>🖨 Stampa</button>
          <button className="btn btn-a" onClick={handleDownload}>↓ Download PNG</button>
        </div>
      </div>

      {/* Venue selector (se multipli) */}
      {venues.length > 1 && (
        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {venues.map(v => (
            <button
              key={v.id}
              className={`btn ${active?.id === v.id ? 'btn-a' : 'btn-g'}`}
              onClick={() => setActive(v)}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* QR preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Left: QR card */}
        <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>
            QR CODE — {active?.name}
          </p>

          {/* QR box */}
          <div style={{ background: '#fff', padding: 20, display: 'inline-block', marginBottom: 24 }}>
            <div ref={qrRef} />
          </div>

          <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 2, marginBottom: 8 }}>
            RICHIEDI UN BRANO
          </p>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#555', letterSpacing: 1 }}>
            Scansiona per scegliere la tua canzone
          </p>
          <div style={{ marginTop: 16, padding: '8px 16px', background: 'var(--black)', fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--acid)', letterSpacing: 1, wordBreak: 'break-all' }}>
            {venueUrl}
          </div>
        </div>

        {/* Right: instructions */}
        <div>
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24, marginBottom: 16 }}>
            <p className="dc-title">Come usarlo</p>
            {[
              ['1', 'Stampa il QR code su carta A4 o cartoncino'],
              ['2', 'Posizionalo sui tavoli o al bancone'],
              ['3', 'I clienti scansionano e scelgono un brano'],
              ['4', 'Tu accetti o rifiuti dalla dashboard Live'],
              ['5', 'Il pagamento avviene solo se accetti'],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'var(--acid)', lineHeight: 1, minWidth: 20 }}>{n}</span>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
            <p className="dc-title">Link diretto</p>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'var(--acid)', wordBreak: 'break-all', marginBottom: 12 }}>
              {venueUrl}
            </p>
            <button
              className="btn btn-g"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigator.clipboard.writeText(venueUrl)}
            >
              📋 Copia link
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
