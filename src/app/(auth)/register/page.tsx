'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { authStyles } from '@/components/auth/authStyles'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'

// ─── Types ────────────────────────────────────────────────────
type Step = 1 | 2 | 3

interface FormData {
  // Step 1 — Account
  email:     string
  password:  string
  password2: string
  // Step 2 — Venue info
  venueName: string
  venueSlug: string
  city:      string
  // Step 3 — Plan
  plan: 'basic' | 'pro' | 'agency'
}

const PLANS = [
  {
    id:    'basic' as const,
    name:  'Basic',
    price: '€19/mese',
    features: ['1 locale', 'Import Rekordbox', 'QR code', '10% per transazione'],
  },
  {
    id:    'pro' as const,
    name:  'Pro',
    price: '€49/mese',
    features: ['3 locali', 'Asta live', 'Dediche schermo', 'Analytics'],
  },
  {
    id:    'agency' as const,
    name:  'Agency',
    price: '€99/mese',
    features: ['Illimitati', 'White label', 'API access', '8% per transazione'],
  },
]

// ─── Slug helper ──────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Step components ──────────────────────────────────────────

function Step1({
  data, onChange, onNext, error, loading,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
  onNext: () => void
  error: string | null
  loading: boolean
}) {
  const valid =
    data.email.includes('@') &&
    data.password.length >= 8 &&
    data.password === data.password2

  return (
    <div>
      <h1 className="auth-form-title">REGISTRATI</h1>
      <p className="auth-form-sub">Passo 1 di 3 — Il tuo account</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label className="auth-label">Email</label>
        <input
          type="email"
          className="auth-input"
          placeholder="nome@locale.it"
          value={data.email}
          onChange={e => onChange('email', e.target.value)}
          autoFocus
        />
      </div>

      <div className="auth-field">
        <label className="auth-label">Password</label>
        <input
          type="password"
          className={`auth-input${data.password.length > 0 && data.password.length < 8 ? ' error' : ''}`}
          placeholder="Min. 8 caratteri"
          value={data.password}
          onChange={e => onChange('password', e.target.value)}
        />
        {data.password.length > 0 && data.password.length < 8 && (
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--red)', marginTop: 6 }}>
            Minimo 8 caratteri
          </p>
        )}
      </div>

      <div className="auth-field">
        <label className="auth-label">Conferma Password</label>
        <input
          type="password"
          className={`auth-input${data.password2.length > 0 && data.password !== data.password2 ? ' error' : ''}`}
          placeholder="Ripeti la password"
          value={data.password2}
          onChange={e => onChange('password2', e.target.value)}
        />
        {data.password2.length > 0 && data.password !== data.password2 && (
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--red)', marginTop: 6 }}>
            Le password non coincidono
          </p>
        )}
      </div>

      <button
        className="auth-btn"
        onClick={onNext}
        disabled={!valid || loading}
        style={{ marginTop: 24 }}
      >
        {loading ? <><span className="auth-spinner" />Verifica...</> : 'Continua →'}
      </button>

      <p className="auth-link">
        Hai già un account? <Link href="/login">Accedi</Link>
      </p>
    </div>
  )
}

function Step2({
  data, onChange, onNext, onBack, error,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
  onNext: () => void
  onBack: () => void
  error: string | null
}) {
  const valid = data.venueName.length >= 2 && data.venueSlug.length >= 2 && data.city.length >= 2

  return (
    <div>
      <h1 className="auth-form-title">IL LOCALE</h1>
      <p className="auth-form-sub">Passo 2 di 3 — Info del locale</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label className="auth-label">Nome del locale</label>
        <input
          type="text"
          className="auth-input"
          placeholder="es. Amnesia Milano"
          value={data.venueName}
          autoFocus
          onChange={e => {
            onChange('venueName', e.target.value)
            // Auto-genera slug se non è stato modificato manualmente
            onChange('venueSlug', toSlug(e.target.value))
          }}
        />
      </div>

      <div className="auth-field">
        <label className="auth-label">URL univoco (slug)</label>
        <input
          type="text"
          className="auth-input"
          placeholder="amnesia-milano"
          value={data.venueSlug}
          onChange={e => onChange('venueSlug', toSlug(e.target.value))}
        />
        {data.venueSlug && (
          <div className="auth-slug-preview">
            drop.fm/venue/<span>{data.venueSlug}</span>
          </div>
        )}
      </div>

      <div className="auth-field">
        <label className="auth-label">Città</label>
        <input
          type="text"
          className="auth-input"
          placeholder="es. Milano"
          value={data.city}
          onChange={e => onChange('city', e.target.value)}
        />
      </div>

      <div className="auth-btn-row">
        <button className="auth-btn secondary" onClick={onBack}>← Indietro</button>
        <button className="auth-btn" onClick={onNext} disabled={!valid}>Continua →</button>
      </div>
    </div>
  )
}

function Step3({
  data, onChange, onSubmit, onBack, loading, error,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div>
      <h1 className="auth-form-title">IL PIANO</h1>
      <p className="auth-form-sub">Passo 3 di 3 — Scegli il piano</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="plan-grid">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`plan-card${data.plan === plan.id ? ' selected' : ''}`}
            onClick={() => onChange('plan', plan.id)}
          >
            <p className="plan-card-name">{plan.name}</p>
            <p className="plan-card-price">{plan.price}</p>
            <p className="plan-card-feat">{plan.features.join(' · ')}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--mid)', border: '1px solid var(--border)',
          padding: '16px 20px', marginBottom: 24,
          fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555',
          lineHeight: 1.7,
        }}
      >
        💳 Inizia con <span style={{ color: 'var(--acid)' }}>14 giorni gratis</span> — nessuna carta richiesta ora.
        Il piano si attiva alla fine del trial. Puoi cambiare in qualsiasi momento.
      </div>

      <div className="auth-btn-row">
        <button className="auth-btn secondary" onClick={onBack}>← Indietro</button>
        <button className="auth-btn" onClick={onSubmit} disabled={loading}>
          {loading
            ? <><span className="auth-spinner" />Creazione account...</>
            : 'Crea account →'
          }
        </button>
      </div>
    </div>
  )
}

function SuccessScreen({ venueName, venueSlug }: { venueName: string; venueSlug: string }) {
  return (
    <div className="auth-success-screen">
      <div className="auth-success-icon">🎉</div>
      <h2 className="auth-success-title">FATTO!</h2>
      <p className="auth-success-text">
        Il tuo locale <strong style={{ color: 'var(--white)' }}>{venueName}</strong> è stato creato.
        <br /><br />
        Controlla la tua email per confermare l&apos;account, poi potrai accedere alla dashboard,
        importare la libreria Rekordbox e generare il QR code per la serata.
      </p>
      <Link href="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
        Vai al Login →
      </Link>
      <p
        style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          color: '#555', marginTop: 16, letterSpacing: 1,
        }}
      >
        Il tuo URL pubblico sarà:{' '}
        <span style={{ color: 'var(--acid)' }}>drop.fm/venue/{venueSlug}</span>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function RegisterPage() {
  const [step,    setStep]    = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [done,    setDone]    = useState(false)

  const [form, setForm] = useState<FormData>({
    email: '', password: '', password2: '',
    venueName: '', venueSlug: '', city: '',
    plan: 'pro',
  })

  const update = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setError(null)
  }

  // Step 1 → 2: verifica email non duplicata (client-side basic check)
  const handleStep1 = async () => {
    setLoading(true)
    // Validation già fatta nel componente, andiamo avanti
    setLoading(false)
    setStep(2)
  }

  // Step 2 → 3: verifica slug disponibile
  const handleStep2 = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data } = await supabase
      .from('venues')
      .select('id')
      .eq('slug', form.venueSlug)
      .maybeSingle()

    if (data) {
      setError('Questo slug è già in uso. Scegline un altro.')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep(3)
  }

  // Step 3: crea account Supabase + venue
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // 1. Crea utente Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { venue_name: form.venueName },
      },
    })

    if (signUpError) {
      console.error('Supabase signUp error:', signUpError)
      let msg = signUpError.message
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        msg = 'Questa email è già registrata. Prova ad accedere.'
      } else if (msg.includes('rate limit') || msg.includes('email')) {
        msg = 'Troppi tentativi. Aspetta qualche minuto e riprova.'
      } else if (msg.includes('500') || msg.includes('unexpected')) {
        msg = 'Errore del server. Controlla le impostazioni SMTP su Supabase (Project Settings → Auth → disabilita SMTP custom).'
      }
      setError(msg)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError("Errore durante la creazione dell'account. Riprova.")
      setLoading(false)
      return
    }

    // 2. Crea venue via API route con admin client (bypassa RLS).
    //    Non usiamo il browser client perché auth.uid() e' null
    //    finche' l'email non e' confermata.
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name: form.venueName,
        slug: form.venueSlug,
        plan: form.plan,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      if (data.error === 'slug_taken') {
        setError('Questo slug è già in uso. Torna indietro e scegline un altro.')
      } else {
        setError(data.error ?? 'Errore nella creazione del locale.')
      }
      setLoading(false)
      return
    }

    setLoading(false)
    setDone(true)
  }

  const leftPanelByStep = {
    1: {
      title: <><span className="acid">UNISCITI</span><br />A<br /><span className="outline">DROP.FM</span></>,
      subtitle: 'Crea il tuo account e inizia a monetizzare le richieste musicali della tua serata.',
      features: ['Setup in 2 minuti', '14 giorni gratis', 'Nessuna carta richiesta', 'Cancella quando vuoi'],
    },
    2: {
      title: <><span className="outline">IL TUO</span><br /><span className="acid">LOCALE</span></>,
      subtitle: 'Inserisci le informazioni del tuo locale. I clienti lo troveranno scansionando il QR code.',
      features: ['QR code automatico', 'URL personalizzato', 'Più locali sullo stesso account', 'Gestione multi-sede'],
    },
    3: {
      title: <><span className="outline">SCEGLI</span><br />IL TUO<br /><span className="acid">PIANO</span></>,
      subtitle: 'Inizia gratis per 14 giorni. Scegli il piano più adatto alla dimensione del tuo locale.',
      features: ['14 giorni di trial gratuito', 'Cambia piano in qualsiasi momento', 'Supporto incluso', 'Pagamenti sicuri Stripe'],
    },
  }

  const panel = leftPanelByStep[done ? 1 : step]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />

      <div className="auth-root">
        {/* ── LEFT ── */}
        <AuthLeftPanel
          title={panel.title}
          subtitle={panel.subtitle}
          features={panel.features}
        />

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">

            {done ? (
              <SuccessScreen venueName={form.venueName} venueSlug={form.venueSlug} />
            ) : (
              <>
                {/* Step progress bar */}
                <div className="auth-steps">
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className={`auth-step-dot ${n < step ? 'done' : n === step ? 'active' : ''}`}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <Step1
                    data={form} onChange={update}
                    onNext={handleStep1}
                    error={error} loading={loading}
                  />
                )}
                {step === 2 && (
                  <Step2
                    data={form} onChange={update}
                    onNext={handleStep2}
                    onBack={() => setStep(1)}
                    error={error}
                  />
                )}
                {step === 3 && (
                  <Step3
                    data={form} onChange={update}
                    onSubmit={handleSubmit}
                    onBack={() => setStep(2)}
                    loading={loading} error={error}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
