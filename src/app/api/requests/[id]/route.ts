import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { capturePayment, cancelPayment } from '@/lib/stripe'
import { z } from 'zod'

const ActionSchema = z.object({
  action: z.enum(['accept', 'reject']),
})

// PATCH /api/requests/[id] — DJ accetta o rifiuta
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body   = await req.json()
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: request } = await supabase
    .from('song_requests')
    .select('stripe_payment_intent_id, status')
    .eq('id', params.id)
    .single()

  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

  if (parsed.data.action === 'accept') {
    await capturePayment(request.stripe_payment_intent_id)
    await supabase
      .from('song_requests')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', params.id)
  } else {
    await cancelPayment(request.stripe_payment_intent_id)
    await supabase
      .from('song_requests')
      .update({ status: 'rejected' })
      .eq('id', params.id)
  }

  return NextResponse.json({ ok: true })
}
