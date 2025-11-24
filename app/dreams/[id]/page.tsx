import { redirect } from 'next/navigation'

interface DreamDetailParams {
  params: { id: string }
}

export default function DreamDetailRedirect({ params }: DreamDetailParams) {
  const searchParams = new URLSearchParams({ tab: 'My Dreams', dreamId: params.id })
  redirect(`/?${searchParams.toString()}`)
}