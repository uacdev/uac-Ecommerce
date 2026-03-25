import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'

const CategoriesTab = ({ onViewCategory, onAddCategory, onEditCategory }) => {
    const [catSearch, setCatSearch] = useState('')
    
    const cats = [
        { name: 'Gala', count: 12, sales: '₦2.4M', color: 'bg-red-50 text-[#ed0000]' }, 
        { name: 'Supreme', count: 8, sales: '₦1.8M', color: 'bg-blue-50 text-blue-600' }, 
        { name: 'Swan', count: 5, sales: '₦980k', color: 'bg-emerald-50 text-emerald-600' }, 
        { name: 'Funtime', count: 14, sales: '₦1.2M', color: 'bg-yellow-50 text-yellow-600' }
    ]
    
    const filtered = cats.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    
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
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)]">Name</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-[var(--text-muted)] text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                        {filtered.map((cat) => (
                            <tr key={cat.name} onClick={() => onViewCategory(cat.name)} className="group hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${cat.color} shadow-sm group-hover:scale-110 transition-all`}>
                                            {cat.name.charAt(0)}
                                        </div>
                                        <span className="text-[14px] font-bold text-[var(--text-primary)]">{cat.name} Series</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-emerald-600">{cat.sales}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CategoriesTab
