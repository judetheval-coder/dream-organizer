import { redirect } from 'next/navigation'

export default function CalendarRedirect() {
  redirect('/dashboard?tab=My Dreams')
}
