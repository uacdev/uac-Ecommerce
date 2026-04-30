import { useEffect, useMemo, useState } from 'react'
import { statsApi } from '../../../api/client'

const STATUS_META = {
    pending:    { label: 'Pending',    color: '#f59e0b' },
    paid:       { label: 'Paid',       color: '#3b82f6' },
    confirmed:  { label: 'Confirmed',  color: '#6366f1' },
    shipped:    { label: 'Shipped',    color: '#8b5cf6' },
    delivered:  { label: 'Delivered',  color: '#10b981' },
    completed:  { label: 'Completed',  color: '#059669' },
    cancelled:  { label: 'Cancelled',  color: '#ef4444' }
}

const fmtNgn = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const StatusFunnel = () => {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        statsApi.getStatusFunnel()
            .then(res => { if (!cancelled && res.data?.success) setRows(res.data.data || []) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const max = useMemo(() => Math.max(1, ...rows.map(r => r.count)), [rows])
    const total = useMemo(() => rows.reduce((s, r) => s + r.count, 0), [rows])

    return (
        <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6 h-full">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Order pipeline</h3>
                    <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Where orders sit right now.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total</p>
                    <p className="text-[14px] font-bold text-[var(--text-primary)]">{total.toLocaleString()}</p>
                </div>
            </div>

            {loading ? (
                <div className="h-[260px] flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading…</div>
            ) : (
                <div className="space-y-3">
                    {rows.map(r => {
                        const meta = STATUS_META[r.status] || { label: r.status, color: '#94a3b8' }
                        const widthPct = (r.count / max) * 100
                        return (
                            <div key={r.status}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)]">{meta.label}</span>
                                    <div className="flex items-center gap-3 text-[11px] font-bold tabular-nums">
                                        <span className="text-[var(--text-muted)]">{fmtNgn(r.revenue)}</span>
                                        <span className="text-[var(--text-primary)] min-w-[2ch] text-right">{r.count}</span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${widthPct}%`, background: meta.color }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default StatusFunnel
