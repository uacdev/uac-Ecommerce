import { useState, useEffect, useMemo } from 'react'
import { Download, Search, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { CustomDatePicker } from '../ui/shared_ui'
import { statsApi } from '../../../api/client'

const fmtNgn = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const CustomersTab = ({ searchTerm, dateRange, setDateRange, onViewStats, onExport }) => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [localSearch, setLocalSearch] = useState('')

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        statsApi.getCustomers()
            .then(res => { if (!cancelled && res.data?.success) setCustomers(res.data.data || []) })
            .catch(err => console.error("Failed to fetch customers", err))
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const search = (searchTerm || localSearch).trim().toLowerCase()
    const filtered = useMemo(() => customers.filter(c => {
        if (!search) return true
        return (c.name || '').toLowerCase().includes(search)
            || (c.email || '').toLowerCase().includes(search)
            || (c.phone || '').toLowerCase().includes(search)
    }), [customers, search])

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    const handleExport = () => {
        const rows = filtered.map(c => ({
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            orders: c.orders || 0,
            totalSpend: c.totalSpend || 0,
            joinDate: c.joinDate || '',
            lastOrderDate: c.lastOrderDate || ''
        }))
        if (onExport) onExport(rows, 'customers_export')
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Customer base</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">
                        {filtered.length === customers.length
                            ? `${customers.length} customer${customers.length === 1 ? '' : 's'} on the platform.`
                            : `${filtered.length} of ${customers.length} match your search.`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={filtered.length === 0}
                        className="px-4 py-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[12px] font-bold"
                        title="Export current view as CSV"
                    >
                        <Download size={16} /> Export
                    </button>
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </div>

            {/* Local search + summary cards */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative max-w-sm w-full">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone…"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000] shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[var(--text-primary)]">
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total shoppers</p>
                    <h4 className="text-2xl font-bold tracking-tight mt-1">{customers.length.toLocaleString()}</h4>
                </div>
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Lifetime revenue</p>
                    <h4 className="text-2xl font-bold tracking-tight text-emerald-500 mt-1">
                        {fmtNgn(customers.reduce((s, c) => s + (c.totalSpend || 0), 0))}
                    </h4>
                </div>
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">New this week</p>
                    <h4 className="text-2xl font-bold tracking-tight text-[#ed0000] mt-1">
                        {customers.filter(c => c.joinDate && new Date(c.joinDate).getTime() >= oneWeekAgo).length}
                    </h4>
                </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden text-[var(--text-primary)]">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                        <tr>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Customer</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Phone</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Joined</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Last order</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Orders</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Total spend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse" /><div className="space-y-2"><div className="h-3 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" /><div className="h-2 w-44 bg-[var(--bg-secondary)] rounded animate-pulse" /></div></div></td>
                                    <td className="px-6 py-5"><div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-24 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-8 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-16 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">
                                    {customers.length === 0 ? 'No customers yet.' : 'No customers match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <tr key={c.id || c.email} onClick={() => onViewStats(c)} className="group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center font-bold text-[10px] text-[var(--text-muted)] border border-[var(--divider)]">
                                                {(c.name || '?').charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[14px] font-bold leading-tight truncate">{c.name}</p>
                                                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 flex items-center gap-1.5 truncate">
                                                    <Mail size={10} /> {c.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[12px] font-medium text-[var(--text-muted)]">
                                        {c.phone ? (
                                            <span className="inline-flex items-center gap-1.5"><Phone size={11} /> {c.phone}</span>
                                        ) : <span className="opacity-50">—</span>}
                                    </td>
                                    <td className="px-6 py-5 text-[12px] font-medium text-[var(--text-muted)]">
                                        {c.joinDate ? format(new Date(c.joinDate), 'MMM dd, yyyy') : '—'}
                                    </td>
                                    <td className="px-6 py-5 text-[12px] font-medium text-[var(--text-muted)]">
                                        {c.lastOrderDate ? format(new Date(c.lastOrderDate), 'MMM dd, yyyy') : '—'}
                                    </td>
                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-[var(--text-primary)]">{c.orders || 0}</td>
                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-[#ed0000]">{fmtNgn(c.totalSpend)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomersTab
