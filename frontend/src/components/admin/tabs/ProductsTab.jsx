import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Download, ArrowLeft, MoreVertical, Edit3, Trash2, LayoutGrid, List as ListIcon } from 'lucide-react'
import { useStore } from '../../../context/StoreContext'
import { productApi } from '../../../api/client'

const VIEW_KEY = 'uac_products_view' // 'grid' | 'list'

const normalizePackagingLabel = (value = '', product = {}) => {
    if (!value) return ''

    const text = String(value).trim()
    const stripped = text
        .replace(/\s*-\s*\d+(?:\.\d+)?\s*(?:cartons?|pieces?|packs?|piece|pack)\b/gi, '')
        .replace(/\s*\(.*\)\s*$/gi, '')
        .trim()

    return stripped || text
}

const ProductsTab = ({ searchTerm, onAdd, onEdit, onDelete, onToggleStock, onSelect, categoryFilter, onBack, onExport }) => {
    const { products } = useStore()
    const [openMenuId, setOpenMenuId] = useState(null)
    const [localSearch, setLocalSearch] = useState('')
    const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || 'grid')
    const [salesById, setSalesById] = useState({})

    useEffect(() => { localStorage.setItem(VIEW_KEY, view) }, [view])

    // Pull per-product sales summary so cards can show real "Sold" numbers.
    useEffect(() => {
        let cancelled = false
        productApi.salesSummary()
            .then(res => { if (!cancelled && res.data?.success) setSalesById(res.data.data || {}) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    const filtered = useMemo(() => products.filter(p => {
        const s = (searchTerm || localSearch).toLowerCase()
        const m = p.name.toLowerCase().includes(s) || (p.category || '').toLowerCase().includes(s)
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

                    {/* VIEW TOGGLE */}
                    <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--divider)]">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-[var(--bg-tertiary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            title="Grid view"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-[var(--bg-tertiary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            title="List view"
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>

                    <button onClick={onExport} className="px-4 py-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm flex items-center gap-2 text-[12px] font-bold">
                        <Download size={16} /> Export
                    </button>
                    <button onClick={onAdd} className="bg-black text-white px-7 py-3.5 rounded-2xl text-[13px] font-bold flex items-center gap-2 shadow-2xl hover:bg-[#ed0000] transition-colors">
                        <Plus size={18} /><span>Add product</span>
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl py-16 text-center">
                    <p className="text-[14px] font-bold text-[var(--text-primary)]">No products match these filters.</p>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(p => {
                        const sales = salesById[p.id] || { soldUnits: 0, revenue: 0 }
                        const isMenuOpen = openMenuId === p.id
                        return (
                            <div
                                key={p.id}
                                onClick={() => onSelect?.(p)}
                                className="group bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-visible relative cursor-pointer"
                            >
                                {/* Action menu (top-right) — stopPropagation so menu clicks don't trigger card open */}
                                <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : p.id) }}
                                        className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--divider)] shadow-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical size={15} />
                                    </button>
                                    <ProductMenu
                                        open={isMenuOpen}
                                        onClose={() => setOpenMenuId(null)}
                                        product={p}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onToggleStock={onToggleStock}
                                    />
                                </div>

                                {/* Status badge — auto from stockCount */}
                                {p.status === 'out_of_stock' ? (
                                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#ed0000] text-white text-[9px] font-bold uppercase tracking-widest">
                                        Out of stock
                                    </div>
                                ) : (p.stockCount ?? 0) <= 5 && (p.stockCount ?? 0) > 0 ? (
                                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest">
                                        Low · {p.stockCount} left
                                    </div>
                                ) : null}

                                {/* Image */}
                                <div className="aspect-square bg-[var(--bg-secondary)] m-4 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No image</span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="px-5 pb-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{p.brand || p.category}</p>
                                    <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-1 leading-tight line-clamp-2 min-h-[36px]">{p.name}</h3>

                                    <div className="flex items-baseline justify-between mt-3">
                                        <span className="text-xl font-bold text-[#ed0000] tracking-tight">₦{(p.price || 0).toLocaleString()}</span>
                                        {p.packaging && <span className="text-[10px] text-[var(--text-muted)] font-medium truncate max-w-[55%]">{normalizePackagingLabel(p.packaging, p)}</span>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--divider)]">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">In stock</p>
                                            <p className={`text-[14px] font-bold mt-0.5 ${(p.stockCount ?? 0) === 0 ? 'text-[#ed0000]' : (p.stockCount ?? 0) <= 5 ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>{(p.stockCount ?? 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Sold</p>
                                            <p className="text-[14px] font-bold text-[var(--text-primary)] mt-0.5">{sales.soldUnits.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Revenue</p>
                                            <p className="text-[14px] font-bold text-[var(--text-primary)] mt-0.5">₦{sales.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                // LIST VIEW (existing table-style)
                <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-visible">
                    <div className="overflow-x-auto overflow-visible">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                                <tr>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Entry info</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Price</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">In stock</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Sold</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--divider)]">
                                {filtered.map(p => {
                                    const sales = salesById[p.id] || { soldUnits: 0, revenue: 0 }
                                    const isMenuOpen = openMenuId === p.id
                                    return (
                                        <tr key={p.id} onClick={() => onSelect?.(p)} className="group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-[var(--divider)] shrink-0 shadow-sm">
                                                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">{p.name}</p>
                                                        <p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 tracking-tighter">
                                                            {p.brand || p.category}
                                                            {p.status === 'out_of_stock' && <span className="ml-2 text-[#ed0000]">· Out of stock</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-[14px] text-[var(--text-primary)]">₦{p.price.toLocaleString()}</td>
                                            <td className={`px-6 py-5 text-[13px] font-bold ${(p.stockCount ?? 0) === 0 ? 'text-[#ed0000]' : (p.stockCount ?? 0) <= 5 ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>{(p.stockCount ?? 0).toLocaleString()}</td>
                                            <td className="px-6 py-5 text-[13px] font-bold text-[var(--text-primary)]">{sales.soldUnits.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right relative overflow-visible" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end relative">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : p.id) }}
                                                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    <ProductMenu
                                                        open={isMenuOpen}
                                                        onClose={() => setOpenMenuId(null)}
                                                        product={p}
                                                        onEdit={onEdit}
                                                        onDelete={onDelete}
                                                        onToggleStock={onToggleStock}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

const ProductMenu = ({ open, onClose, product, onEdit, onDelete }) => (
    <AnimatePresence>
        {open && (
            <>
                <div className="fixed inset-0 z-40" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl shadow-xl z-50 overflow-hidden"
                >
                    <button onClick={() => { onEdit(product); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all border-b border-[var(--divider)]">
                        <Edit3 size={14} className="text-blue-500" /> Edit product
                    </button>
                    <button onClick={() => { onDelete(product); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[#ed0000] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        <Trash2 size={14} /> Delete entry
                    </button>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

export default ProductsTab
