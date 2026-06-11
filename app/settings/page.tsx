import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/ensure-profile'
import SettingsClient from '@/components/settings-client'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const profile = await ensureProfile()
  if (!profile) redirect('/sign-in')

  // Pass only safe fields to the client — never send encrypted keys
  return (
    <SettingsClient
      initialName={profile.name ?? ''}
      email={profile.email}
      preferredModel={profile.preferredModel}
      hasAnthropicKey={!!profile.anthropicApiKey}
      hasOpenAIKey={!!profile.openaiApiKey}
    />
  )
}
