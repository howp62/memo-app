'use client'

import { useState, useEffect, useRef } from 'react'
import type { SaveStatus } from '@/types'

interface AutoSaveOptions {
  noteId: string | null
  title: string
  content: string
  onSave: (id: string, updates: { title: string; content: string }) => Promise<void>
  delay?: number
}

export function useAutoSave({ noteId, title, content, onSave, delay = 1000 }: AutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip save on first render (avoid saving when note is first selected)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!noteId) return

    setSaveStatus('saving')

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await onSave(noteId, { title, content })
        setSaveStatus('saved')
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [noteId, title, content]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset first-render flag when note changes
  useEffect(() => {
    isFirstRender.current = true
    setSaveStatus('idle')
  }, [noteId])

  const saveStatusText: Record<SaveStatus, string> = {
    idle: '',
    saving: '저장 중...',
    saved: '저장됨',
    error: '저장 실패',
  }

  return { saveStatus, saveStatusText: saveStatusText[saveStatus] }
}
