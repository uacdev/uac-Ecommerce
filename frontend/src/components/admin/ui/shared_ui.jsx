import React from 'react'
import { motion } from 'framer-motion'
import { Search, ListFilter, Calendar, ChevronDown, Download, Plus, ArrowLeft, MoreVertical, Edit3, Trash2, Clock, User, Mail, Phone, Filter } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'

export const StatusPill = ({ status }) => {
    let style = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-100";
    if (status === 'paid' || status === 'confirmed' || status === 'delivered') style = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-emerald-100";
    if (status === 'cancelled' || status === 'failed') style = "bg-red-50 text-[#ed0000] dark:bg-red-950/20 border-red-100";
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border capitalize ${style}`}>{status}</span>
}

export const SettingInput = ({ label, value, name, onChange, type = 'text', placeholder = '...' }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight leading-none ml-1">{label}</label>
        <input name={name} onChange={onChange} type={type} value={value} placeholder={placeholder} className="w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl px-6 py-4.5 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 shadow-sm transition-all text-[var(--text-primary)]" />
    </div>
)

export const InsightRow = ({ label, value, icon, color }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-105 transition-transform`}>{icon}</div><span className="text-[13px] font-bold text-[var(--text-muted)]">{label}</span></div>
        <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">{value}</span>
    </div>
)

export const CustomerRow = ({ name, img, spend }) => (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-secondary)]/50 p-2 rounded-xl transition-all">
        <div className="flex items-center gap-3"><img src={img} className="w-10 h-10 rounded-full border border-[var(--divider)] shadow-sm" alt="" /><p className="text-[12px] font-bold text-[var(--text-primary)] leading-none tracking-tight">{name}</p></div>
        <span className="text-[13px] font-bold text-emerald-600 tracking-tighter">{spend}</span>
    </div>
)

export const CustomDatePicker = ({ dateRange, setDateRange }) => (
    <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl px-4 py-2 shadow-sm font-['Sen',sans-serif] min-w-[220px]">
        <Calendar size={14} className="text-[var(--text-muted)] shrink-0" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-[85px]">
                <DatePicker 
                    selected={dateRange.start} 
                    onChange={(date) => setDateRange({ ...dateRange, start: date })} 
                    placeholderText="Start" 
                    className="w-full bg-transparent outline-none text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" 
                />
            </div>
            <span className="text-[var(--text-muted)] opacity-50 font-bold">/</span>
            <div className="w-[85px]">
                <DatePicker 
                    selected={dateRange.end} 
                    onChange={(date) => setDateRange({ ...dateRange, end: date })} 
                    placeholderText="End" 
                    className="w-full bg-transparent outline-none text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" 
                />
            </div>
        </div>
    </div>
)

export const NotificationItem = ({ icon, title, time, desc, type }) => {
    let color = "text-amber-500 bg-amber-50 dark:bg-amber-950/20";
    if (type === 'success') color = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
    if (type === 'info') color = "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
    if (type === 'alert') color = "text-[#ed0000] bg-red-50 dark:bg-red-950/20";

    return (
        <div className="flex gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 transition-all cursor-pointer border-b border-[var(--divider)] last:border-0 group">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-105 transition-transform`}>{icon}</div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h5 className="text-[12px] font-bold text-[var(--text-primary)] leading-tight">{title}</h5>
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-tight">{time}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
