import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function Nav() {
  const { userId } = await auth()
  if (!userId) return null

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: '12px 24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <UserButton />
    </nav>
  )
}
