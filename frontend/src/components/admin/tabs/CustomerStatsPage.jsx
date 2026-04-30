import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, User, Calendar, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { statsApi } from '../../../api/client'

const ONGOING = ['pending', 'paid', 'confirmed', 'shipped']
const COMPLETED = ['delivered', 'completed']

const STATUS_COLOR = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    paid: 'bg-blue-50 text-blue-600 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-violet-50 text-violet-600 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
}

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const CustomerStatsPage = ({ customer, onBack }) => {
    const [subTab, setSubTab] = useState('All Orders')
    const [data, setData] = useState({ summary: null, orders: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!customer?.email) return
        let cancelled = false
        setLoading(true); setError('')
        statsApi.getCustomerOrders(customer.email)
            .then(res => { if (!cancelled && res.data?.success) setData(res.data.data) })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || err.message || 'Could not load orders') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [customer?.email])

    const visibleOrders = useMemo(() => {
        if (subTab === 'Ongoing Orders') return data.orders.filter(o => ONGOING.includes(o.status))
        if (subTab === 'Completed Orders') return data.orders.filter(o => COMPLETED.includes(o.status))
        return data.orders
    }, [subTab, data.orders])

    if (!customer) return null

    const summary = data.summary || {}
    const displayName = summary.name || customer.name
    const displayPhone = summary.phone || customer.phone || '—'
    const joinDate = summary.joinDate || customer.joinDate
    const lastOrderDate = summary.lastOrderDate || customer.lastOrderDate

    return (
        <div className="animate-in fade-in slide-in-from-right duration-500 bg-[var(--bg-primary)] h-full space-y-8 text-[var(--text-primary)]">
            <div className="flex items-center gap-4 py-2">
                <button
                    onClick={(e) => { e.preventDefault(); onBack() }}
                    className="p-2 transition-colors text-[var(--text-primary)] hover:text-[#ed0000]"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold tracking-tight">Customer overview</h2>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--divider)] p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold leading-tight">{displayName}</h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                            {summary.totalOrders > 1 ? 'Returning customer' : 'New customer'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center justify-end gap-x-8 gap-y-3 text-[12px] font-bold text-[var(--text-muted)]">
                    <div className="flex items-center gap-2"><span>Completed</span> <span className="text-[var(--text-primary)]">{summary.completedOrders ?? 0}</span></div>
                    <div className="flex items-center gap-2"><span>Ongoing</span> <span className="text-[var(--text-primary)]">{summary.ongoingOrders ?? 0}</span></div>
                    <div className="flex items-center gap-2"><span>Total spend</span> <span className="text-[#ed0000]">{fmt(summary.totalSpend)}</span></div>
                    {joinDate && <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Calendar size={14} /> <span>{format(new Date(joinDate), 'd MMM, yyyy')}</span></div>}
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Mail size={14} /> <span className="truncate max-w-[180px]">{customer.email}</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Phone size={14} /> <span>{displayPhone}</span></div>
                </div>
            </div>

            <div className="border-b border-[var(--divider)] flex gap-12 mt-4">
                {['All Orders', 'Ongoing Orders', 'Completed Orders'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className={`pb-4 text-[13px] font-bold transition-all relative ${subTab === tab ? 'text-[#ed0000] border-b-2 border-[#ed0000]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[12px] font-bold">{error}</div>
            )}

            {loading ? (
                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl overflow-hidden">
                    <div className="bg-[var(--bg-secondary)] px-6 py-4 grid grid-cols-5 gap-6">
                        {[0,1,2,3,4].map(i => <div key={i} className="h-3 w-20 bg-[var(--bg-secondary)] rounded animate-pulse opacity-60" />)}
                    </div>
                    <div className="divide-y divide-[var(--divider)]">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="px-6 py-4 grid grid-cols-5 gap-6 items-center">
                                <div className="h-3 w-28 bg-[var(--bg-secondary)] rounded animate-pulse" />
                                <div className="h-3 w-16 bg-[var(--bg-secondary)] rounded animate-pulse" />
                                <div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" />
                                <div className="h-3 w-20 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" />
                                <div className="h-5 w-20 bg-[var(--bg-secondary)] rounded-full animate-pulse ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-60">
                    <p className="text-[14px] font-bold text-[var(--text-muted)] tracking-tight">No orders in this view.</p>
                    {lastOrderDate && <p className="text-[11px] font-medium text-[var(--text-muted)] mt-2">Last activity: {format(new Date(lastOrderDate), 'd MMM, yyyy')}</p>}
                </div>
            ) : (
                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">Reference</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">Items</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)]">Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)] text-right">Amount</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider)]">
                            {visibleOrders.map(o => (
                                <tr key={o.id || o._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="px-6 py-4 text-[12px] font-bold text-[var(--text-primary)]">{o.reference || `#${(o.id || o._id || '').slice(-8)}`}</td>
                                    <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">
                                        {(o.items || []).reduce((n, it) => n + (it.quantity || 1), 0)} units
                                    </td>
                                    <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">{format(new Date(o.date), 'MMM dd, yyyy')}</td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-right text-[var(--text-primary)]">{fmt(o.amount)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR[o.status] || STATUS_COLOR.pending}`}>
                                            {(o.status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default CustomerStatsPage
