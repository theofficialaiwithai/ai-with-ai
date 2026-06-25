import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clerkUserId = session.metadata?.clerkUserId
        if (!clerkUserId) break

        const update =
          session.mode === 'subscription'
            ? { subscriptionStatus: 'pro', stripeCustomerId: session.customer as string }
            : { subscriptionStatus: 'lifetime', stripeCustomerId: session.customer as string }

        await db.update(profiles)
          .set(update)
          .where(eq(profiles.id, clerkUserId))
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await db.update(profiles)
          .set({ subscriptionStatus: 'cancelled' })
          .where(eq(profiles.stripeCustomerId, customerId))
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await db.update(profiles)
          .set({ subscriptionStatus: 'past_due' })
          .where(eq(profiles.stripeCustomerId, customerId))
        break
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
