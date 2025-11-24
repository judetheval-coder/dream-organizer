import { redirect } from 'next/navigation'

export default function DreamsPageRedirect() {
  redirect('/dashboard?tab=My Dreams')
}
