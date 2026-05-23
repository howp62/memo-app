'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user, loading, signIn, signUp } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace('/notes')
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        router.push('/notes')
      } else {
        await signUp(email, password)
        setMessage('회원가입 완료! 이메일을 확인하여 계정을 활성화하세요.')
        setMode('login')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다'
      // Translate common Supabase errors to Korean
      if (msg.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다')
      } else if (msg.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 받은 편지함을 확인하세요')
      } else if (msg.includes('User already registered')) {
        setError('이미 가입된 이메일입니다')
      } else if (msg.includes('Password should be')) {
        setError('비밀번호는 6자 이상이어야 합니다')
      } else {
        setError(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-note-bg dark:bg-zinc-900">
        <div className="w-8 h-8 border-2 border-[#244F9A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-note-bg dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#244F9A] rounded-2xl shadow-md mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 tracking-korean">
            메모
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1 tracking-korean">
            간단하고 빠른 메모 앱
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-note-border dark:border-zinc-700 p-6">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-stone-100 dark:bg-zinc-700/50 rounded-lg p-1 mb-5">
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); setMessage('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors tracking-korean ${
                  mode === tab
                    ? 'bg-white dark:bg-zinc-600 text-stone-900 dark:text-zinc-100 shadow-sm'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700'
                }`}
              >
                {tab === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder={mode === 'signup' ? '6자 이상' : '비밀번호'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />

            {error && (
              <p className="text-sm text-red-500 tracking-korean bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 tracking-korean bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                {message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full tracking-korean"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {mode === 'login' ? '로그인 중...' : '가입 중...'}
                </span>
              ) : (
                mode === 'login' ? '로그인' : '회원가입'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 dark:text-zinc-500 mt-6 tracking-korean">
          이메일과 비밀번호로 간편하게 시작하세요
        </p>
      </div>
    </main>
  )
}
