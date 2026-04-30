import { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { statsApi } from '../../../api/client'

const COLORS = ['#ed0000', '#0f2e53', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const fmtNgn = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const RevenueDonut = () => {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        statsApi.getRevenueByCategory()
            .then(res => { if (!cancelled && res.data?.success) setRows(res.data.data || []) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const total = useMemo(() => rows.reduce((s, r) => s + r.revenue, 0), [rows])

    return (
        <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Revenue by category</h3>
                <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Paid orders only.</p>
            </div>

            {loading ? (
                <div className="h-[280px] flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading…</div>
            ) : rows.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-center px-6">
                    <p className="text-[13px] font-bold text-[var(--text-primary)]">No paid orders yet</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">Category breakdown will appear after the first paid order.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="relative h-[260px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={rows}
                                    dataKey="revenue"
                                    nameKey="category"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    stroke="var(--bg-tertiary)"
                                    strokeWidth={3}
                                >
                                    {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                                    formatter={(v, _n, p) => [fmtNgn(v), p.payload.category]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total</p>
                            <p className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{fmtNgn(total)}</p>
                        </div>
                    </div>
                    <ul className="space-y-2.5">
                        {rows.map((r, i) => {
                            const share = total > 0 ? (r.revenue / total) * 100 : 0
                            return (
                                <li key={r.category} className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] flex-1 truncate">{r.category}</span>
                                    <span className="text-[11px] font-bold text-[var(--text-muted)]">{share.toFixed(0)}%</span>
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums">{fmtNgn(r.revenue)}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default RevenueDonut
