'use client'

interface AuthLeftPanelProps {
  title: React.ReactNode
  subtitle: string
  features: string[]
}

export function AuthLeftPanel({ title, subtitle, features }: AuthLeftPanelProps) {
  return (
    <div className="auth-left">
      <a href="/" className="auth-brand">DROP<span>.</span>FM</a>

      <div className="auth-left-content">
        <h2 className="auth-tagline">{title}</h2>
        <p className="auth-tagline-sub">{subtitle}</p>
      </div>

      <div className="auth-features">
        {features.map(f => (
          <div key={f} className="auth-feature">
            <div className="auth-feature-dot" />
            <span className="auth-feature-text">{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
