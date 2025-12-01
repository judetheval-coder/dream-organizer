'use client'

import dynamic from 'next/dynamic'

// Make AdminModerationPanel a client-side-only component
// Role check (admin only) happens inside AdminModerationPanel
const AdminModerationPanel = dynamic(() => import('@/components/AdminModerationPanel'), { ssr: false })

export default function AdminPage() {
    return <AdminModerationPanel />
}
