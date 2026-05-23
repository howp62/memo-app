'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/components/providers/ThemeProvider'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { supabase } from '@/lib/supabase'
import type { ThemeMode } from '@/types'

const themeLabels: Record<ThemeMode, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템',
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { canInstall, isInstalled, install } = usePWAInstall()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (newPassword !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다')
      return
    }
    if (newPassword.length < 6) {
      setPwError('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setChangingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setChangingPw(false)

    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess('비밀번호가 변경되었습니다')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-note-bg dark:bg-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-note-sidebar dark:bg-zinc-800 border-b border-note-border dark:border-zinc-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-stone-900 dark:text-zinc-100 tracking-korean">
          설정
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Account info */}
        <section className="bg-white dark:bg-zinc-800 rounded-xl border border-note-border dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-note-border dark:border-zinc-700">
            <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
              계정
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-stone-600 dark:text-zinc-300 tracking-korean">
              <span className="text-stone-400 dark:text-zinc-500">이메일 </span>
              {user?.email}
            </p>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-white dark:bg-zinc-800 rounded-xl border border-note-border dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-note-border dark:border-zinc-700">
            <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
              테마
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(themeLabels) as ThemeMode[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-2 text-sm rounded-lg border transition-colors tracking-korean ${
                    theme === t
                      ? 'bg-[#244F9A] border-[#244F9A] text-white font-medium'
                      : 'border-note-border dark:border-zinc-600 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {themeLabels[t]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className="bg-white dark:bg-zinc-800 rounded-xl border border-note-border dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-note-border dark:border-zinc-700">
            <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
              비밀번호 변경
            </p>
          </div>
          <form onSubmit={handlePasswordChange} className="p-4 space-y-3">
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="6자 이상"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            {pwError && (
              <p className="text-sm text-red-500 tracking-korean">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm text-emerald-600 tracking-korean">{pwSuccess}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={changingPw || !newPassword}
              className="w-full tracking-korean"
            >
              {changingPw ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </section>

        {/* PWA Install */}
        {(canInstall || isInstalled) && (
          <section className="bg-white dark:bg-zinc-800 rounded-xl border border-note-border dark:border-zinc-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-note-border dark:border-zinc-700">
              <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                앱 설치
              </p>
            </div>
            <div className="p-4">
              {isInstalled ? (
                <p className="text-sm text-stone-500 dark:text-zinc-400 tracking-korean">
                  앱이 설치되어 있습니다
                </p>
              ) : (
                <Button
                  variant="primary"
                  onClick={install}
                  className="w-full tracking-korean"
                >
                  홈 화면에 추가
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Sign out */}
        <section className="bg-white dark:bg-zinc-800 rounded-xl border border-note-border dark:border-zinc-700 overflow-hidden">
          <div className="p-4">
            <Button
              variant="danger"
              onClick={handleSignOut}
              className="w-full tracking-korean"
            >
              로그아웃
            </Button>
          </div>
        </section>

        {/* App info */}
        <p className="text-center text-xs text-stone-300 dark:text-zinc-600 tracking-korean">
          howpmemo v0.1.0
        </p>
      </div>
    </div>
  )
}
