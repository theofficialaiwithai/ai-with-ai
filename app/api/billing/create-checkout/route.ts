import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await req.json()
  if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Create or reuse Stripe customer
  let stripeCustomerId = profile.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { clerkUserId: userId },
    })
    stripeCustomerId = customer.id
    await db.update(profiles)
      .set({ stripeCustomerId })
      .where(eq(profiles.id, userId))
  }

  const isMonthly = priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: isMonthly ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/settings?success=true`,
    cancel_url: `${APP_URL}/settings`,
    metadata: { clerkUserId: userId },
  })

  return NextResponse.json({ url: session.url })
}
