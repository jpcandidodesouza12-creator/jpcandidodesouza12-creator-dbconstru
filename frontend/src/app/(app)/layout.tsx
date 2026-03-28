// frontend/src/app/(app)/layout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div
        className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: '64px' }}
        id="main-content"
      >
        <Topbar />
        <main className="p-5">{children}</main>
      </div>
    </div>
  )
}
