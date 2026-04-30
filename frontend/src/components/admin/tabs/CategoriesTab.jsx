import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Edit3, Trash2, Package, ShoppingBag, ChevronRight } from 'lucide-react'
import { useStore } from '../../../context/StoreContext'
import { productApi } from '../../../api/client'

const fmtNgn = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const CategoriesTab = ({ onViewCategory, onAddCategory, onEditCategory }) => {
    const { businessSegments, categoriesLoading, removeCategory, products } = useStore()
    const [catSearch, setCatSearch] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [salesById, setSalesById] = useState({})

    useEffect(() => {
        let cancelled = false
        productApi.salesSummary()
            .then(res => { if (!cancelled && res.data?.success) setSalesById(res.data.data || {}) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    // Aggregate per category: count products + units sold + revenue
    const statsByCategory = useMemo(() => {
        const map = new Map()
        products.forEach(p => {
            const sales = salesById[p.id] || { soldUnits: 0, revenue: 0 }
            const cur = map.get(p.category) || { productCount: 0, soldUnits: 0, revenue: 0 }
            cur.productCount += 1
            cur.soldUnits += sales.soldUnits || 0
            cur.revenue += sales.revenue || 0
            map.set(p.category, cur)
        })
        return map
    }, [products, salesById])

    const filtered = businessSegments.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))

    const handleDelete = async (e, cat) => {
        e.stopPropagation()
        if (confirmDelete?._id === cat._id) {
            await removeCategory(cat._id)
            setConfirmDelete(null)
        } else {
            setConfirmDelete(cat)
            setTimeout(() => setConfirmDelete(c => (c?._id === cat._id ? null : c)), 3000)
        }
    }
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-[var(--text-primary)]">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Product Categories</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Consolidated list of all business segments.</p>
                </div>
                <button onClick={onAddCategory} className="bg-black text-white px-7 py-3.5 rounded-2xl text-[12px] font-bold flex items-center gap-2 shadow-2xl hover:bg-[#ed0000] transition-colors">
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                    type="text" 
                    placeholder="Search category series..." 
                    value={catSearch} 
                    onChange={(e) => setCatSearch(e.target.value)} 
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none text-[var(--text-primary)] shadow-sm focus:border-[#ed0000]/50 transition-all font-['Sen',sans-serif]" 
                />
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-secondary)] border-b border-[var(--divider)]">
                        <tr>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Category</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Parent</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Products</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Units sold</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Revenue</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                        {categoriesLoading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i}>
                                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] animate-pulse" /><div className="flex-1 space-y-2"><div className="h-3 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" /><div className="h-2 w-48 bg-[var(--bg-secondary)] rounded animate-pulse" /></div></div></td>
                                    <td className="px-6 py-5"><div className="h-3 w-16 bg-[var(--bg-secondary)] rounded animate-pulse" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-8 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-10 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                    <td className="px-6 py-5"><div className="h-3 w-20 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                    <td className="px-6 py-5"><div className="h-6 w-16 bg-[var(--bg-secondary)] rounded animate-pulse ml-auto" /></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">No categories yet. Create your first one.</td></tr>
                        ) : filtered.map((cat) => {
                            const s = statsByCategory.get(cat.name) || { productCount: 0, soldUnits: 0, revenue: 0 }
                            return (
                                <tr key={cat._id || cat.name} onClick={() => onViewCategory(cat)} className="group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${cat.color || 'bg-indigo-50 text-indigo-600'} shadow-sm group-hover:scale-110 transition-all overflow-hidden shrink-0`}>
                                                {cat.coverImage ? <img src={cat.coverImage} alt="" className="w-full h-full object-cover" /> : cat.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[14px] font-bold text-[var(--text-primary)] block">{cat.name}</span>
                                                {cat.abstract && <span className="text-[11px] text-[var(--text-muted)] font-medium line-clamp-1">{cat.abstract}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {cat.parent ? (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--divider)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                                {cat.parent}
                                            </span>
                                        ) : <span className="text-[11px] text-[var(--text-muted)] font-medium">Top level</span>}
                                    </td>
                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-[var(--text-primary)]">{s.productCount}</td>
                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-[var(--text-primary)]">{s.soldUnits.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-right text-[13px] font-bold text-[#ed0000]">{fmtNgn(s.revenue)}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => onEditCategory(cat)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-blue-500 transition-all" title="Edit">
                                                <Edit3 size={15} />
                                            </button>
                                            <button onClick={(e) => handleDelete(e, cat)} className={`p-2 rounded-lg transition-all ${confirmDelete?._id === cat._id ? 'bg-[#ed0000] text-white' : 'hover:bg-red-50 text-[#ed0000]'}`} title={confirmDelete?._id === cat._id ? 'Click again to confirm' : 'Delete'}>
                                                <Trash2 size={15} />
                                            </button>
                                            <ChevronRight size={15} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CategoriesTab
