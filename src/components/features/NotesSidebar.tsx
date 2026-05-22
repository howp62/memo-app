'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate, getNotePreview } from '@/lib/utils'
import type { Note } from '@/types'

interface NotesSidebarProps {
  notes: Note[]
  loading: boolean
  selectedId: string | null
  onSelect: (note: Note) => void
  onCreate: () => void
  onSearch: (query: string) => Promise<Note[]>
}

export function NotesSidebar({
  notes,
  loading,
  selectedId,
  onSelect,
  onCreate,
  onSearch,
}: NotesSidebarProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searching, setSearching] = useState(false)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await onSearch(query)
      setSearchResults(results)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const displayNotes = searchResults ?? notes

  return (
    <aside className="flex flex-col h-full bg-note-sidebar dark:bg-zinc-800 border-r border-note-border dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2">
        <h1 className="text-base font-semibold text-stone-800 dark:text-zinc-100 flex-1 tracking-korean">
          메모
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreate}
          title="새 메모"
          className="rounded-full w-8 h-8 p-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-zinc-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="메모 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-white/60 dark:bg-zinc-700/60 border border-note-border dark:border-zinc-600 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 tracking-korean"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Notes count */}
      {query && (
        <p className="px-3 pb-1 text-xs text-stone-400 dark:text-zinc-500 tracking-korean">
          {searching ? '검색 중...' : `${displayNotes.length}개 결과`}
        </p>
      )}

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-5 h-5 text-amber-400" />
          </div>
        ) : displayNotes.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-stone-400 dark:text-zinc-500 tracking-korean">
              {query ? '검색 결과가 없습니다' : '메모가 없습니다'}
            </p>
            {!query && (
              <button
                onClick={onCreate}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 tracking-korean"
              >
                새 메모 만들기
              </button>
            )}
          </div>
        ) : (
          <ul>
            {displayNotes.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedId}
                onClick={() => onSelect(note)}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

function NoteItem({
  note,
  isSelected,
  onClick,
}: {
  note: Note
  isSelected: boolean
  onClick: () => void
}) {
  const title = note.title || '제목 없음'
  const preview = getNotePreview(note.content)

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2.5 border-b border-note-border/50 dark:border-zinc-700/50 transition-colors ${
          isSelected
            ? 'bg-note-active dark:bg-amber-900/30 border-l-2 border-l-note-active-border'
            : 'hover:bg-white/50 dark:hover:bg-zinc-700/50'
        }`}
      >
        <p className="text-sm font-medium text-stone-800 dark:text-zinc-100 truncate tracking-korean leading-snug">
          {title}
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xs text-stone-400 dark:text-zinc-500 shrink-0">
            {formatDate(note.updated_at)}
          </span>
          {preview && (
            <span className="text-xs text-stone-500 dark:text-zinc-400 truncate tracking-korean">
              {preview}
            </span>
          )}
        </div>
        {note.attachments && note.attachments.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-xs text-stone-400">{note.attachments.length}개</span>
          </div>
        )}
      </button>
    </li>
  )
}
