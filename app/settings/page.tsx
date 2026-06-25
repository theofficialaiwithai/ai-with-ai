import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import SettingsClient from '@/components/settings-client'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const profile = await ensureProfile()
  if (!profile) redirect('/sign-in')

  const { success } = await searchParams

  return (
    <SettingsClient
      initialName={profile.name ?? ''}
      email={profile.email}
      preferredModel={profile.preferredModel}
      hasAnthropicKey={!!profile.anthropicApiKey}
      hasOpenAIKey={!!profile.openaiApiKey}
      subscriptionStatus={profile.subscriptionStatus}
      stripeCustomerId={profile.stripeCustomerId ?? null}
      showSuccessBanner={success === 'true'}
      proMonthlyPriceId={process.env.STRIPE_PRO_MONTHLY_PRICE_ID!}
      lifetimePriceId={process.env.STRIPE_LIFETIME_PRICE_ID!}
    />
  )
}
