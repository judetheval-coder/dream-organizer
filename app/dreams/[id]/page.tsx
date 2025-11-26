import { redirect } from 'next/navigation'

interface DreamDetailParams {
  params: { id: string }
}

export default function DreamDetailRedirect({ params }: DreamDetailParams) {
  // Redirect to public dream page for sharing and social previews
  redirect(`/public/dreams/${params.id}`)
}