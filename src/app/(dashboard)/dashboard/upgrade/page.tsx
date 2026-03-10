'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

const PLANS = [
  {
    id:    'basic',
    name:  'Basic',
    price: 19,
    period: 'mese',
    fee:   '10%',
    color: '#aaa',
    features: [
      '1 locale',
      'Import Rekordbox XML',
      'QR code illimitati',
      'Dashboard live',
      'Supporto email',
    ],
    limits: ['No asta live', 'No analytics avanzate', 'No white label'],
  },
  {
    id:    'pro',
    name:  'Pro',
    price: 49,
    period: 'mese',
    fee:   '10%',
    color: 'var(--acid)',
    popular: true,
    features: [
      '3 locali',
      'Import Rekordbox XML',
      'Asta live in tempo reale',
      'Analytics avanzate',
      'Dediche su maxischermo',
      'Prezzi dinamici',
      'Supporto prioritario',
    ],
    limits: ['No white label', 'No API access'],
  },
  {
    id:    'agency',
    name:  'Agency',
    price: 99,
    period: 'mese',
    fee:   '8%',
    color: '#ff6b6b',
    features: [
      'Locali illimitati',
      'Tutto il piano Pro',
      'White label completo',
      'API access',
      'Onboarding dedicato',
      'Commissione ridotta (8%)',
      'SLA garantito',
    ],
    limits: [],
  },
]

export default function UpgradePage() {
  const [currentPlan, setCurrentPlan] = useState<string>('basic')
  const [venueId,     setVenueId]     = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [upgrading,   setUpgrading]   = useState<string | null>(null)
  const [annual,      setAnnual]      = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('venues').select('id,plan').eq('owner_id', user.id).limit(1).single()
      if (data) { setCurrentPlan(data.plan); setVenueId(data.id) }
      setLoading(false)
    })
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return
    setUpgrading(planId)

    // In produzione qui si apre Stripe Billing / Checkout
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, venueId }),
    })

    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      // Fallback: aggiorna direttamente il piano (dev mode)
      if (venueId) {
        await supabase.from('venues').update({ plan: planId }).eq('id', venueId)
        setCurrentPlan(planId)
        router.refresh()
      }
    }
    setUpgrading(null)
  }

  const price = (p: typeof PLANS[0]) => {
    const base = annual ? Math.round(p.price * 0.8) : p.price
    return base
  }

  const planOrder = ['basic', 'pro', 'agency']
  const isUpgrade   = (id: string) => planOrder.indexOf(id) > planOrder.indexOf(currentPlan)
  const isDowngrade = (id: string) => planOrder.indexOf(id) < planOrder.indexOf(currentPlan)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />
      <style>{`
        .plan-card { background: var(--mid); border: 1px solid var(--border); padding: 32px; position: relative; transition: border-color .2s, transform .2s; }
        .plan-card:hover { transform: translateY(-2px); }
        .plan-card.current { border-color: #555; }
        .plan-card.popular { border-color: var(--acid); }
        .plan-feat { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #aaa; margin-bottom: 10px; }
        .plan-feat .check { color: var(--acid); font-size: 11px; flex-shrink: 0; }
        .plan-feat.no { color: #444; }
        .plan-feat.no .check { color: #333; }
        .popular-badge { position: absolute; top: -1px; right: 24px; background: var(--acid); color: var(--black); font-family: 'Space Mono',monospace; font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; }
      `}</style>

      <div className="sh">
        <div>
          <h2 className="st">PIANI & PREZZI</h2>
          <p className="ss">Piano attuale: <span style={{ color: 'var(--acid)' }}>{currentPlan}</span></p>
        </div>

        {/* Annual toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: annual ? '#555' : 'var(--white)' }}>Mensile</span>
          <label className="tog">
            <input type="checkbox" checked={annual} onChange={e => setAnnual(e.target.checked)} />
            <span className="tog-sl" />
          </label>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: annual ? 'var(--acid)' : '#555' }}>
            Annuale <span style={{ color: 'var(--acid)' }}>−20%</span>
          </span>
        </div>
      </div>

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}

      {!loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginBottom: 32 }}>
            {PLANS.map(plan => {
              const isCurrent = plan.id === currentPlan
              return (
                <div key={plan.id} className={`plan-card ${isCurrent ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <span className="popular-badge">Più popolare</span>}

                  {isCurrent && (
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 12, display: 'block' }}>
                      Piano attuale
                    </span>
                  )}

                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 2, color: plan.color, marginBottom: 4 }}>{plan.name}</p>

                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: 'var(--white)' }}>€{price(plan)}</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#555' }}>/{plan.period}</span>
                    {annual && (
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', marginLeft: 8, textDecoration: 'line-through' }}>€{plan.price}</span>
                    )}
                  </div>

                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: plan.color, marginBottom: 24 }}>
                    + {plan.fee} per transazione
                  </p>

                  {/* Features */}
                  <div style={{ marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} className="plan-feat">
                        <span className="check">✓</span> {f}
                      </div>
                    ))}
                    {plan.limits.map(f => (
                      <div key={f} className="plan-feat no">
                        <span className="check">✗</span> {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center', cursor: 'default' }} disabled>
                      Piano attuale
                    </button>
                  ) : isUpgrade(plan.id) ? (
                    <button
                      className="btn btn-a"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={upgrading === plan.id}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {upgrading === plan.id
                        ? <><span className="spin" /> Elaborazione...</>
                        : `Passa a ${plan.name} →`}
                    </button>
                  ) : isDowngrade(plan.id) ? (
                    <button
                      className="btn btn-r"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={upgrading === plan.id}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {upgrading === plan.id ? <><span className="spin" /> Elaborazione...</> : `Passa a ${plan.name}`}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* FAQ */}
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 32 }}>
            <p className="dc-title" style={{ marginBottom: 24 }}>Domande frequenti</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { q: 'Posso cambiare piano in qualsiasi momento?', a: 'Sì, l\'upgrade è immediato. Il downgrade avviene alla fine del ciclo di fatturazione corrente.' },
                { q: 'Come funziona il trial?', a: 'Hai 14 giorni gratis su qualsiasi piano. Non ti verrà addebitato nulla fino alla fine del trial.' },
                { q: 'Cosa succede ai miei locali se faccio downgrade?', a: 'I locali in eccesso vengono disattivati (non eliminati). Puoi riattivarli upgradando nuovamente.' },
                { q: 'La commissione del 10% è sul lordo?', a: 'Sì, sul lordo. Se il cliente paga €10, tu ricevi €9. Stripe Fees sono già incluse nella nostra commissione.' },
              ].map(faq => (
                <div key={faq.q}>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--white)', letterSpacing: 1, marginBottom: 8 }}>{faq.q}</p>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
