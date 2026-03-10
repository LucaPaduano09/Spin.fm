'use client'

// Pagina pubblica — il cliente la vede dopo aver scansionato il QR
// URL: /venue/[venueId]
// TODO: implementare nella prossima sessione con:
// - Ricerca nella libreria del DJ
// - Form offerta
// - Integrazione Stripe Elements
// - Coda live via Supabase Realtime

export default function VenuePage({ params }: { params: { venueId: string } }) {
  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-zinc-700 mb-2">
            Benvenuto
          </p>
          <h1 className="font-bebas text-[56px] leading-none mb-6 text-brand-acid">
            FALLO SUONARE
          </h1>
          <p className="text-zinc-600 text-sm mb-10 font-light">
            Cerca una canzone, fai la tua offerta.<br />
            Paghi solo se il DJ la accetta.
          </p>
          {/* Search component goes here */}
          <div className="bg-brand-mid border border-brand-border p-4 text-left">
            <p className="font-mono text-[9px] tracking-[2px] uppercase text-zinc-700 mb-3">
              Cerca nella libreria del DJ
            </p>
            <input
              type="text"
              placeholder="Titolo o artista..."
              className="w-full bg-transparent font-mono text-sm text-brand-cream placeholder-zinc-700 focus:outline-none"
            />
          </div>
          <p className="font-mono text-[9px] text-zinc-800 mt-6">
            venue: {params.venueId}
          </p>
        </div>
      </div>
    </main>
  )
}
