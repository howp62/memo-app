'use client'

import { useState, useEffect, useRef } from 'react'
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
  onDelete: (id: string) => void
}

export function NotesSidebar({
  notes,
  loading,
  selectedId,
  onSelect,
  onCreate,
  onSearch,
  onDelete,
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
            className="w-full pl-8 pr-3 py-1.5 text-[15px] md:text-sm rounded-md bg-white/60 dark:bg-zinc-700/60 border border-note-border dark:border-zinc-600 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 tracking-korean"
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
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

const DELETE_WIDTH = 76

function NoteItem({
  note,
  isSelected,
  onClick,
  onDelete,
}: {
  note: Note
  isSelected: boolean
  onClick: () => void
  onDelete: (id: string) => void
}) {
  const title = note.title || '제목 없음'
  const preview = getNotePreview(note.content)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLLIElement>(null)

  // Close swipe when note changes or is selected
  useEffect(() => {
    setDeleteOpen(false)
  }, [note.id, isSelected])

  // Close on outside touch
  useEffect(() => {
    if (!deleteOpen) return
    const handleOutside = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDeleteOpen(false)
      }
    }
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => document.removeEventListener('touchstart', handleOutside)
  }, [deleteOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (dy > 40) return  // vertical scroll, ignore
    if (dx > 50) setDeleteOpen(true)
    else if (dx < -20) setDeleteOpen(false)
  }

  const handleMainClick = () => {
    if (deleteOpen) {
      setDeleteOpen(false)
    } else {
      onClick()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteOpen(false)
    onDelete(note.id)
  }

  return (
    <li ref={containerRef} className="relative overflow-hidden group">
      {/* Delete button revealed by swipe (mobile) */}
      <div
        className="absolute right-0 inset-y-0 bg-red-500 flex items-center justify-center"
        style={{ width: DELETE_WIDTH }}
      >
        <button
          onClick={handleDelete}
          className="text-white text-sm font-medium tracking-korean w-full h-full active:bg-red-600 transition-colors"
        >
          삭제
        </button>
      </div>

      {/* Sliding content wrapper */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: deleteOpen ? `translateX(-${DELETE_WIDTH}px)` : 'translateX(0)',
          transition: 'transform 0.22s ease',
        }}
        className={`flex items-stretch bg-white dark:bg-zinc-900 border-b border-note-border/50 dark:border-zinc-700/50 ${
          isSelected ? 'border-l-2 border-l-note-active-border bg-note-active dark:bg-amber-900/30' : ''
        }`}
      >
        {/* Main tap area */}
        <button
          onClick={handleMainClick}
          className={`flex-1 min-w-0 text-left px-3 py-2.5 transition-colors ${
            !isSelected ? 'hover:bg-stone-50 dark:hover:bg-zinc-800' : ''
          }`}
        >
          <p className="text-[15px] md:text-sm font-medium text-stone-800 dark:text-zinc-100 truncate tracking-korean leading-snug">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[13px] md:text-xs text-stone-400 dark:text-zinc-500 shrink-0">
              {formatDate(note.updated_at)}
            </span>
            {preview && (
              <span className="text-[13px] md:text-xs text-stone-500 dark:text-zinc-400 truncate tracking-korean">
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

        {/* Desktop hover delete button */}
        <button
          onClick={handleDelete}
          className="hidden md:group-hover:flex items-center justify-center w-9 shrink-0 text-stone-300 hover:text-red-500 transition-colors"
          title="삭제"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  )
}
