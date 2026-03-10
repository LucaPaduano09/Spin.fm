'use client'

import { authStyles } from '@/components/auth/authStyles'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <a href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4, color: 'var(--white)', textDecoration: 'none', display: 'block', marginBottom: 48 }}>
            DROP<span style={{ color: 'var(--acid)' }}>.</span>FM
          </a>
          <div style={{ fontSize: 48, marginBottom: 24 }}>📬</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: 'var(--acid)', marginBottom: 16 }}>
            CONTROLLA<br />LA EMAIL
          </h1>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            Ti abbiamo inviato un link di conferma.
            Clicca sul link nell&apos;email per attivare il tuo account e accedere alla dashboard.
          </p>
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: '16px 20px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            Non trovi l&apos;email? Controlla la cartella spam o{' '}
            <span style={{ color: 'var(--acid)', cursor: 'pointer' }}>richiedi un nuovo invio</span>.
          </div>
          <Link href="/login" style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#555', textDecoration: 'none' }}>
            ← Torna al login
          </Link>
        </div>
      </div>
    </>
  )
}
