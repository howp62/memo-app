'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'
import type { Attachment } from '@/types'

interface FileUploadProps {
  noteId: string
  userId: string
  attachments: Attachment[]
  onUpload: (attachment: Attachment) => void
  onDelete: (attachmentId: string) => void
}

export function FileUpload({ noteId, userId, attachments, onUpload, onDelete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      // Limit: 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다')
        continue
      }

      try {
        const filePath = `${userId}/${noteId}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath)

        const { data: attachment, error: dbError } = await supabase
          .from('attachments')
          .insert({
            note_id: noteId,
            user_id: userId,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          })
          .select()
          .single()

        if (dbError) throw dbError
        onUpload(attachment)
      } catch (err) {
        setError(err instanceof Error ? err.message : '업로드 실패')
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`"${attachment.file_name}"을 삭제하시겠습니까?`)) return

    try {
      // Extract path from URL (after /public/)
      const urlParts = attachment.file_url.split('/attachments/')
      if (urlParts[1]) {
        await supabase.storage.from('attachments').remove([urlParts[1]])
      }
      await supabase.from('attachments').delete().eq('id', attachment.id)
      onDelete(attachment.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패')
    }
  }

  const isImage = (type: string | null) => type?.startsWith('image/') ?? false

  return (
    <div className="mt-4 border-t border-note-border dark:border-zinc-700 pt-4">
      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 tracking-korean">
            첨부 파일 ({attachments.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {attachments.map(att => (
              <div key={att.id} className="group relative">
                {isImage(att.file_type) ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700">
                    <Image
                      src={att.file_url}
                      alt={att.file_name}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleDelete(att)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 dark:bg-zinc-700/50 border border-note-border dark:border-zinc-600">
                    <svg className="w-6 h-6 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate text-stone-700 dark:text-zinc-300">{att.file_name}</p>
                      {att.file_size && (
                        <p className="text-xs text-stone-400">{formatFileSize(att.file_size)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(att)}
                      className="text-stone-400 hover:text-red-500 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          onChange={e => handleUpload(e.target.files)}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-50 tracking-korean"
        >
          {uploading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              파일 업로드 중...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              파일 업로드
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 tracking-korean">{error}</p>
      )}
    </div>
  )
}
