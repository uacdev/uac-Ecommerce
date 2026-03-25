import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Download, ArrowLeft, MoreVertical, Edit3, Trash2, Clock } from 'lucide-react'
import { useStore } from '../../../context/StoreContext'

const ProductsTab = ({ searchTerm, onAdd, onEdit, onDelete, onToggleStock, categoryFilter, onBack, onExport }) => {
    const { products } = useStore()
    const [openMenuId, setOpenMenuId] = useState(null)
    const [localSearch, setLocalSearch] = useState('')
    
    const filtered = useMemo(() => products.filter(p => {
        const s = (searchTerm || localSearch).toLowerCase()
        const m = p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
        return m && (!categoryFilter || p.category === categoryFilter)
    }), [products, searchTerm, localSearch, categoryFilter])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {categoryFilter && (
                        <button onClick={onBack} className="p-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{categoryFilter ? `Inventory in ${categoryFilter}` : 'Store Inventory'}</h2>
                        <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Detailed list of all digital and physical product entries.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs hidden sm:block">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input 
                            type="text" 
                            placeholder="Find products..." 
                            value={localSearch} 
                            onChange={(e) => setLocalSearch(e.target.value)} 
                            className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] focus:border-[#ed0000]/50 shadow-sm transition-all" 
                        />
                    </div>
                    <button onClick={onExport} className="p-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm">
                        <Download size={18} />
                    </button>
                    <button onClick={onAdd} className="bg-black text-white px-7 py-3.5 rounded-2xl text-[13px] font-bold flex items-center gap-2 shadow-2xl hover:bg-[#ed0000] transition-colors">
                        <Plus size={18} /><span>Add product</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-visible">
                <div className="overflow-x-auto overflow-visible">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Entry info</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Price</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider)]">
                            {filtered.map(p => (
                                <tr key={p.id} className="group hover:bg-[var(--bg-secondary)] transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-5">
                                            <img src={p.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                                            <div>
                                                <p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">{p.name}</p>
                                                <p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 tracking-tighter">{p.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-[14px] text-[var(--text-primary)]">₦{p.price.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-right relative overflow-visible">
                                        <div className="flex justify-end relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === p.id ? null : p.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {openMenuId === p.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                                                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl shadow-xl z-50 overflow-hidden"
                                                        >
                                                            <button onClick={() => { onEdit(p); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all border-b border-[var(--divider)]">
                                                                <Edit3 size={14} className="text-blue-500" />
                                                                Edit product
                                                            </button>
                                                            <button onClick={() => { onToggleStock(p); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all border-b border-[var(--divider)]">
                                                                <Clock size={14} className={p.status === 'out_of_stock' ? 'text-emerald-500' : 'text-amber-500'} />
                                                                {p.status === 'out_of_stock' ? 'Set as in stock' : 'Mark out of stock'}
                                                            </button>
                                                            <button onClick={() => { onDelete(p); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[#ed0000] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                                                                <Trash2 size={14} />
                                                                Delete entry
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ProductsTab
