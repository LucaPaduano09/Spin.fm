'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { dashStyles } from '@/components/dashboard/dashStyles'

interface Stats {
  totalRequests:  number
  accepted:       number
  rejected:       number
  totalRevenue:   number
  avgOffer:       number
  topTracks:      { title: string; artist: string; count: number; revenue: number }[]
  byDay:          { day: string; count: number; revenue: number }[]
  acceptanceRate: number
}

export default function AnalyticsPage() {
  const [venueId, setVenueId] = useState<string | null>(null)
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [period,  setPeriod]  = useState<7 | 30 | 90>(30)
  const [loading, setLoading] = useState(true)
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
    loadStats()
  }, [venueId, period])

  const loadStats = async () => {
    if (!venueId) return
    setLoading(true)

    const since = new Date()
    since.setDate(since.getDate() - period)

    const { data: requests } = await supabase
      .from('song_requests')
      .select('*, track:tracks(title,artist)')
      .eq('venue_id', venueId)
      .gte('created_at', since.toISOString())

    if (!requests) { setLoading(false); return }

    const accepted   = requests.filter(r => r.status === 'accepted' || r.status === 'played')
    const rejected   = requests.filter(r => r.status === 'rejected')
    const totalRev   = accepted.reduce((s, r) => s + r.amount * 0.9, 0)
    const avgOffer   = requests.length ? requests.reduce((s, r) => s + r.amount, 0) / requests.length : 0

    // Top tracks
    const trackMap: Record<string, { title: string; artist: string; count: number; revenue: number }> = {}
    accepted.forEach(r => {
      const key = r.track?.title ?? 'Unknown'
      if (!trackMap[key]) trackMap[key] = { title: r.track?.title ?? '?', artist: r.track?.artist ?? '?', count: 0, revenue: 0 }
      trackMap[key].count++
      trackMap[key].revenue += r.amount * 0.9
    })
    const topTracks = Object.values(trackMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    // By day (last 7 days for chart)
    const dayMap: Record<string, { count: number; revenue: number }> = {}
    const days = Math.min(period, 7)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('it-IT', { weekday: 'short' })
      dayMap[key] = { count: 0, revenue: 0 }
    }
    accepted.forEach(r => {
      const d  = new Date(r.created_at)
      const key = d.toLocaleDateString('it-IT', { weekday: 'short' })
      if (dayMap[key]) { dayMap[key].count++; dayMap[key].revenue += r.amount * 0.9 }
    })
    const byDay = Object.entries(dayMap).map(([day, v]) => ({ day, ...v }))

    setStats({
      totalRequests:  requests.length,
      accepted:       accepted.length,
      rejected:       rejected.length,
      totalRevenue:   totalRev,
      avgOffer,
      topTracks,
      byDay,
      acceptanceRate: requests.length ? Math.round(accepted.length / requests.length * 100) : 0,
    })
    setLoading(false)
  }

  const maxRevDay = stats ? Math.max(...stats.byDay.map(d => d.revenue), 1) : 1

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />

      {/* Period selector */}
      <div className="sh">
        <div>
          <h2 className="st">ANALYTICS</h2>
          <p className="ss">Statistiche delle ultime serate</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {([7, 30, 90] as const).map(p => (
            <button key={p}
              className={`btn ${period === p ? 'btn-a' : 'btn-g'}`}
              style={{ padding: '8px 16px' }}
              onClick={() => setPeriod(p)}
            >
              {p}gg
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="empty"><span className="spin" style={{ width: 32, height: 32 }} /></div>}

      {!loading && stats && (
        <>
          {/* KPI cards */}
          <div className="g4">
            <div className="dc">
              <p className="dc-title">Richieste totali</p>
              <p className="dc-val">{stats.totalRequests}</p>
              <p className="dc-sub">negli ultimi {period} giorni</p>
            </div>
            <div className="dc">
              <p className="dc-title">Tasso accettazione</p>
              <p className="dc-val a">{stats.acceptanceRate}%</p>
              <p className="dc-sub">{stats.accepted} accettate</p>
            </div>
            <div className="dc">
              <p className="dc-title">Revenue totale</p>
              <p className="dc-val a">€{stats.totalRevenue.toFixed(0)}</p>
              <p className="dc-sub">quota tua (90%)</p>
            </div>
            <div className="dc">
              <p className="dc-title">Offerta media</p>
              <p className="dc-val">€{stats.avgOffer.toFixed(1)}</p>
              <p className="dc-sub">per richiesta</p>
            </div>
          </div>

          <div className="g2">
            {/* Revenue chart */}
            <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
              <p className="dc-title" style={{ marginBottom: 20 }}>Revenue ultimi 7 giorni</p>
              <div className="chart">
                {stats.byDay.map(d => (
                  <div key={d.day} className="bar-w">
                    <div
                      className="bar"
                      style={{ height: `${Math.max((d.revenue / maxRevDay) * 100, 2)}%` }}
                      title={`€${d.revenue.toFixed(1)}`}
                    />
                    <span className="bar-l">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accept/reject donut */}
            <div style={{ background: 'var(--mid)', border: '1px solid var(--border)', padding: 24 }}>
              <p className="dc-title" style={{ marginBottom: 20 }}>Distribuzione esiti</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Accettate', val: stats.accepted, color: 'var(--acid)' },
                  { label: 'Rifiutate', val: stats.rejected, color: 'var(--red)' },
                  { label: 'Pending',   val: stats.totalRequests - stats.accepted - stats.rejected, color: '#ffc800' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#666' }}>{row.label}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: row.color }}>{row.val}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${stats.totalRequests ? (row.val / stats.totalRequests * 100) : 0}%`, background: row.color, borderRadius: 2, transition: 'width .5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top tracks */}
          {stats.topTracks.length > 0 && (
            <div style={{ background: 'var(--mid)', border: '1px solid var(--border)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <p className="st" style={{ fontSize: 20 }}>TOP BRANI RICHIESTI</p>
              </div>
              <table className="tbl">
                <thead>
                  <tr><th>#</th><th>Titolo</th><th>Artista</th><th>Richieste</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {stats.topTracks.map((t, i) => (
                    <tr key={t.title}>
                      <td className="td-m" style={{ color: i === 0 ? 'var(--acid)' : '#555' }}>{String(i + 1).padStart(2, '0')}</td>
                      <td className="td-w">{t.title}</td>
                      <td>{t.artist}</td>
                      <td className="td-m">{t.count}x</td>
                      <td className="td-a">€{t.revenue.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {stats.totalRequests === 0 && (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <p className="empty-t">NESSUN DATO</p>
              <p className="empty-s">Inizia una serata per vedere le statistiche</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
