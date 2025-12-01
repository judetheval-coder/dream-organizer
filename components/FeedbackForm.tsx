import { useState } from 'react'

type FeedbackCategory = 'general' | 'bug' | 'feature' | 'praise'

export default function FeedbackForm({ onSubmit }: { onSubmit?: (data: { name: string; feedback: string }) => void }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [feedback, setFeedback] = useState('')
    const [category, setCategory] = useState<FeedbackCategory>('general')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, feedback, category })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback')
            }

            setSubmitted(true)
            onSubmit?.({ name, feedback })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-semibold mb-1">Thank you for your feedback!</div>
                <div className="text-sm text-gray-400">We appreciate your input and will review it soon.</div>
            </div>
        )
    }

    const categories: { value: FeedbackCategory; label: string; icon: string }[] = [
        { value: 'general', label: 'General', icon: '💬' },
        { value: 'bug', label: 'Bug Report', icon: '🐛' },
        { value: 'feature', label: 'Feature Request', icon: '✨' },
        { value: 'praise', label: 'Love it!', icon: '❤️' },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat.value
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Name (optional)</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email (optional)</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 rounded-lg border bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <textarea
                    className="w-full px-3 py-2 rounded-lg border bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="What do you love? What could be better?"
                    rows={4}
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 rounded-lg font-semibold bg-cyan-500 hover:bg-cyan-600 text-white transition-all disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'Sending...' : 'Send Feedback'}
            </button>
        </form>
    )
}
