import React, { useState, useMemo } from 'react'
import { Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import { CustomDatePicker } from '../ui/shared_ui'
import { useStore } from '../../../context/StoreContext'

const OrdersTab = ({ onSelect, selectedId, externalSearchTerm, dateRange, setDateRange, onExport }) => {
    const { orders } = useStore()
    const [statusFilter, setStatusFilter] = useState('all')
    const [localSearch, setLocalSearch] = useState('')

    const filtered = useMemo(() => orders.filter(o => {
        const search = (externalSearchTerm || localSearch).toLowerCase()
        const matches = o.id.toLowerCase().includes(search) || o.buyerName.toLowerCase().includes(search)
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter
        return matches && matchesStatus
    }), [orders, externalSearchTerm, localSearch, statusFilter])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-[var(--text-primary)]">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Platform orders</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">History and status tracking for all digital transactions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onExport} className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm">
                        <Download size={18} />
                    </button>
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative max-w-sm w-full">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input 
                        type="text" 
                        placeholder="Search ID or name..." 
                        value={localSearch} 
                        onChange={(e) => setLocalSearch(e.target.value)} 
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000] shadow-sm transition-all" 
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['all', 'pending', 'paid', 'confirmed', 'shipped', 'delivered'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setStatusFilter(s)} 
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${statusFilter === s ? 'bg-black text-white px-7' : 'bg-[var(--bg-tertiary)] border border-[var(--divider)] text-[var(--text-muted)] px-5'}`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Order ID</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Customer</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Amount</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider)]">
                            {filtered.map(o => (
                                <tr 
                                    key={o.id} 
                                    onClick={() => onSelect(o)} 
                                    className={`group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors ${selectedId === o.id ? 'bg-[#ed0000]/5' : ''}`}
                                >
                                    <td className="px-6 py-5 text-[12px] font-bold text-[var(--text-primary)] tracking-tight">#{o.id.slice(-8)}</td>
                                    <td className="px-6 py-5 text-[13px] font-bold text-[var(--text-primary)]">{o.buyerName}</td>
                                    <td className="px-6 py-5 text-[13px] font-bold text-[#ed0000]">₦{o.amount.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-[11px] font-bold text-right text-[var(--text-muted)] uppercase tracking-tighter">{format(new Date(o.date), 'MMM dd, yyyy')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrdersTab
