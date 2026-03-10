import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

/**
 * Crea un PaymentIntent con trasferimento automatico al locale (Stripe Connect)
 * Il cliente viene addebitato solo quando il DJ accetta
 */
export async function createPendingPaymentIntent({
  amount,        // in euro
  venueStripeAccountId,
  metadata,
}: {
  amount: number
  venueStripeAccountId: string
  metadata: Record<string, string>
}) {
  const amountCents = Math.round(amount * 100)
  const platformFee = Math.round(amountCents * 0.10) // 10% piattaforma

  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'eur',
    capture_method: 'manual', // 🔑 non addebita subito — solo autorizza
    application_fee_amount: platformFee,
    transfer_data: { destination: venueStripeAccountId },
    metadata,
  })
}

/**
 * Cattura il pagamento quando il DJ accetta la richiesta
 */
export async function capturePayment(paymentIntentId: string) {
  return stripe.paymentIntents.capture(paymentIntentId)
}

/**
 * Annulla (rimborso completo) se il DJ rifiuta
 */
export async function cancelPayment(paymentIntentId: string) {
  return stripe.paymentIntents.cancel(paymentIntentId)
}

/**
 * Crea un account Stripe Connect per un nuovo locale
 */
export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    country: 'IT',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
}

/**
 * Genera il link di onboarding per il locale
 */
export async function createConnectOnboardingLink(accountId: string, baseUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/stripe/refresh`,
    return_url:  `${baseUrl}/dashboard/stripe/success`,
    type: 'account_onboarding',
  })
}
