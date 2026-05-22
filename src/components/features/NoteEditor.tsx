'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileUpload } from './FileUpload'
import { useAutoSave } from '@/hooks/useAutoSave'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Note, Attachment } from '@/types'

interface NoteEditorProps {
  note: Note | null
  userId: string
  onUpdate: (id: string, updates: { title: string; content: string }) => Promise<void>
  onDelete: (id: string) => void
  onBack?: () => void
}

export function NoteEditor({ note, userId, onUpdate, onDelete, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const { saveStatusText } = useAutoSave({
    noteId: note?.id ?? null,
    title,
    content,
    onSave: onUpdate,
  })

  // Sync editor when selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setAttachments(note.attachments || [])
    } else {
      setTitle('')
      setContent('')
      setAttachments([])
    }
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = contentRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  useEffect(() => { resizeTextarea() }, [content, resizeTextarea])

  // Load attachments when note changes
  useEffect(() => {
    if (!note?.id) return
    supabase
      .from('attachments')
      .select('*')
      .eq('note_id', note.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setAttachments(data)
      })
  }, [note?.id])

  const handleDelete = async () => {
    if (!note) return
    onDelete(note.id)
    setShowDeleteConfirm(false)
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 text-stone-300 dark:text-zinc-600">
        <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-base tracking-korean">메모를 선택하거나 새로 만드세요</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-note-border dark:border-zinc-700">
        {/* Back button (mobile only) */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="flex-1 flex items-center gap-2">
          {/* Save status */}
          <span className="text-xs text-stone-400 dark:text-zinc-500 tracking-korean">
            {saveStatusText}
          </span>
        </div>

        {/* Date */}
        <span className="text-xs text-stone-400 dark:text-zinc-500 tracking-korean">
          {formatDate(note.updated_at)}
        </span>

        {/* Delete */}
        <div className="relative">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded"
            title="메모 삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {showDeleteConfirm && (
            <div className="absolute right-0 top-8 z-10 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-note-border dark:border-zinc-600 p-3">
              <p className="text-sm text-stone-700 dark:text-zinc-300 tracking-korean mb-3">
                이 메모를 삭제하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors tracking-korean"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-lg transition-colors tracking-korean"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-3xl mx-auto w-full">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full text-2xl font-bold text-stone-900 dark:text-zinc-100 bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-zinc-600 tracking-korean leading-snug mb-3"
        />

        {/* Content */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => { setContent(e.target.value); resizeTextarea() }}
          placeholder="내용을 입력하세요..."
          className="w-full min-h-[200px] text-[15px] text-stone-800 dark:text-zinc-200 bg-transparent border-none outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-zinc-600 tracking-korean leading-korean"
        />

        {/* File attachments */}
        <FileUpload
          noteId={note.id}
          userId={userId}
          attachments={attachments}
          onUpload={att => setAttachments(prev => [...prev, att])}
          onDelete={id => setAttachments(prev => prev.filter(a => a.id !== id))}
        />
      </div>
    </div>
  )
}
