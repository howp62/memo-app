'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { NotesSidebar } from '@/components/features/NotesSidebar'
import { NoteEditor } from '@/components/features/NoteEditor'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { Note } from '@/types'

export default function NotesPage() {
  const { user, signOut } = useAuth()
  const { notes, loading, createNote, updateNote, deleteNote, searchNotes } = useNotes(user?.id)
  const { isDark, setTheme, theme } = useTheme()
  const router = useRouter()

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const selectedNote = notes.find(n => n.id === selectedNoteId) ?? null
  // Mobile: 'list' shows sidebar, 'editor' shows editor
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list')

  const handleCreate = useCallback(async () => {
    const note = await createNote()
    if (note) {
      setSelectedNoteId(note.id)
      setMobileView('editor')
    }
  }, [createNote])

  const handleSelect = useCallback((note: Note) => {
    setSelectedNoteId(note.id)
    setMobileView('editor')
  }, [])

  const handleUpdate = useCallback(async (id: string, updates: { title: string; content: string }) => {
    await updateNote(id, updates)
  }, [updateNote])

  const handleDelete = useCallback(async (id: string) => {
    await deleteNote(id)
    setSelectedNoteId(null)
    setMobileView('list')
  }, [deleteNote])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-note-bg dark:bg-zinc-900">
      {/* Sidebar — hidden on mobile when editor is open */}
      <div className={`
        w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col
        ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Top nav */}
        <div className="flex items-center gap-1 px-3 pt-3 pb-1 bg-note-sidebar dark:bg-zinc-800 border-r border-note-border dark:border-zinc-700">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-stone-500 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-700 transition-colors"
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => router.push('/settings')}
            className="p-2 rounded-lg text-stone-500 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-700 transition-colors"
            title="설정"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-stone-500 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-700 transition-colors"
            title="로그아웃"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <NotesSidebar
          notes={notes}
          loading={loading}
          selectedId={selectedNote?.id ?? null}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onSearch={searchNotes}
        />
      </div>

      {/* Editor area */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        <NoteEditor
          note={selectedNote}
          userId={user?.id ?? ''}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBack={() => setMobileView('list')}
        />
      </div>
    </div>
  )
}
