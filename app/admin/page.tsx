
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'

// Make AdminModerationPanel a client-side-only component
const AdminModerationPanel = dynamic(() => import('@/components/AdminModerationPanel'), { ssr: false })

export default function AdminPage() {
    // Only allow in development or if explicitly enabled via env var
    const allowAdmin = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
    if (!allowAdmin) return redirect('/')
    return <AdminModerationPanel />
}
