import React, { useState, useEffect } from 'react'
import { Download, User } from 'lucide-react'
import { format } from 'date-fns'
import { CustomDatePicker } from '../ui/shared_ui'
import { statsApi } from '../../../api/client'

const CustomersTab = ({ searchTerm, dateRange, setDateRange, onViewStats }) => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true)
                const res = await statsApi.getCustomers()
                if (res.data.success) {
                    setCustomers(res.data.data)
                }
            } catch (err) {
                console.error("Failed to fetch customers", err)
            } finally {
                setLoading(false)
            }
        }
        fetchCustomers()
    }, [])

    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Customer base</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Directory of registered shoppers and history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm">
                        <Download size={18} />
                    </button>
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-[var(--text-primary)]">
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] mb-2 font-['Sen',sans-serif]">Total shoppers</p>
                    <h4 className="text-2xl font-bold tracking-tight">2,482</h4>
                </div>
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] mb-2 font-['Sen',sans-serif]">Active now</p>
                    <h4 className="text-2xl font-bold tracking-tight text-emerald-500">148</h4>
                </div>
                <div className="p-6 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] mb-2 font-['Sen',sans-serif]">New this week</p>
                    <h4 className="text-2xl font-bold tracking-tight text-[#ed0000]">32</h4>
                </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden text-[var(--text-primary)]">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                        <tr>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Customer info</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Joined</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Orders</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">
                                    Loading customers...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <tr key={c.id} onClick={() => onViewStats(c)} className="group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center font-bold text-[10px] text-[var(--text-muted)] border border-[var(--divider)]">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold leading-tight">{c.name}</p>
                                                <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[13px] font-medium text-[var(--text-muted)]">{format(new Date(c.joinDate), 'MMM dd, yyyy')}</td>
                                    <td className="px-6 py-5 text-right font-bold text-[13px] text-[#ed0000]">{c.orders}</td>
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
