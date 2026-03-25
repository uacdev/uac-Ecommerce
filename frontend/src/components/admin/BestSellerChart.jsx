import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'

const BestSellerChart = ({ products }) => {
    // Sort products by sales (mocked or from store)
    const sorted = [...products]
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 5)

    const maxSales = Math.max(...sorted.map(p => p.sales || 1), 1)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-8 shadow-2xl transition-all duration-500 overflow-hidden relative group"
            style={{ 
                background: 'var(--bg-primary)', 
                border: '1px solid var(--divider)',
                boxShadow: 'var(--card-shadow)'
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-[22px] font-black font-heading tracking-tight mb-1 text-[var(--text-primary)]">
                        Best Sellers Performance
                    </h3>
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-red)]" />
                        SKU Sales Volume
                    </p>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--brand-red)]/5 text-[var(--brand-red)] hover:bg-[var(--brand-red)] transition-all cursor-pointer">
                    <ArrowUpRight size={20} className="group-hover:text-white" />
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {sorted.map((p, i) => (
                    <div key={p.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--divider)] flex items-center justify-center p-1.5 group-hover:border-[var(--brand-red)]/20 transition-all">
                                    <img src={p.image} className="w-full h-full object-contain rounded-md" alt="" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{p.name}</p>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{p.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-[var(--text-primary)]">{p.sales || 0}</p>
                                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500">
                                    <TrendingUp size={10} />
                                    +12.4%
                                </div>
                            </div>
                        </div>

                        {/* Bar */}
                        <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--divider)] shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((p.sales || 0) / maxSales) * 100}%` }}
                                transition={{ duration: 1.2, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                                className="h-full rounded-full relative"
                                style={{ 
                                    background: i % 2 === 0 ? 'var(--brand-red)' : '#1A1D23',
                                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default BestSellerChart
