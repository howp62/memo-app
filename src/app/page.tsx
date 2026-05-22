import { redirect } from 'next/navigation'

// Root redirects to notes (auth check is in (main)/layout)
export default function Home() {
  redirect('/notes')
}
