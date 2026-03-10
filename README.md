# Drop.fm 🎵

> Il jukebox per discoteche che monetizza le richieste musicali in tempo reale.

## Come funziona

1. **Il cliente** scansiona il QR del locale → cerca nel catalogo del DJ → offre €2-20
2. **Il DJ** riceve notifica in real-time → accetta o rifiuta
3. **Accettata** → Stripe addebita, split automatico locale/piattaforma
4. **Rifiutata** → rimborso automatico immediato

---

## Stack

| Layer        | Tecnologia              |
|--------------|-------------------------|
| Framework    | Next.js 14 (App Router) |
| Database     | Supabase (Postgres)     |
| Realtime     | Supabase Realtime       |
| Pagamenti    | Stripe Connect          |
| Auth         | Supabase Auth           |
| UI           | Tailwind CSS + shadcn   |
| Deploy       | Vercel                  |

---

## Struttura progetto

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout + font
│   ├── globals.css                     # Design tokens + utilities
│   │
│   ├── (auth)/
│   │   └── login/page.tsx              # Login locale/DJ
│   │
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx          # Dashboard DJ (richieste live)
│   │
│   ├── (public)/
│   │   └── venue/[venueId]/page.tsx    # Pagina cliente (post QR scan)
│   │
│   └── api/
│       ├── webhooks/stripe/route.ts    # Stripe webhook handler
│       ├── requests/route.ts           # CRUD song requests
│       └── venues/route.ts             # CRUD venues
│
├── components/
│   ├── ui/          # shadcn base components
│   ├── venue/       # VenueCard, QRCode, Settings
│   ├── dj/          # RequestCard, RequestList, EarningsBar
│   └── shared/      # Navbar, Footer, Cursor
│
├── lib/
│   ├── supabase.ts  # Browser + Server + Admin clients
│   ├── stripe.ts    # PaymentIntent helpers + Connect
│   ├── rekordbox.ts # XML parser per catalogo DJ
│   └── schema.sql   # Schema DB completo
│
├── hooks/
│   ├── useRequests.ts   # Realtime requests subscription
│   └── useVenue.ts      # Venue data + settings
│
└── types/
    └── index.ts         # Tutti i tipi TypeScript
```

---

## Setup

### 1. Crea il progetto

```bash
git clone <repo>
cd drop-fm
npm install
cp .env.local.example .env.local
```

### 2. Configura Supabase

1. Crea progetto su [supabase.com](https://supabase.com)
2. Vai in SQL Editor → incolla il contenuto di `src/lib/schema.sql`
3. Copia URL e chiavi in `.env.local`

### 3. Configura Stripe

1. Crea account su [stripe.com](https://stripe.com)
2. Attiva **Stripe Connect** nel dashboard
3. Copia le chiavi in `.env.local`
4. Per i webhook in locale:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 4. Import catalogo Rekordbox

Da Rekordbox: **File → Export Collection in xml format**
Poi dal dashboard del DJ: carica il file XML → il sistema importa tutti i brani.

### 5. Avvia

```bash
npm run dev
```

---

## Flusso pagamenti (Stripe Connect)

```
Cliente offre €8
       ↓
PaymentIntent creato con capture_method: 'manual'
       ↓
Carta autorizzata (non addebitata)
       ↓
   DJ accetta?
   ├── SÌ → stripe.paymentIntents.capture()
   │         → €7.20 al locale, €0.80 alla piattaforma
   └── NO → stripe.paymentIntents.cancel()
             → rimborso automatico, €0 addebitati
```

---

## Roadmap MVP (1-3 mesi)

- [x] Struttura progetto
- [x] Schema DB
- [x] Landing page
- [ ] Auth (login/register locale)
- [ ] Import Rekordbox XML
- [ ] Pagina cliente (venue/[id])
- [ ] Dashboard DJ con realtime
- [ ] Integrazione Stripe Connect
- [ ] QR code generator
- [ ] Modalità asta live
- [ ] Dediche su maxischermo
- [ ] Analytics
# Spin.fm
