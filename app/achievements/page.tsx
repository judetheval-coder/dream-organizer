import { redirect } from 'next/navigation'

export default function AchievementsRedirect() {
  redirect('/dashboard?tab=Insights')
}


