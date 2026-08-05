import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import HomeClient from '@/components/home-client'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return <HomeClient />
}
