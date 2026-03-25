import React, { useState } from 'react'
import { ChevronLeft, User, Calendar, Mail, Phone, Filter, ChevronDown } from 'lucide-react'

const CustomerStatsPage = ({ customer, onBack }) => {
    const [subTab, setSubTab] = useState('All Orders')
    
    if (!customer) return null;

    return (
        <div className="animate-in fade-in slide-in-from-right duration-500 bg-[var(--bg-primary)] h-full space-y-8 text-[var(--text-primary)]">
            <div className="flex items-center gap-4 py-2">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        onBack();
                    }} 
                    className="p-2 transition-colors text-[var(--text-primary)] hover:text-[#ed0000]"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold tracking-tight">Customer Orders</h2>
            </div>
            
            <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--divider)] p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold leading-tight">{customer.name}</h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">GUEST</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center justify-end gap-x-8 gap-y-3 text-[12px] font-bold text-[var(--text-muted)]">
                    <div className="flex items-center gap-2"><span>Completed Orders</span> <span className="text-[var(--text-primary)]">0</span></div>
                    <div className="flex items-center gap-2"><span>Ongoing Orders</span> <span className="text-[var(--text-primary)]">2</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Calendar size={14} /> <span>18 March, 2026</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Mail size={14} /> <span>{customer.email}</span></div>
                    <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-8 h-6"><Phone size={14} /> <span>{customer.phone || '09032626232'}</span></div>
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

            <div className="flex items-center justify-end gap-5 py-4">
                <button className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000] transition-colors">
                    <Filter size={14} />
                    <span>Filters</span>
                </button>
                <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-lg px-4 py-2 shadow-sm text-[12px] font-bold">
                    <span>Today</span>
                    <ChevronDown size={14} />
                </div>
                <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-lg px-4 py-2 shadow-sm text-[12px] font-bold">
                    <Calendar size={14} />
                    <span>25 Mar, 2026 - 25 Mar, 2026</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-32 opacity-50">
                <p className="text-[14px] font-bold text-[var(--text-muted)] tracking-tight">No orders found.</p>
            </div>
        </div>
    )
}

export default CustomerStatsPage
