import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const status = searchParams.get('status')

  if (status === 'success') {
    return NextResponse.redirect(`${origin}/dashboard/stripe?success=1`)
  }

  // refresh = l'utente ha abbandonato o scaduto — rimanda all'onboarding
  return NextResponse.redirect(`${origin}/dashboard/stripe?error=1`)
}
