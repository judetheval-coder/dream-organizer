import { useState } from 'react'

export default function FeedbackForm({ onSubmit }: { onSubmit?: (data: { name: string; feedback: string }) => void }) {
    const [name, setName] = useState('')
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: send to backend or email service
        setTimeout(() => {
            setLoading(false)
            setSubmitted(true)
            onSubmit?.({ name, feedback })
        }, 1000)
    }

    if (submitted) {
        return (
            <div className="p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-semibold mb-1">Thank you for your feedback!</div>
                <div className="text-sm text-gray-400">We appreciate your input.</div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
