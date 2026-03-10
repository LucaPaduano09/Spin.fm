import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drop.fm — Paga. Richiedi. Senti.',
  description: 'Il jukebox per discoteche che monetizza le richieste musicali in tempo reale.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, background: '#080808', color: '#f5f0e8' }}>
        {children}
      </body>
    </html>
  )
}
