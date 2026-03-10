'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'


const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --acid: #d4f000; --black: #080808; --white: #f5f0e8;
    --mid: #1a1a1a; --border: #2a2a2a; --red: #ff2d2d;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--black) !important; color: var(--white) !important; font-family: 'DM Sans', sans-serif !important; }

  .dash-root { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  /* SIDEBAR */
  .dash-sidebar {
    background: var(--mid); border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .dash-sidebar-top { padding: 28px 24px; border-bottom: 1px solid var(--border); }
  .dash-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
  .dash-logo span { color: var(--acid); }

  .dash-venue-selector {
    margin-top: 16px; padding: 10px 12px;
    background: var(--black); border: 1px solid var(--border);
    cursor: pointer; transition: border-color 0.2s;
  }
  .dash-venue-selector:hover { border-color: var(--acid); }
  .dash-venue-name { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: var(--white); }
  .dash-venue-plan { font-family: 'Space Mono', monospace; font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: var(--acid); margin-top: 2px; }

  /* NAV ITEMS */
  .dash-nav { flex: 1; padding: 16px 12px; }
  .dash-nav-section { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: #444; padding: 16px 12px 8px; }
  .dash-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 4px; text-decoration: none;
    font-size: 14px; color: #666; transition: color 0.15s, background 0.15s;
    margin-bottom: 2px; cursor: pointer; border: none; background: transparent; width: 100%; text-align: left;
  }
  .dash-nav-item:hover { color: var(--white); background: rgba(255,255,255,0.04); }
  .dash-nav-item.active { color: var(--acid); background: rgba(212,240,0,0.07); }
  .dash-nav-icon { width: 16px; text-align: center; font-size: 14px; }
  .dash-nav-badge {
    margin-left: auto; background: var(--acid); color: var(--black);
    font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
    padding: 2px 6px; border-radius: 2px;
  }

  /* SIDEBAR BOTTOM */
  .dash-sidebar-bottom { padding: 16px 12px; border-top: 1px solid var(--border); }
  .dash-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
  .dash-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--acid); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: var(--black); flex-shrink: 0; }
  .dash-user-email { font-family: 'Space Mono', monospace; font-size: 9px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dash-logout { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #555; font-size: 13px; cursor: pointer; transition: color 0.2s; border: none; background: transparent; width: 100%; border-radius: 4px; }
  .dash-logout:hover { color: var(--red); }

  /* MAIN */
  .dash-main { display: flex; flex-direction: column; min-height: 100vh; }
  .dash-topbar {
    border-bottom: 1px solid var(--border); padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--black); position: sticky; top: 0; z-index: 10;
  }
  .dash-topbar-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; }
  .dash-live { display: flex; align-items: center; gap: 8px; font-family: 'Space Mono', monospace; font-size: 10px; color: var(--acid); letter-spacing: 2px; }
  @keyframes d-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .dash-live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--acid); animation: d-pulse 1.5s ease-in-out infinite; }

  .dash-content { flex: 1; padding: 32px; }

  @media (max-width: 768px) {
    .dash-root { grid-template-columns: 1fr; }
    .dash-sidebar { display: none; }
  }
`

// Tipo plain — non usare User di Supabase (non serializzabile Server → Client)
interface SerializedUser { id: string; email: string }
interface Venue { id: string; name: string; slug: string; plan: string; stripe_account_id: string | null }

interface DashboardShellProps {
  user:     SerializedUser
  venues:   Venue[]
  children: React.ReactNode
}

const NAV = [
  { href: '/dashboard',           icon: '⚡', label: 'Live Requests' },
  { href: '/dashboard/library',   icon: '🎵', label: 'Libreria DJ'   },
  { href: '/dashboard/qrcode',    icon: '📱', label: 'QR Code'       },
  { href: '/dashboard/analytics', icon: '📊', label: 'Analytics'     },
  { href: '/dashboard/earnings',  icon: '💰', label: 'Guadagni'      },
  { href: '/dashboard/settings',  icon: '⚙️', label: 'Impostazioni'  },
]

const NAV_ACCOUNT = [
  { href: '/dashboard/venues',  icon: '🏛️', label: 'I miei locali' },
  { href: '/dashboard/stripe',  icon: '💳', label: 'Stripe Connect' },
  { href: '/dashboard/upgrade', icon: '🚀', label: 'Upgrade piano'  },
]

export function DashboardShell({ user, venues, children }: DashboardShellProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [activeVenueIdx, setActiveVenueIdx] = useState(0)
  const activeVenue = venues[activeVenueIdx]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.[0].toUpperCase() ?? 'D'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashStyles }} />
      <div className="dash-root">

        {/* ── SIDEBAR ── */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-top">
            <a href="/" className="dash-logo">DROP<span>.</span>FM</a>

            {/* Venue selector */}
            {activeVenue ? (
              <div className="dash-venue-selector">
                <p className="dash-venue-name">{activeVenue.name}</p>
                <p className="dash-venue-plan">{activeVenue.plan} plan</p>
              </div>
            ) : (
              <Link
                href="/dashboard/venues/new"
                style={{ display: 'block', marginTop: 16, padding: '10px 12px', background: 'rgba(212,240,0,0.08)', border: '1px dashed rgba(212,240,0,0.3)', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--acid)', letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}
              >
                + Aggiungi locale
              </Link>
            )}
          </div>

          <nav className="dash-nav">
            <p className="dash-nav-section">Gestione</p>
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-item${pathname === item.href ? ' active' : ''}`}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                {item.label}
                {/* TODO: badge con count richieste pending */}
              </Link>
            ))}

            <p className="dash-nav-section" style={{ marginTop: 16 }}>Account</p>
            {NAV_ACCOUNT.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-item${pathname === item.href ? ' active' : ''}`}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                {item.label}
                {item.href === '/dashboard/stripe' && !activeVenue?.stripe_account_id && (
                  <span className="dash-nav-badge">!</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="dash-sidebar-bottom">
            <div className="dash-user">
              <div className="dash-avatar">{initials}</div>
              <p className="dash-user-email">{user.email}</p>
            </div>
            <button className="dash-logout" onClick={handleLogout}>
              <span>↩</span> Logout
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="dash-main">
          <header className="dash-topbar">
            <h1 className="dash-topbar-title">
              {[...NAV, ...NAV_ACCOUNT,
              { href: '/dashboard/venues/new', label: 'Nuovo locale' },
            ].find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label ?? 'Dashboard'}
            </h1>
            <div className="dash-live">
              <div className="dash-live-dot" />
              SERATA LIVE
            </div>
          </header>
          <main className="dash-content">
            {children}
          </main>
        </div>

      </div>
    </>
  )
}
