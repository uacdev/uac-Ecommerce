import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const KpiCard = ({ title, value, trend, isPositive, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="group relative overflow-hidden flex flex-col p-6 rounded-xl transition-all duration-300 bg-[var(--bg-tertiary)] border border-[var(--divider)] shadow-sm"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 opacity-100" />
            <p className="text-[13px] font-medium text-[var(--text-muted)] mb-4">{title}</p>
            
            <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-3xl font-medium tracking-tight text-[var(--text-primary)]">
                    {value}
                </h3>
            </div>

            <div className="mt-auto flex items-center gap-2">
                <div className={`flex items-center gap-1 text-[11px] font-bold ${
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                }`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {trend}
                </div>
                <span className="text-[11px] font-medium text-[var(--text-muted)]">This month</span>
            </div>
        </motion.div>
    )
}

export default KpiCard
