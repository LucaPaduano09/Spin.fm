import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'payment_intent.amount_capturable_updated': {
      // Il pagamento è autorizzato — in attesa che il DJ accetti
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('song_requests')
        .update({ status: 'pending' })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }

    case 'payment_intent.succeeded': {
      // Il DJ ha accettato e il pagamento è stato catturato
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('song_requests')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }

    case 'payment_intent.canceled': {
      // Il DJ ha rifiutato — rimborso automatico
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('song_requests')
        .update({ status: 'rejected' })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
