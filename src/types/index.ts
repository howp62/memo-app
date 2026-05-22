export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  note_id: string
  user_id: string
  file_url: string
  file_name: string
  file_size: number | null
  file_type: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type ThemeMode = 'light' | 'dark' | 'system'
