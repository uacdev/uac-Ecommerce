import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts'
import { Clock, CalendarDays, TrendingUp } from 'lucide-react'
import { statsApi } from '../../../api/client'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const HOUR_BUCKETS = [
    { key: 'morning', label: 'Morning', range: '06–12', start: 6, end: 12 },
    { key: 'afternoon', label: 'Afternoon', range: '12–18', start: 12, end: 18 },
    { key: 'evening', label: 'Evening', range: '18–24', start: 18, end: 24 },
    { key: 'night', label: 'Late night', range: '00–06', start: 0, end: 6 }
]

const OrderTiming = () => {
    const [grid, setGrid] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        statsApi.getOrdersByHour()
            .then(res => { if (!cancelled && res.data?.success) setGrid(res.data.data || []) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const { byDay, byHour, peak, total, busiestPeriod } = useMemo(() => {
        const byDay = DAYS.map((label, i) => ({
            day: label,
            count: (grid[i] || []).reduce((s, n) => s + n, 0)
        }))
        const byHour = Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            label: `${h.toString().padStart(2, '0')}:00`,
            count: grid.reduce((s, row) => s + (row[h] || 0), 0)
        }))
        const total = byDay.reduce((s, d) => s + d.count, 0)

        let peak = null
        grid.forEach((row, d) => row.forEach((c, h) => {
            if (c > 0 && (!peak || c > peak.count)) peak = { day: DAYS[d], hour: h, count: c }
        }))

        // Group hours into 4 periods, find busiest
        const periods = HOUR_BUCKETS.map(b => {
            const count = byHour.filter(h => h.hour >= b.start && h.hour < b.end).reduce((s, h) => s + h.count, 0)
            return { ...b, count }
        }).sort((a, b) => b.count - a.count)
        const busiestPeriod = periods[0]

        return { byDay, byHour, peak, total, busiestPeriod }
    }, [grid])

    const maxDay = Math.max(1, ...byDay.map(d => d.count))
    const maxHour = Math.max(1, ...byHour.map(h => h.count))

    const busiestDay = useMemo(() => byDay.reduce((acc, d) => d.count > acc.count ? d : acc, { count: 0, day: '—' }), [byDay])

    return (
        <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6 h-full space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Order timing</h3>
                    <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">When customers place orders. Use it to staff and time campaigns.</p>
                </div>
                {total > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total orders</p>
                        <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{total.toLocaleString()}</p>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
                    <div className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
                    <div className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
                </div>
            ) : total === 0 ? (
                <div className="py-12 text-center">
                    <Clock size={28} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                    <p className="text-[13px] font-bold text-[var(--text-primary)]">Not enough data yet</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">Order timing will appear here once orders start coming in.</p>
                </div>
            ) : (
                <>
                    {/* Peak callouts */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Callout
                            icon={<TrendingUp size={14} />}
                            label="Peak slot"
                            value={peak ? `${peak.day} ${peak.hour.toString().padStart(2, '0')}:00` : '—'}
                            sub={peak ? `${peak.count} order${peak.count === 1 ? '' : 's'}` : ''}
                            accent
                        />
                        <Callout
                            icon={<CalendarDays size={14} />}
                            label="Busiest day"
                            value={busiestDay.day}
                            sub={`${busiestDay.count} order${busiestDay.count === 1 ? '' : 's'}`}
                        />
                        <Callout
                            icon={<Clock size={14} />}
                            label="Busiest period"
                            value={busiestPeriod.label}
                            sub={`${busiestPeriod.range} · ${busiestPeriod.count} order${busiestPeriod.count === 1 ? '' : 's'}`}
                        />
                    </div>

                    {/* Two complementary charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">By day of week</p>
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={byDay} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(237,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                                            formatter={(v) => [`${v} order${v === 1 ? '' : 's'}`, 'Total']}
                                        />
                                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                            {byDay.map((d, i) => (
                                                <Cell key={i} fill={d.count === maxDay && maxDay > 0 ? '#ed0000' : 'rgba(237,0,0,0.25)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">By hour of day</p>
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={byHour} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0f2e53" stopOpacity={0.95} />
                                                <stop offset="100%" stopColor="#0f2e53" stopOpacity={0.35} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                                        <XAxis
                                            dataKey="hour"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }}
                                            ticks={[0, 6, 12, 18, 23]}
                                            tickFormatter={(h) => `${h.toString().padStart(2, '0')}h`}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(15,46,83,0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                                            formatter={(v) => [`${v} order${v === 1 ? '' : 's'}`, 'Total']}
                                            labelFormatter={(h) => `${h.toString().padStart(2, '0')}:00`}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {byHour.map((h, i) => (
                                                <Cell key={i} fill={h.count === maxHour && maxHour > 0 ? '#ed0000' : 'url(#hourGrad)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Period strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--divider)]">
                        {HOUR_BUCKETS.map(b => {
                            const v = byHour.filter(h => h.hour >= b.start && h.hour < b.end).reduce((s, h) => s + h.count, 0)
                            const pct = total > 0 ? Math.round((v / total) * 100) : 0
                            const isPeak = busiestPeriod.key === b.key && v > 0
                            return (
                                <div key={b.key} className={`p-3 rounded-xl border ${isPeak ? 'bg-[#ed0000]/5 border-[#ed0000]/30' : 'bg-[var(--bg-secondary)] border-transparent'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{b.label}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium">{b.range}</p>
                                    <p className={`text-[15px] font-bold tracking-tight mt-1 ${isPeak ? 'text-[#ed0000]' : 'text-[var(--text-primary)]'}`}>{v} <span className="text-[10px] font-bold text-[var(--text-muted)]">· {pct}%</span></p>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

const Callout = ({ icon, label, value, sub, accent }) => (
    <div className={`p-4 rounded-xl border ${accent ? 'bg-[#ed0000]/5 border-[#ed0000]/30' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
        <div className="flex items-center gap-2 mb-2">
            <span className={accent ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}>{icon}</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        </div>
        <p className={`text-[16px] font-bold tracking-tight ${accent ? 'text-[#ed0000]' : 'text-[var(--text-primary)]'}`}>{value}</p>
        {sub && <p className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
)

export default OrderTiming
