import { useEffect, useState } from 'react'
import { Star, Trash2, MessageSquare, Download } from 'lucide-react'
import { format } from 'date-fns'
import { reviewApi } from '../../../api/client'

const ReviewsTab = ({ onExport }) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        try {
            setLoading(true)
            const res = await reviewApi.getAll()
            if (res.data?.success) setReviews(res.data.data || [])
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Delete this review? This cannot be undone.')) return
        const prev = reviews
        setReviews(reviews.filter(r => r.id !== id))
        try {
            await reviewApi.delete(id)
        } catch (err) {
            setReviews(prev)
            setError(err.response?.data?.message || 'Could not delete review')
        }
    }

    const avg = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—'

    const handleExport = () => {
        if (!onExport) return
        const rows = reviews.map(r => ({
            date: r.date || '',
            customerName: r.customerName || '',
            customerEmail: r.customerEmail || '',
            productName: r.productName || '',
            rating: r.rating || 0,
            comment: r.comment || '',
            approved: r.approved !== false
        }))
        onExport(rows, 'reviews_export')
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customer reviews</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Feedback and ratings on business segments.</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Avg rating</p>
                        <p className="text-2xl font-bold tracking-tight text-amber-500">{avg}<span className="text-sm text-[var(--text-muted)]">/5</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total</p>
                        <p className="text-2xl font-bold tracking-tight">{reviews.length}</p>
                    </div>
                    <div>
                        <button
                            onClick={handleExport}
                            disabled={reviews.length === 0}
                            className="px-4 py-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[12px] font-bold"
                            title="Export reviews as CSV"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[12px] font-bold">{error}</div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between"><div className="flex gap-1">{[0,1,2,3,4].map(s => <div key={s} className="w-3 h-3 bg-[var(--bg-secondary)] rounded animate-pulse" />)}</div><div className="h-3 w-12 bg-[var(--bg-secondary)] rounded animate-pulse" /></div>
                            <div className="space-y-2"><div className="h-3 bg-[var(--bg-secondary)] rounded animate-pulse" /><div className="h-3 w-3/4 bg-[var(--bg-secondary)] rounded animate-pulse" /></div>
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)]">
                                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-full animate-pulse" /><div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></div>
                                <div className="h-4 w-16 bg-[var(--bg-secondary)] rounded-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="p-16 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl text-center">
                    <MessageSquare size={28} className="mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="text-[14px] font-bold text-[var(--text-primary)]">No reviews yet</p>
                    <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Customer feedback will appear here once reviews start coming in.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(r => (
                        <div key={r.id} className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm hover:shadow-md transition-all text-[var(--text-primary)] group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-amber-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-tight">{format(new Date(r.date), 'MMM dd')}</span>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-[#ed0000] transition-all"
                                        title="Delete review"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[14px] font-bold text-[var(--text-primary)] leading-snug mb-2 line-clamp-3">"{r.comment || 'No comment'}"</p>
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)] mt-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] border border-[var(--divider)] shrink-0">
                                        {r.customerName?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] truncate">{r.customerName}</span>
                                </div>
                                {r.productName && (
                                    <span className="text-[10px] font-bold text-[#ed0000] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full tracking-tight ml-2 truncate max-w-[40%]">
                                        {r.productName}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReviewsTab
