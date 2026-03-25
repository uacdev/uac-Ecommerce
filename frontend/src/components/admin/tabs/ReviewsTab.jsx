import React from 'react'
import { Star } from 'lucide-react'
import { format } from 'date-fns'

const reviewsData = [
    { id: 1, name: 'Alice Johnson', rating: 5, comment: 'Gala Sausage roll was perfectly fresh!', product: 'Gala Original', date: '2026-03-24' },
    { id: 2, name: 'Robert Smith', rating: 4, comment: 'Quick delivery but the packaging could be better.', product: 'Supreme Fish', date: '2026-03-23' },
    { id: 3, name: 'Sarah Wilson', rating: 5, comment: 'Best e-commerce experience so far.', product: 'Swan Water', date: '2026-03-22' }
]

const ReviewsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center text-[var(--text-primary)]">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Customer reviews</h2>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Feedback and ratings on business segments.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewsData.map(r => (
                <div key={r.id} className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm hover:shadow-md transition-all text-[var(--text-primary)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-amber-500">
                             {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />)}
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-tight">{format(new Date(r.date), 'MMM dd')}</span>
                    </div>
                    <p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight mb-2">"{r.comment}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)] mt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] border border-[var(--divider)]">{r.name.charAt(0)}</div>
                            <span className="text-[12px] font-bold text-[var(--text-primary)]">{r.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#ed0000] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full tracking-tight">{r.product}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

export default ReviewsTab
