'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all notes for the user
  const loadNotes = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*, attachments(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }, [userId])

  // Create a new note
  const createNote = async (): Promise<Note | null> => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: userId, title: '', content: '' })
      .select()
      .single()

    if (error) { setError(error.message); return null }
    setNotes(prev => [data, ...prev])
    return data
  }

  // Update a note (used for auto-save)
  const updateNote = async (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    const { error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    )
  }

  // Delete a note
  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  // Search notes (client-side filter + server query)
  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!userId) return []
    if (!query.trim()) return notes

    const { data, error } = await supabase
      .from('notes')
      .select('*, attachments(*)')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) return []
    return data || []
  }

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notes:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note
            setNotes(prev => {
              if (prev.find(n => n.id === newNote.id)) return prev
              return [newNote, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev =>
              prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            )
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { notes, loading, error, createNote, updateNote, deleteNote, searchNotes, refresh: loadNotes }
}
