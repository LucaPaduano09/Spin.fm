'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Payout {
  date: string
  amount: number
  requests: number
  status: 'paid' | 'pending' | 'processing'
}

interface EarningsData {
  lifetimeRevenue: number
  thisMonth:       number
  lastMonth:       number
  pending:         number
  transactions:    {
    id: string; title: string; artist: string
    amount: number; fee: number; net: number
    date: string; customer: string | null
  }[]
  monthlyPayouts:  Payout[]
}

export default function EarningsPage() {
  const [venueId, setVenueId]   = useState<string | null>(null)
  const [data,    setData]      = useState<EarningsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [tab,     setTab]       = useState<'transactions' | 'payouts'>('transactions')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: v } = await supabase.from('venues').select('id').eq('owner_id', user.id).limit(1).single()
      if (v) setVenueId(v.id)
    })
  }, [])

  useEffect(() => {
    if (!venueId) return
    loadEarnings()
  }, [venueId])

  const loadEarnings = async () => {
    if (!venueId) return
    setLoading(true)

    const { data: requests } = await supabase
      .from('song_requests')
      .select('*, track:tracks(title,artist)')
      .eq('venue_id', venueId)
      .in('status', ['accepted', 'played'])
      .order('created_at', { ascending: false })

    if (!requests) { setLoading(false); return }

    const now       = new Date()
    const thisMonthStart  = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd    = new Date(now.getFullYear(), now.getMonth(), 0)

    const net    = (a: number) => a * 0.9
    const fee    = (a: number) => a * 0.1

    const thisMonth  = requests.filter(r => new Date(r.created_at) >= thisMonthStart).reduce((s, r) => s + net(r.amount), 0)
    const lastMonth  = requests.filter(r => {
      const d = new Date(r.created_at)
      return d >= lastMonthStart && d <= lastMonthEnd
    }).reduce((s, r) => s + net(r.amount), 0)

    const lifetime   = requests.reduce((s, r) => s + net(r.amount), 0)

    const transactions = requests.slice(0, 50).map(r => ({
      id:       r.id,
      title:    r.track?.title  ?? '?',
      artist:   r.track?.artist ?? '?',
      amount:   r.amount,
      fee:      fee(r.amount),
      net:      net(r.amount),
      date:     r.created_at,
      customer: r.customer_name,
    }))

    // Mock payouts (verranno da Stripe in produzione)
    const monthlyPayouts: Payout[] = [
      { date: 'Marzo 2025',   amount: thisMonth,  requests: requests.filter(r => new Date(r.created_at) >= thisMonthStart).length, status: 'pending' },
      { date: 'Febbraio 2025',amount: lastMonth,  requests: requests.filter(r => { const d = new Date(r.created_at); return d >= lastMonthStart && d <= lastMonthEnd }).length, status: 'paid' },
    ]

    setData({ lifetimeRevenue: lifetime, thisMonth, lastMonth, pending: thisMonth, transactions, monthlyPayouts })
    setLoading(false)
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      <div className="sh">
        <div>
          <h2 className="st">GUADAGNI</h2>
          <p className="ss">I tuoi guadagni netti (90% per richiesta)</p>
        </div>
        <button className="btn btn-g" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
          Stripe Dashboard ↗
        </button>
      </div>

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}

      {!loading && data && (
        <>
          {/* KPI */}
          <div className="g4">
            <div className="dc">
              <p className="dc-title">Questo mese</p>
              <p className="dc-val a">€{data.thisMonth.toFixed(0)}</p>
              <p className="dc-sub">in attesa di payout</p>
            </div>
            <div className="dc">
              <p className="dc-title">Mese scorso</p>
              <p className="dc-val">€{data.lastMonth.toFixed(0)}</p>
              <p className="dc-sub">già pagato</p>
            </div>
            <div className="dc">
              <p className="dc-title">Lifetime</p>
              <p className="dc-val">€{data.lifetimeRevenue.toFixed(0)}</p>
              <p className="dc-sub">guadagno totale</p>
            </div>
            <div className="dc">
              <p className="dc-title">Commissione</p>
              <p className="dc-val" style={{ fontSize: 32 }}>10%</p>
              <p className="dc-sub">tieni il 90%</p>
            </div>
          </div>

          {/* Fee breakdown */}
          <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24, marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p className="dc-title">Come funziona il payout</p>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                I pagamenti vengono aggregati mensilmente e inviati tramite Stripe Connect
                al tuo IBAN. La commissione Drop.fm del 10% viene trattenuta automaticamente.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
              {[
                { label: 'Richiesta cliente', val: '€10.00', color: '#aaa' },
                { label: 'Drop.fm (10%)',     val: '−€1.00', color: 'var(--red)' },
                { label: 'Guadagno tuo',      val: '€9.00',  color: 'var(--acid)' },
              ].map(row => (
                <div key={row.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: row.color }}>{row.val}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{row.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {(['transactions', 'payouts'] as const).map(t => (
              <button key={t} className={`btn ${tab === t ? 'btn-a' : 'btn-g'}`} style={{ padding: '8px 20px' }} onClick={() => setTab(t)}>
                {t === 'transactions' ? 'Transazioni' : 'Payout'}
              </button>
            ))}
          </div>

          {/* Transactions */}
          {tab === 'transactions' && (
            <div style={{ background: 'var(--mid)', border: '1px solid var(--border)' }}>
              {data.transactions.length > 0 ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Data</th><th>Brano</th><th>Cliente</th><th>Lordo</th><th>Fee</th><th>Netto</th></tr>
                  </thead>
                  <tbody>
                    {data.transactions.map(t => (
                      <tr key={t.id}>
                        <td className="td-m">{fmtDate(t.date)}</td>
                        <td>
                          <p className="td-w">{t.title}</p>
                          <p style={{ fontSize: 12, color: '#555' }}>{t.artist}</p>
                        </td>
                        <td>{t.customer ?? '—'}</td>
                        <td className="td-m">€{t.amount.toFixed(2)}</td>
                        <td className="td-m" style={{ color: 'var(--red)' }}>−€{t.fee.toFixed(2)}</td>
                        <td className="td-a">€{t.net.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty">
                  <div className="empty-icon">💰</div>
                  <p className="empty-t">NESSUNA TRANSAZIONE</p>
                  <p className="empty-s">Le transazioni appariranno qui quando i clienti pagheranno</p>
                </div>
              )}
            </div>
          )}

          {/* Payouts */}
          {tab === 'payouts' && (
            <div style={{ background: 'var(--mid)', border: '1px solid var(--border)' }}>
              <table className="tbl">
                <thead>
                  <tr><th>Periodo</th><th>Richieste</th><th>Importo</th><th>Stato</th></tr>
                </thead>
                <tbody>
                  {data.monthlyPayouts.map(p => (
                    <tr key={p.date}>
                      <td className="td-w">{p.date}</td>
                      <td className="td-m">{p.requests}</td>
                      <td className="td-a">€{p.amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.status === 'paid' ? 'b-accepted' : p.status === 'pending' ? 'b-pending' : 'b-played'}`}>
                          {p.status === 'paid' ? 'Pagato' : p.status === 'pending' ? 'In attesa' : 'In elaborazione'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
