import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    country: 'BR',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
    settings: {
      payouts: { schedule: { interval: 'manual' } },
    },
  })
}

export async function createAccountLink(accountId: string, baseUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/barbeiro/configuracoes?stripe=refresh`,
    return_url:  `${baseUrl}/barbeiro/configuracoes?stripe=success`,
    type: 'account_onboarding',
  })
}

export async function createPaymentIntent(
  amountCents: number,
  stripeCustomerId: string,
  barberStripeAccountId: string,
  platformFeeCents: number,
  metadata: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'brl',
    customer: stripeCustomerId,
    transfer_data: { destination: barberStripeAccountId },
    application_fee_amount: platformFeeCents,
    metadata,
    payment_method_types: ['card'],
  })
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  amountCents?: number
) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  })
}
