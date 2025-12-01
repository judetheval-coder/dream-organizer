'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Make AdminModerationPanel a client-side-only component
const AdminModerationPanel = dynamic(() => import('@/components/AdminModerationPanel'), { ssr: false })

export default function AdminPage() {
    const router = useRouter()
    
    useEffect(() => {
        // Check if admin is allowed (dev-only check on client)
        const isDev = process.env.NODE_ENV === 'development'
        const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
        
        if (!isDev && !isEnabled) {
            router.push('/')
        }
    }, [router])
    
    return <AdminModerationPanel />
}
