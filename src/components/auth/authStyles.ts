export const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --acid:   #d4f000;
    --black:  #080808;
    --white:  #f5f0e8;
    --mid:    #1a1a1a;
    --border: #2a2a2a;
    --red:    #ff2d2d;
    --green:  #00e676;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; color-scheme: dark; }
  body {
    background: var(--black) !important;
    color: var(--white) !important;
    font-family: 'DM Sans', sans-serif !important;
    min-height: 100vh;
    cursor: default;
  }
  a, button, [role=button], label { cursor: pointer; }
  input, textarea { cursor: text; caret-color: var(--acid); }
  input[type=checkbox] { cursor: pointer; }
  *:disabled { cursor: not-allowed !important; }

  /* LAYOUT */
  .auth-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* LEFT PANEL — branding */
  .auth-left {
    background: var(--mid);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    position: relative;
    overflow: hidden;
  }
  .auth-left::before {
    content: 'DROP';
    font-family: 'Bebas Neue', sans-serif;
    font-size: 280px;
    color: rgba(255,255,255,0.02);
    position: absolute;
    bottom: -40px; left: -20px;
    line-height: 1;
    pointer-events: none;
    white-space: nowrap;
  }
  .auth-brand { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
  .auth-brand span { color: var(--acid); }

  .auth-left-content { position: relative; z-index: 1; }
  .auth-tagline { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 4vw, 64px); line-height: 0.95; margin-bottom: 24px; }
  .auth-tagline .acid { color: var(--acid); }
  .auth-tagline .outline { -webkit-text-stroke: 1px rgba(245,240,232,0.25); color: transparent; }
  .auth-tagline-sub { font-size: 15px; color: #666; line-height: 1.7; max-width: 340px; }

  .auth-features { display: flex; flex-direction: column; gap: 16px; }
  .auth-feature { display: flex; align-items: center; gap: 12px; }
  .auth-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acid); flex-shrink: 0; }
  .auth-feature-text { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; color: #555; text-transform: uppercase; }

  /* RIGHT PANEL — form */
  .auth-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px;
    background: var(--black);
  }
  .auth-form-wrap { width: 100%; max-width: 420px; }

  .auth-form-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 2px; margin-bottom: 4px; }
  .auth-form-sub { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; margin-bottom: 40px; }

  /* STEPS indicator (register) */
  .auth-steps { display: flex; gap: 8px; margin-bottom: 40px; }
  .auth-step-dot {
    height: 3px; flex: 1; border-radius: 2px;
    background: var(--border); transition: background 0.3s;
  }
  .auth-step-dot.active { background: var(--acid); }
  .auth-step-dot.done { background: #555; }

  /* INPUTS */
  .auth-field { margin-bottom: 16px; }
  .auth-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #555; margin-bottom: 8px; display: block; }
  .auth-input {
    width: 100%; background: var(--mid); border: 1px solid var(--border);
    padding: 14px 16px; font-family: 'DM Sans', sans-serif; font-size: 15px;
    color: var(--white); outline: none; transition: border-color 0.2s;
    border-radius: 0;
  }
  .auth-input:focus { border-color: var(--acid); }
  .auth-input::placeholder { color: #444; }
  .auth-input.error { border-color: var(--red); }

  .auth-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* SLUG preview */
  .auth-slug-preview {
    font-family: 'Space Mono', monospace; font-size: 10px;
    color: #555; margin-top: 6px; padding: 8px 12px;
    background: var(--mid); border: 1px solid var(--border);
  }
  .auth-slug-preview span { color: var(--acid); }

  /* ERROR / SUCCESS messages */
  .auth-error {
    font-family: 'Space Mono', monospace; font-size: 10px;
    color: var(--red); padding: 10px 14px;
    background: rgba(255,45,45,0.08); border: 1px solid rgba(255,45,45,0.2);
    margin-bottom: 16px;
  }
  .auth-success {
    font-family: 'Space Mono', monospace; font-size: 10px;
    color: var(--green); padding: 10px 14px;
    background: rgba(0,230,118,0.08); border: 1px solid rgba(0,230,118,0.2);
    margin-bottom: 16px;
  }

  /* SUBMIT BTN */
  .auth-btn {
    width: 100%; background: var(--acid); color: var(--black);
    border: none; padding: 16px; font-family: 'Space Mono', monospace;
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    font-weight: 700; cursor: pointer; transition: background 0.2s, opacity 0.2s;
    margin-top: 8px;
  }
  .auth-btn:hover { background: #fff; }
  .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .auth-btn.secondary {
    background: transparent; color: var(--white);
    border: 1px solid var(--border);
  }
  .auth-btn.secondary:hover { border-color: var(--acid); color: var(--acid); background: transparent; }

  .auth-btn-row { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 8px; }

  /* DIVIDER */
  .auth-divider { display: flex; align-items: center; gap: 16px; margin: 24px 0; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { font-family: 'Space Mono', monospace; font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; }

  /* LINK */
  .auth-link { font-family: 'Space Mono', monospace; font-size: 10px; color: #555; text-align: center; margin-top: 24px; }
  .auth-link a { color: var(--acid); text-decoration: none; }
  .auth-link a:hover { text-decoration: underline; }

  /* SPINNER */
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.3); border-top-color: var(--black);
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }

  /* PLAN SELECTOR */
  .plan-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 24px; }
  .plan-card {
    padding: 20px 16px; background: var(--mid); border: 1px solid var(--border);
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    text-align: center;
  }
  .plan-card:hover { border-color: #555; }
  .plan-card.selected { border-color: var(--acid); background: rgba(212,240,0,0.04); }
  .plan-card-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: var(--white); }
  .plan-card-price { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--acid); margin-top: 4px; }
  .plan-card-feat { font-size: 11px; color: #555; margin-top: 8px; line-height: 1.5; }

  /* SUCCESS STATE */
  .auth-success-screen { text-align: center; }
  .auth-success-icon { font-size: 48px; margin-bottom: 24px; }
  .auth-success-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; margin-bottom: 12px; color: var(--acid); }
  .auth-success-text { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 32px; }

  @media (max-width: 768px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 32px 24px; align-items: flex-start; padding-top: 64px; }
  }
`
