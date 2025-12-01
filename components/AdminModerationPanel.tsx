"use client"
import { useEffect, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useUser } from '@clerk/nextjs'

export default function AdminModerationPanel() {
    const { user } = useUser()
    const [dreams, setDreams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [flagOpenId, setFlagOpenId] = useState<string | null>(null)
    const [flagReason, setFlagReason] = useState('')
    const [viewFlagsDreamId, setViewFlagsDreamId] = useState<string | null>(null)
    const [flagsList, setFlagsList] = useState<any[]>([])
    const [q, setQ] = useState('')
    const [page, setPage] = useState(0)
    const [limit, setLimit] = useState(20)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState<'created_at' | 'flags_count' | 'panels_count'>('created_at')
    const [order, setOrder] = useState<'asc' | 'desc'>('desc')
    const [selected, setSelected] = useState<Record<string, boolean>>({})
    const [detailsDream, setDetailsDream] = useState<any | null>(null)
    const { showToast } = useToast()

    const load = async (opts?: { resetPage?: boolean }) => {
        setLoading(true)
        setError(null)
        const offset = (opts?.resetPage ? 0 : page) * limit
        try {
            const serverSort = sort === 'created_at' ? 'created_at' : 'created_at'
            const res = await fetch(`/api/admin/dreams?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&sort=${serverSort}&order=${order}`)
            if (!res.ok) throw new Error('Failed')
            const json = await res.json()
            let fetched = json.dreams || []
            // client-side sorting for derived fields
            if (sort === 'flags_count') {
                fetched = fetched.sort((a: any, b: any) => (a.flags_count || 0) - (b.flags_count || 0))
            } else if (sort === 'panels_count') {
                fetched = fetched.sort((a: any, b: any) => (a.panels_count || 0) - (b.panels_count || 0))
            }
            if (sort !== 'created_at' && order === 'desc') fetched = fetched.reverse()
            setDreams(fetched)
            setSelected({})
            setTotal(json.total || 0)
        } catch (e) {
            setError((e as Error).message || 'Failed')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) return
        // Only allow admin users (replace with your admin logic)
        if (user?.publicMetadata?.role !== 'admin') {
            setError('Access denied: Admins only')
            setLoading(false)
            return
        }
        load({ resetPage: false })
    }, [user, q, page, limit, sort, order])

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>



    const reload = () => load()

    const handleDelete = async (dreamId: string) => {
        if (!confirm(`Delete dream ${dreamId}? This cannot be undone.`)) return
        try {
            const res = await fetch('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dreamId }) })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || 'Failed to delete')
            setDreams(prev => prev.filter(d => d.id !== dreamId))
            showToast('Dream deleted', 'success')
        } catch (e) {
            console.error('Delete failed', e)
            setError((e as Error).message)
        }
    }

    const openFlagModal = (dreamId: string) => {
        setFlagOpenId(dreamId)
        setFlagReason('')
    }

    const submitFlag = async () => {
        if (!flagOpenId || !flagReason.trim()) return
        try {
            const res = await fetch('/api/admin/flag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dreamId: flagOpenId, reason: flagReason }) })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || 'Failed to flag')
            setFlagOpenId(null)
            // optionally refresh counts
            reload()
            showToast('Flag submitted', 'success')
        } catch (e) {
            console.error('Flag failed', e)
            setError((e as Error).message)
        }
    }

    const openViewFlags = async (dreamId: string) => {
        setViewFlagsDreamId(dreamId)
        try {
            const res2 = await fetch(`/api/admin/flags?dreamId=${encodeURIComponent(dreamId)}`)
            const json2 = await res2.json()
            const flags = json2.flags || []
            setFlagsList(flags)
        } catch (e) {
            console.error('Flags fetch failed', e)
            setError((e as Error).message)
        }
        finally {
            // noop
        }
    }

    const resolveFlag = async (flagId: string) => {
        if (!confirm('Mark flag as resolved?')) return
        try {
            const res = await fetch('/api/admin/resolve-flag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagId }) })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || 'Failed to resolve')
            setFlagsList(prev => prev.filter(f => f.id !== flagId))
            reload()
            showToast('Flag resolved', 'success')
        } catch (e) {
            console.error('Resolve failed', e)
            setError((e as Error).message)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Moderation Panel</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search by text or user" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); load({ resetPage: true }) } }} className="px-3 py-2 rounded border bg-gray-900/30" />
                    <button onClick={() => { setPage(0); load({ resetPage: true }) }} className="px-3 py-2 rounded bg-cyan-500 text-white">Search</button>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Sort</label>
                    <select value={sort} onChange={(e) => { setSort(e.target.value as any); setPage(0) }} className="px-2 py-1 rounded bg-gray-900/30">
                        <option value="created_at">Date</option>
                        <option value="flags_count">Flags</option>
                        <option value="panels_count">Panels</option>
                    </select>
                    <select value={order} onChange={(e) => { setOrder(e.target.value as any); setPage(0) }} className="px-2 py-1 rounded bg-gray-900/30">
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                    </select>
                </div>
            </div>
            <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-900">
                    <tr>
                        <th className="p-2 text-left"><input type="checkbox" onChange={(e) => {
                            const checked = e.target.checked
                            const newSelected: Record<string, boolean> = {}
                            if (checked) {
                                dreams.forEach(d => newSelected[d.id] = true)
                            }
                            setSelected(newSelected)
                        }} checked={dreams.length > 0 && dreams.every(d => selected[d.id])} /></th>
                        <th className="p-2 text-left">Preview</th>
                        <th className="p-2 text-left">User</th>
                        <th className="p-2 text-left">Dream</th>
                        <th className="p-2 text-left">Created</th>
                        <th className="p-2 text-left">Panels</th>
                        <th className="p-2 text-left">Flags</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dreams.map(dream => (
                        <tr key={dream.id} className="border-b border-gray-800">
                            <td className="p-2"><input type="checkbox" checked={!!selected[dream.id]} onChange={(e) => {
                                const newSelected = { ...selected }
                                if (e.target.checked) newSelected[dream.id] = true
                                else delete newSelected[dream.id]
                                setSelected(newSelected)
                            }} /></td>
                            <td className="p-2">
                                {dream?.panels?.[0]?.image_url ? (
                                    <img src={dream.panels[0].image_url} alt="preview" className="w-12 h-12 rounded object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-xs">No Image</div>
                                )}
                            </td>
                            <td className="p-2">{dream.user_id}</td>
                            <td className="p-2 max-w-xs truncate">
                                <a className="cursor-pointer underline" onClick={() => setDetailsDream(dream)}>{dream.text}</a>
                            </td>
                            <td className="p-2">{new Date(dream.created_at).toLocaleString()}</td>
                            <td className="p-2">{dream.panels_count || (dream.panels?.length || 0)}</td>
                            <td className="p-2">{dream.flags_count || 0}</td>
                            <td className="p-2">
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(dream.id)} className="px-3 py-1 rounded bg-red-600 text-white text-xs">Delete</button>
                                    <button onClick={() => openFlagModal(dream.id)} className="px-3 py-1 rounded bg-yellow-500 text-white text-xs">Flag</button>
                                    <button onClick={() => openViewFlags(dream.id)} className="px-3 py-1 rounded bg-gray-700 text-white text-xs">View Flags</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                    Showing {(page * limit) + 1} to {Math.min(total, (page + 1) * limit)} of {total}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { if (page > 0) setPage(page - 1) }} disabled={page === 0} className={"px-2 py-1 rounded bg-gray-800 " + (page === 0 ? 'opacity-50 cursor-not-allowed' : '')}>Prev</button>
                    <button onClick={() => { if ((page + 1) * limit < total) setPage(page + 1) }} disabled={(page + 1) * limit >= total} className={"px-2 py-1 rounded bg-gray-800 " + ((page + 1) * limit >= total ? 'opacity-50 cursor-not-allowed' : '')}>Next</button>
                    <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(0) }} className="px-2 py-1 rounded bg-gray-900/30">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            {flagOpenId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-2">Flag Dream</h2>
                        <p className="text-sm text-gray-700 mb-4">Please provide a reason for flagging this dream.</p>
                        <textarea value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="w-full p-2 border rounded mb-4" rows={4} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setFlagOpenId(null)} className="px-4 py-2 rounded bg-gray-300">Cancel</button>
                            <button onClick={submitFlag} className="px-4 py-2 rounded bg-yellow-500 text-white">Submit Flag</button>
                        </div>
                    </div>
                </div>
            )}
            {viewFlagsDreamId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-2">Flags for Dream</h2>
                        <div className="space-y-2 mb-4">
                            {flagsList.length === 0 ? (
                                <p className="text-sm text-gray-700">No flags for this dream.</p>
                            ) : (
                                flagsList.map(f => (
                                    <div key={f.id} className="flex justify-between items-start p-2 border rounded">
                                        <div>
                                            <p className="text-sm font-semibold">{f.reason}</p>
                                            <p className="text-xs text-gray-600">by {f.user_id} — {new Date(f.created_at).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => resolveFlag(f.id)} className="px-3 py-1 rounded bg-green-600 text-white text-xs">Resolve</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setViewFlagsDreamId(null)} className="px-4 py-2 rounded bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {Object.keys(selected).length > 0 && (
                <div className="mt-4 flex gap-2">
                    <button onClick={async () => {
                        const ids = Object.keys(selected)
                        if (!confirm(`Delete ${ids.length} dreams? This cannot be undone.`)) return
                        try {
                            await Promise.all(ids.map(id => fetch('/api/admin/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dreamId: id }) })))
                            showToast(`Deleted ${ids.length} dreams`, 'success')
                            setSelected({})
                            await load({ resetPage: true })
                        } catch (e) {
                            console.error('Bulk delete failed', e)
                            showToast('Bulk delete failed', 'error')
                        }
                    }} className="px-3 py-2 rounded bg-red-600 text-white">Bulk Delete ({Object.keys(selected).length})</button>
                </div>
            )}

            {detailsDream && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded p-6 max-w-3xl w-full">
                        <h2 className="text-xl font-bold mb-2">Dream Details</h2>
                        <p className="mb-4 whitespace-pre-wrap">{detailsDream.text}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(detailsDream.panels || []).map((p: any) => (
                                <img key={p.id} src={p.image_url} className="w-36 h-36 object-cover rounded" />
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDetailsDream(null)} className="px-3 py-2 rounded bg-gray-300">Close</button>
                            <button onClick={() => { handleDelete(detailsDream.id); setDetailsDream(null) }} className="px-3 py-2 rounded bg-red-600 text-white">Delete</button>
                            <button onClick={() => { openFlagModal(detailsDream.id); setDetailsDream(null) }} className="px-3 py-2 rounded bg-yellow-500 text-white">Flag</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
