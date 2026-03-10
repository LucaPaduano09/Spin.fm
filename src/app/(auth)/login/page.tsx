'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { authStyles } from '@/components/auth/authStyles'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o password errati. Riprova.'
          : error.message
      )
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />

      <div className="auth-root">
        {/* ── LEFT ── */}
        <AuthLeftPanel
          title={<>BENTORNATO<br /><span className="acid">AL</span><br /><span className="outline">MIXER</span></>}
          subtitle="Accedi alla tua dashboard per gestire le richieste, le serate e i tuoi guadagni in tempo reale."
          features={[
            'Dashboard DJ in real-time',
            'Accetta o rifiuta richieste',
            'Analytics delle serate',
            'Pagamenti automatici Stripe',
          ]}
        />

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <h1 className="auth-form-title">ACCEDI</h1>
            <p className="auth-form-sub">Dashboard DJ / Locale</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="nome@locale.it"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <Link
                  href="/forgot-password"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555', textDecoration: 'none', letterSpacing: 1 }}
                >
                  Password dimenticata?
                </Link>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <><span className="auth-spinner" />Accesso...</> : 'Accedi →'}
              </button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-text">oppure</span>
            </div>

            <button
              className="auth-btn secondary"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
              }}
            >
              Continua con Google
            </button>

            <p className="auth-link">
              Non hai un account?{' '}
              <Link href="/register">Registra il tuo locale</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
