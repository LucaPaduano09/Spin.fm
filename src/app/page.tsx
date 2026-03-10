'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ─── Tutti gli stili inline — zero dipendenze da Tailwind custom tokens ───────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --acid:   #d4f000;
    --black:  #080808;
    --white:  #f5f0e8;
    --mid:    #1a1a1a;
    --border: #2a2a2a;
    --red:    #ff2d2d;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--black) !important;
    color: var(--white) !important;
    font-family: 'DM Sans', sans-serif !important;
    cursor: none !important;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--black); }
  ::-webkit-scrollbar-thumb { background: var(--acid); border-radius: 2px; }

  /* CURSOR */
  .d-cursor-dot {
    width: 12px; height: 12px; background: var(--acid);
    border-radius: 50%; position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9999; mix-blend-mode: exclusion;
  }
  .d-cursor-ring {
    width: 36px; height: 36px; border: 1px solid var(--acid);
    border-radius: 50%; position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9998; mix-blend-mode: exclusion;
    transform: translate(-12px,-12px);
  }
  /* NOISE */
  .d-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 1000; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* NAV */
  .d-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
    transition: background 0.3s, border-color 0.3s;
    border-bottom: 1px solid transparent;
  }
  .d-nav.scrolled { background: rgba(8,8,8,0.95); border-color: var(--border); backdrop-filter: blur(12px); }
  .d-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
  .d-logo span { color: var(--acid); }
  .d-nav-links { display: flex; gap: 40px; list-style: none; }
  .d-nav-links a { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; text-decoration: none; transition: color 0.2s; }
  .d-nav-links a:hover { color: var(--acid); }
  .d-nav-cta { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: var(--acid); color: var(--black); padding: 10px 24px; font-weight: 700; text-decoration: none; transition: background 0.2s; }
  .d-nav-cta:hover { background: #fff; }

  /* HERO */
  .d-hero { min-height: 100vh; position: relative; overflow: hidden; display: flex; align-items: center; }
  .d-hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .d-hero-left { display: flex; flex-direction: column; justify-content: center; padding: 140px 0 80px; position: relative; z-index: 2; }
  .d-section-tag { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--acid); margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
  .d-section-tag::before { content: ''; width: 32px; height: 1px; background: var(--acid); display: block; }
  .d-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 10vw, 140px); line-height: 0.9; letter-spacing: 2px; margin-bottom: 32px; }
  .d-outline { -webkit-text-stroke: 1px rgba(245,240,232,0.3); color: transparent !important; }
  .d-acid { color: var(--acid); }
  .d-hero-sub { font-size: 18px; line-height: 1.6; color: #999; max-width: 420px; margin-bottom: 48px; font-weight: 300; }
  .d-hero-sub strong { color: var(--white); font-weight: 500; }
  .d-hero-actions { display: flex; align-items: center; gap: 24px; }
  .d-btn-primary { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; background: var(--acid); color: var(--black); padding: 18px 40px; font-weight: 700; text-decoration: none; display: inline-block; position: relative; overflow: hidden; }
  .d-btn-primary::after { content: ''; position: absolute; inset: 0; background: white; transform: translateX(-101%); transition: transform 0.3s ease; }
  .d-btn-primary:hover::after { transform: translateX(0); }
  .d-btn-primary span { position: relative; z-index: 1; color: var(--black); }
  .d-btn-ghost { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #666; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: color 0.2s; }
  .d-btn-ghost::after { content: '→'; transition: transform 0.2s; }
  .d-btn-ghost:hover { color: var(--white); }
  .d-btn-ghost:hover::after { transform: translateX(4px); }
  .d-hero-stats { display: flex; gap: 40px; margin-top: 64px; padding-top: 40px; border-top: 1px solid var(--border); }
  .d-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: var(--acid); line-height: 1; }
  .d-stat-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #555; margin-top: 4px; white-space: pre-line; }

  /* PHONE */
  .d-hero-right { display: flex; align-items: center; justify-content: center; position: relative; padding: 100px 48px; }
  .d-glow-1 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(212,240,0,0.06); filter: blur(80px); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .d-glow-2 { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,45,45,0.08); filter: blur(80px); bottom: 10%; right: 10%; pointer-events: none; }
  @keyframes d-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-20px) rotate(-2deg)} }
  .d-phone-wrap { animation: d-float 4s ease-in-out infinite; }
  .d-phone { width: 280px; background: #111; border-radius: 40px; border: 1px solid #333; padding: 32px 20px; box-shadow: 0 60px 120px rgba(0,0,0,0.8), 0 0 80px rgba(212,240,0,0.05); position: relative; overflow: hidden; }
  .d-phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 28px; background: #000; border-radius: 0 0 20px 20px; }
  .d-phone-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-top: 8px; }
  .d-phone-venue { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #555; text-transform: uppercase; }
  .d-phone-live { display: flex; align-items: center; gap: 5px; font-family: 'Space Mono', monospace; font-size: 8px; color: var(--acid); }
  @keyframes d-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
  .d-live-dot { width: 6px; height: 6px; background: var(--acid); border-radius: 50%; animation: d-pulse 1.5s ease-in-out infinite; display: inline-block; }
  .d-now-playing { background: var(--mid); border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--border); }
  .d-now-label { font-family: 'Space Mono', monospace; font-size: 7px; letter-spacing: 2px; color: #444; text-transform: uppercase; margin-bottom: 8px; }
  .d-now-track { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: var(--white); line-height: 1.1; }
  .d-now-artist { font-size: 11px; color: #666; margin-top: 2px; }
  .d-progress { height: 2px; background: var(--border); border-radius: 2px; margin-top: 12px; overflow: hidden; }
  @keyframes d-prog { from{width:20%} to{width:90%} }
  .d-progress-fill { height: 100%; background: var(--acid); border-radius: 2px; animation: d-prog 8s linear infinite; }
  .d-queue-label { font-family: 'Space Mono', monospace; font-size: 7px; letter-spacing: 2px; color: #444; text-transform: uppercase; margin-bottom: 8px; }
  .d-queue-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; margin-bottom: 6px; background: var(--mid); border: 1px solid var(--border); }
  .d-queue-item.accent { border-color: rgba(212,240,0,0.3); }
  .d-queue-num { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #333; min-width: 20px; }
  .d-queue-info { flex: 1; }
  .d-queue-track { font-size: 11px; font-weight: 500; color: var(--white); }
  .d-queue-artist { font-size: 9px; color: #555; }
  .d-queue-price { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--acid); font-weight: 700; }
  .d-req-btn { width: 100%; background: var(--acid); color: var(--black); border: none; border-radius: 12px; padding: 14px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-top: 12px; cursor: pointer; }

  /* SECTIONS */
  .d-section { padding: 120px 48px; max-width: 1200px; margin: 0 auto; }
  .d-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 6vw, 80px); line-height: 0.95; margin-bottom: 64px; }

  /* STEPS */
  .d-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
  .d-step { padding: 48px 40px; background: var(--mid); border: 1px solid var(--border); position: relative; overflow: hidden; transition: border-color 0.3s; }
  .d-step:hover { border-color: var(--acid); }
  .d-step::before { content: attr(data-n); font-family: 'Bebas Neue', sans-serif; font-size: 120px; color: rgba(255,255,255,0.03); position: absolute; top: -10px; right: 16px; line-height: 1; pointer-events: none; }
  .d-step-icon { font-size: 32px; margin-bottom: 24px; }
  .d-step-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 1px; margin-bottom: 12px; color: var(--white); }
  .d-step-desc { font-size: 14px; line-height: 1.7; color: #666; }
  .d-step-desc strong { color: var(--acid); }

  /* REVENUE */
  .d-revenue { background: var(--mid); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 120px 48px; }
  .d-revenue-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .d-revenue-text { font-size: 15px; line-height: 1.8; color: #666; max-width: 400px; }
  .d-revenue-text strong { color: var(--white); }
  .d-calc { background: var(--black); border: 1px solid var(--border); padding: 40px; }
  .d-calc-title { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-bottom: 32px; }
  .d-calc-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); }
  .d-calc-row:last-child { border-bottom: none; }
  .d-calc-key { font-family: 'Space Mono', monospace; font-size: 11px; color: #555; }
  .d-calc-val { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: var(--white); }
  .d-calc-val.accent { color: var(--acid); font-size: 36px; }
  .d-calc-divider { height: 1px; background: rgba(212,240,0,0.3); margin: 4px 0; }

  /* STACK */
  .d-stack { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; margin-top: 48px; }
  .d-stack-item { padding: 32px 24px; background: var(--mid); border: 1px solid var(--border); text-align: center; transition: border-color 0.3s, background 0.3s; }
  .d-stack-item:hover { border-color: var(--acid); background: rgba(212,240,0,0.03); }
  .d-stack-icon { font-size: 28px; margin-bottom: 12px; }
  .d-stack-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; color: var(--white); }
  .d-stack-role { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #444; margin-top: 4px; text-transform: uppercase; }

  /* PRICING */
  .d-pricing { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 48px; }
  .d-plan { padding: 48px 36px; background: var(--mid); border: 1px solid var(--border); transition: border-color 0.3s; }
  .d-plan:not(.featured):hover { border-color: var(--acid); }
  .d-plan.featured { background: var(--acid); border-color: var(--acid); }
  .d-plan-badge { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; background: var(--black); color: var(--acid); padding: 4px 10px; display: inline-block; margin-bottom: 24px; }
  .d-plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 2px; margin-bottom: 8px; color: var(--white); }
  .d-plan.featured .d-plan-name { color: var(--black); }
  .d-plan-price { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; color: var(--acid); margin-bottom: 4px; }
  .d-plan.featured .d-plan-price { color: var(--black); }
  .d-plan-period { font-family: 'Space Mono', monospace; font-size: 10px; color: #888; margin-bottom: 32px; }
  .d-plan.featured .d-plan-period { color: rgba(0,0,0,0.5); }
  .d-plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .d-plan-features li { font-size: 13px; color: #777; display: flex; align-items: center; gap: 10px; }
  .d-plan.featured .d-plan-features li { color: rgba(0,0,0,0.7); }
  .d-plan-features li::before { content: '✓'; color: var(--acid); font-weight: 700; font-size: 11px; }
  .d-plan.featured .d-plan-features li::before { color: var(--black); }
  .d-plan-btn { display: block; text-align: center; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; padding: 16px; margin-top: 40px; text-decoration: none; transition: background 0.2s; }
  .d-plan-btn-dark { background: var(--acid); color: var(--black) !important; }
  .d-plan-btn-dark:hover { background: white; }
  .d-plan-btn-light { background: var(--black); color: var(--acid) !important; }
  .d-plan-btn-light:hover { background: #111; }

  /* CTA */
  .d-cta { padding: 160px 48px; text-align: center; position: relative; overflow: hidden; }
  .d-cta::before { content: 'DROP'; font-family: 'Bebas Neue', sans-serif; font-size: 300px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: rgba(255,255,255,0.02); pointer-events: none; white-space: nowrap; }
  .d-cta-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px,8vw,100px); line-height: 0.95; margin-bottom: 24px; position: relative; color: var(--white); }
  .d-cta-sub { font-size: 16px; color: #666; margin-bottom: 48px; font-weight: 300; position: relative; }

  /* FOOTER */
  .d-footer { border-top: 1px solid var(--border); padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; }
  .d-footer-copy { font-family: 'Space Mono', monospace; font-size: 10px; color: #333; letter-spacing: 1px; }

  /* FADE */
  .d-fade { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .d-fade.visible { opacity: 1 !important; transform: translateY(0) !important; }

  @media (max-width: 768px) {
    .d-hero-inner { grid-template-columns: 1fr; padding: 0 24px; }
    .d-hero-right { display: none !important; }
    .d-nav-links { display: none !important; }
    .d-nav { padding: 20px 24px; }
    .d-hero-left { padding: 120px 24px 60px; }
    .d-section { padding: 80px 24px; }
    .d-steps, .d-stack, .d-pricing { grid-template-columns: 1fr; }
    .d-revenue-inner { grid-template-columns: 1fr; }
    .d-revenue { padding: 80px 24px; }
    .d-cta { padding: 100px 24px; }
    .d-footer { padding: 32px 24px; flex-direction: column; gap: 16px; text-align: center; }
  }
`

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx - 6}px, ${my - 6}px)`
    }
    document.addEventListener('mousemove', onMove)
    const tick = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`
      requestAnimationFrame(tick)
    }
    tick()
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div ref={dotRef}  className="d-cursor-dot" />
      <div ref={ringRef} className="d-cursor-ring" />
    </>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`d-nav${scrolled ? ' scrolled' : ''}`}>
      <a href="/" className="d-logo">DROP<span>.</span>FM</a>
      <ul className="d-nav-links">
        <li><a href="#how">Come funziona</a></li>
        <li><a href="#revenue">Revenue</a></li>
        <li><a href="#stack">Tech Stack</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <Link href="/login" className="d-nav-cta">Inizia ora</Link>
    </nav>
  )
}

// ─── Phone Mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  const queue = [
    { n: '1', title: "God's Plan",     artist: 'Drake',      price: '€8', accent: true },
    { n: '2', title: 'Blinding Lights', artist: 'The Weeknd', price: '€5', accent: false },
    { n: '3', title: 'Levitating',      artist: 'Dua Lipa',   price: '€6', accent: false },
  ]
  return (
    <div className="d-phone-wrap">
      <div className="d-phone">
        <div className="d-phone-notch" />
        <div className="d-phone-header">
          <span className="d-phone-venue">Amnesia Milano</span>
          <span className="d-phone-live">
            <span className="d-live-dot" /> LIVE
          </span>
        </div>
        <div className="d-now-playing">
          <p className="d-now-label">▶ In onda ora</p>
          <p className="d-now-track">HUMBLE.</p>
          <p className="d-now-artist">Kendrick Lamar</p>
          <div className="d-progress"><div className="d-progress-fill" /></div>
        </div>
        <p className="d-queue-label">Coda richieste</p>
        {queue.map(q => (
          <div key={q.n} className={`d-queue-item${q.accent ? ' accent' : ''}`}>
            <span className="d-queue-num">{q.n}</span>
            <div className="d-queue-info">
              <p className="d-queue-track">{q.title}</p>
              <p className="d-queue-artist">{q.artist}</p>
            </div>
            <span className="d-queue-price">{q.price}</span>
          </div>
        ))}
        <button className="d-req-btn">+ Fai una richiesta</button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => {
    const els = document.querySelectorAll('.d-fade')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="d-noise" />
      <CustomCursor />
      <Navbar />

      <main>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="d-hero">
          <div className="d-hero-inner">
          <div className="d-hero-left">
            <p className="d-section-tag">Il jukebox che guadagna</p>
            <h1 className="d-h1">
              FAI<br />
              <span className="d-outline">SUONARE</span><br />
              LA <span className="d-acid">TUA</span><br />
              CANZONE
            </h1>
            <p className="d-hero-sub">
              Richiedi al DJ la tua canzone e paga solo se la accetta.{' '}
              <strong>Per discoteche, club e eventi.</strong>{' '}
              Zero hardware, zero app da installare.
            </p>
            <div className="d-hero-actions">
              <Link href="/login" className="d-btn-primary">
                <span>Prova gratis 14 giorni</span>
              </Link>
              <a href="#how" className="d-btn-ghost">Come funziona</a>
            </div>
            <div className="d-hero-stats">
              {[
                { num: '10%', label: 'Revenue share\nper transazione' },
                { num: '0',   label: 'Hardware\nnecessario' },
                { num: "2'",  label: 'Setup\niniziale' },
              ].map(s => (
                <div key={s.num}>
                  <p className="d-stat-num">{s.num}</p>
                  <p className="d-stat-label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="d-hero-right">
            <div className="d-glow-1" />
            <div className="d-glow-2" />
            <PhoneMockup />
          </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section id="how">
          <div className="d-section d-fade">
            <p className="d-section-tag">Il flusso</p>
            <h2 className="d-section-title">
              SEMPLICE<br /><span className="d-outline">PER TUTTI</span>
            </h2>
            <div className="d-steps">
              {[
                { n:'1', icon:'📱', title:'Scansiona il QR', desc: <span>Il cliente vede il QR code nel locale, apre la webapp dal browser. <strong>Nessuna app da scaricare.</strong> Accesso immediato.</span> },
                { n:'2', icon:'🎵', title:'Cerca e offri',    desc: <span>Cerca nel catalogo del DJ, scegli una canzone e <strong>fai la tua offerta</strong> da €2 a €20. Carta o Apple/Google Pay.</span> },
                { n:'3', icon:'🎧', title:'Il DJ decide',     desc: <span>Notifica in tempo reale. Accetta → addebito e canzone in coda. <strong>Rifiuta → rimborso automatico.</strong></span> },
              ].map(s => (
                <div key={s.n} className="d-step" data-n={s.n}>
                  <div className="d-step-icon">{s.icon}</div>
                  <h3 className="d-step-title">{s.title}</h3>
                  <p className="d-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVENUE ──────────────────────────────────────────── */}
        <div id="revenue" className="d-revenue">
          <div className="d-revenue-inner d-fade">
            <div>
              <p className="d-section-tag">Guadagni reali</p>
              <h2 className="d-section-title" style={{ marginBottom: 24 }}>
                QUANTO<br />PUOI<br /><span className="d-acid">GUADAGNARE</span>
              </h2>
              <p className="d-revenue-text">
                Il modello combina abbonamento fisso del locale e percentuale su ogni transazione.
                Una singola discoteca media genera oltre <strong>€480/mese</strong> di revenue per te.
              </p>
            </div>
            <div className="d-calc">
              <p className="d-calc-title">// Simulazione serata tipo</p>
              {([
                { k: 'Persone in discoteca',      v: '400' },
                { k: 'Richieste per serata',       v: '45' },
                { k: 'Offerta media',              v: '€6' },
                { k: 'Volume transazioni',         v: '€270' },
                null,
                { k: 'Tua quota (10%)',            v: '€27/sera' },
                { k: 'Abbonamento locale',         v: '€49/mese' },
                null,
                { k: 'Revenue mensile (1 locale)', v: '~€480', accent: true },
              ] as const).map((row, i) =>
                row === null
                  ? <div key={i} className="d-calc-divider" />
                  : <div key={i} className="d-calc-row">
                      <span className="d-calc-key">{row.k}</span>
                      <span className={`d-calc-val${(row as any).accent ? ' accent' : ''}`}>{row.v}</span>
                    </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STACK ────────────────────────────────────────────── */}
        <section id="stack">
          <div className="d-section d-fade">
            <p className="d-section-tag">Tech Stack</p>
            <h2 className="d-section-title">
              COSTRUITO<br /><span className="d-outline">CON IL MEGLIO</span>
            </h2>
            <div className="d-stack">
              {[
                { icon:'▲', name:'Next.js 14',        role:'App Router + SSR' },
                { icon:'⚡', name:'Supabase',           role:'DB + Realtime' },
                { icon:'💳', name:'Stripe Connect',     role:'Marketplace payments' },
                { icon:'🔌', name:'Socket.io',          role:'Real-time bidding' },
                { icon:'🎵', name:'Rekordbox XML',      role:'DJ catalog import' },
                { icon:'🎨', name:'Tailwind + shadcn',  role:'UI Components' },
                { icon:'🔐', name:'NextAuth.js',        role:'Auth per locali' },
                { icon:'🚀', name:'Vercel',             role:'Deploy + Edge' },
              ].map(s => (
                <div key={s.name} className="d-stack-item">
                  <div className="d-stack-icon">{s.icon}</div>
                  <p className="d-stack-name">{s.name}</p>
                  <p className="d-stack-role">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section id="pricing">
          <div className="d-section d-fade">
            <p className="d-section-tag">Piani</p>
            <h2 className="d-section-title">
              PREZZI<br /><span className="d-outline">CHIARI</span>
            </h2>
            <div className="d-pricing">
              {[
                {
                  badge: 'Starter', name: 'Basic', price: '19', featured: false,
                  features: ['1 locale','Dashboard DJ','Import Rekordbox','QR code personalizzato','10% su ogni transazione'],
                },
                {
                  badge: '⚡ Più scelto', name: 'Pro', price: '49', featured: true,
                  features: ['3 locali inclusi','Modalità asta live','Dediche su maxischermo','Analytics avanzate','Prezzi dinamici per evento','10% su ogni transazione'],
                },
                {
                  badge: 'Business', name: 'Agency', price: '99', featured: false,
                  features: ['Locali illimitati','White label','API access','Account manager dedicato','8% su ogni transazione'],
                },
              ].map(p => (
                <div key={p.name} className={`d-plan${p.featured ? ' featured' : ''}`}>
                  <span className="d-plan-badge">{p.badge}</span>
                  <p className="d-plan-name">{p.name}</p>
                  <p className="d-plan-price">€{p.price}</p>
                  <p className="d-plan-period">/mese per locale</p>
                  <ul className="d-plan-features">
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <Link
                    href="/login"
                    className={`d-plan-btn ${p.featured ? 'd-plan-btn-light' : 'd-plan-btn-dark'}`}
                  >
                    Inizia ora
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="d-cta d-fade">
          <h2 className="d-cta-title">
            PRONTO A<br /><span className="d-acid">DROPPARE?</span>
          </h2>
          <p className="d-cta-sub">14 giorni gratis. Nessuna carta richiesta. Setup in 2 minuti.</p>
          <Link href="/login" className="d-btn-primary">
            <span>Inizia il tuo progetto →</span>
          </Link>
        </section>

      </main>

      <footer className="d-footer">
        <a href="/" className="d-logo">DROP<span>.</span>FM</a>
        <p className="d-footer-copy">© 2026 Drop.fm — Built with Next.js</p>
      </footer>
    </>
  )
}
