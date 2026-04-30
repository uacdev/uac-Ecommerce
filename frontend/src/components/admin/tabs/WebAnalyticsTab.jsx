import { useEffect, useMemo, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Globe2, Users, Eye, TrendingUp, Download } from 'lucide-react'
import { statsApi } from '../../../api/client'
import KpiCard from '../KpiCard'

const SOURCE_COLORS = {
    instagram: '#E1306C',
    twitter:   '#1DA1F2',
    facebook:  '#1877F2',
    whatsapp:  '#25D366',
    tiktok:    '#000000',
    youtube:   '#FF0000',
    google:    '#4285F4',
    bing:      '#008373',
    email:     '#F59E0B',
    direct:    '#64748B',
    other:     '#94A3B8'
}

const fmtDay = (iso) => {
    // ISO yyyy-mm-dd → "Apr 30"
    const [, m, d] = iso.split('-')
    const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m, 10) - 1]
    return `${monthShort} ${parseInt(d, 10)}`
}

const WebAnalyticsTab = ({ onExport }) => {
    const [days, setDays] = useState(30)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        statsApi.getWebAnalytics(days)
            .then(res => { if (!cancelled && res.data?.success) setData(res.data.data) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [days])

    const totals = data?.totals || { total: 0, uniqueVisitors: 0 }
    const byCountry = data?.byCountry || []
    const bySource = data?.bySource || []
    const byPath = data?.byPath || []
    const byNigeriaState = data?.byNigeriaState || []
    const daily = data?.daily || []

    const dailyChart = useMemo(() => daily.map(d => ({ name: fmtDay(d.date), count: d.count })), [daily])
    const sourceChart = useMemo(() => bySource.map(s => ({ name: s.source, value: s.count })), [bySource])

    // Top country/source for the headline KPI cards
    const topCountry = byCountry[0]
    const topSource = bySource.find(s => s.source !== 'direct') || bySource[0]

    const handleExport = () => {
        if (!onExport || !data) return
        const rows = []
        rows.push({ section: 'Totals', key: 'total_hits', value: totals.total })
        rows.push({ section: 'Totals', key: 'unique_visitors', value: totals.uniqueVisitors })
        rows.push({ section: 'Totals', key: 'window_days', value: days })
        byCountry.forEach(c => rows.push({ section: 'By country', key: c.name, value: c.count }))
        bySource.forEach(s => rows.push({ section: 'By source', key: s.source, value: s.count }))
        byNigeriaState.forEach(s => rows.push({ section: 'Nigeria region', key: s.region, value: s.count }))
        byPath.forEach(p => rows.push({ section: 'Top page', key: p.path, value: p.count }))
        daily.forEach(d => rows.push({ section: 'Daily', key: d.date, value: d.count }))
        onExport(rows, `web_analytics_${days}d`)
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Web analytics</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Storefront traffic, country breakdown, and traffic sources.</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">
                        {[7, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${days === d ? 'bg-[var(--bg-tertiary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={loading || !data}
                        className="px-4 py-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm disabled:opacity-50 flex items-center gap-2 text-[12px] font-bold"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total hits" value={totals.total.toLocaleString()} trend={`${days}-day window`} isPositive />
                <KpiCard title="Unique visitors" value={totals.uniqueVisitors.toLocaleString()} trend="One per browser" isPositive />
                <KpiCard
                    title="Top country"
                    value={topCountry ? topCountry.name : '—'}
                    trend={topCountry ? `${topCountry.count.toLocaleString()} hits` : 'No data yet'}
                    isPositive
                />
                <KpiCard
                    title="Top source"
                    value={topSource ? topSource.source : '—'}
                    trend={topSource ? `${topSource.count.toLocaleString()} hits` : 'No data yet'}
                    isPositive
                />
            </div>

            {/* DAILY HITS TIMELINE */}
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Daily hits</h3>
                        <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Page views per day over the selected window.</p>
                    </div>
                    <Eye size={18} className="text-[var(--text-muted)]" />
                </div>
                <div className="h-[260px] w-full">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading…</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
                                <Line type="monotone" dataKey="count" stroke="#ed0000" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* COUNTRY + SOURCE — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By country */}
                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Visits by country</h3>
                            <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Top 12 — derived from visitor IP.</p>
                        </div>
                        <Globe2 size={18} className="text-[var(--text-muted)]" />
                    </div>
                    {loading ? (
                        <div className="h-[280px] flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading…</div>
                    ) : byCountry.length === 0 ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-center px-6">
                            <p className="text-[13px] font-bold text-[var(--text-primary)]">No country data yet</p>
                            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1.5 max-w-xs">Once visitors land on the live site, their country will appear here.</p>
                        </div>
                    ) : (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byCountry} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--divider)" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-primary)' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }} />
                                    <Bar dataKey="count" fill="#ed0000" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* By source */}
                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Traffic sources</h3>
                            <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Where visitors arrived from.</p>
                        </div>
                        <TrendingUp size={18} className="text-[var(--text-muted)]" />
                    </div>
                    {loading ? (
                        <div className="h-[280px] flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading…</div>
                    ) : sourceChart.length === 0 ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-center px-6">
                            <p className="text-[13px] font-bold text-[var(--text-primary)]">No source data yet</p>
                            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1.5">Sources appear once visitors arrive from referring sites.</p>
                        </div>
                    ) : (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sourceChart} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3} stroke="none">
                                        {sourceChart.map((entry, i) => (
                                            <Cell key={i} fill={SOURCE_COLORS[entry.name] || '#94A3B8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }} />
                                    <Legend verticalAlign="bottom" height={36} iconSize={10} formatter={(v) => <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* TOP PAGES + NIGERIA REGIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Top pages</h3>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Top 10</span>
                    </div>
                    {byPath.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-10 text-center">No page data yet.</p>
                    ) : (
                        <ul className="divide-y divide-[var(--divider)]">
                            {byPath.map(p => (
                                <li key={p.path} className="flex items-center justify-between py-3">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] truncate mr-4">{p.path || '/'}</span>
                                    <span className="text-[12px] font-bold text-[#ed0000] shrink-0">{p.count.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Visits by region (Nigeria)</h3>
                            <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">For visitors located in Nigeria.</p>
                        </div>
                        <Users size={18} className="text-[var(--text-muted)]" />
                    </div>
                    {byNigeriaState.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-10 text-center">No region data yet.</p>
                    ) : (
                        <ul className="divide-y divide-[var(--divider)]">
                            {byNigeriaState.map(r => (
                                <li key={r.region} className="flex items-center justify-between py-3">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)]">{r.region}</span>
                                    <span className="text-[12px] font-bold text-[#ed0000]">{r.count.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WebAnalyticsTab
