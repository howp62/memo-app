'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-note-bg dark:bg-zinc-900">
        <Spinner className="w-7 h-7 text-[#244F9A]" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
