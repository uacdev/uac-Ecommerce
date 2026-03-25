import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { StatusPill } from '../ui/shared_ui'

const OrderInfoModal = ({ order, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-12 max-w-2xl w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-10 top-10 text-[var(--text-muted)] hover:text-[#ed0000] p-1.5 rounded-full transition-all hover:bg-[var(--bg-secondary)]"><X size={28} /></button>
            <h3 className="text-3xl font-bold mb-12 text-[var(--text-primary)] tracking-tight">Order breakdown</h3>
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Payer Identity</p>
                        <p className="font-bold text-xl text-[var(--text-primary)] tracking-tight">{order.buyerName}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Reference</p>
                        <p className="font-bold text-lg text-[var(--text-muted)] tracking-tight">{order.buyerPhone}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] mb-2">Delivery target</p>
                        <p className="font-bold text-[var(--text-muted)] text-[14px] leading-relaxed">{order.buyerAddress}</p>
                    </div>
                </div>
                <div className="space-y-8 text-right flex flex-col items-end">
                    <div className="p-10 bg-red-50 dark:bg-red-950/20 text-[#ed0000] rounded-3xl border border-red-100 dark:border-red-900/30 shadow-2xl shadow-red-100 dark:shadow-none w-full text-center">
                         <p className="text-[11px] font-bold uppercase text-[#ed0000]/60 mb-3 tracking-widest leading-none">Net Total Amount</p>
                         <h4 className="text-5xl font-bold tracking-tighter">₦{order.amount.toLocaleString()}</h4>
                    </div>
                    <div className="pt-4"><StatusPill status={order.status} /></div>
                </div>
            </div>
        </motion.div>
    </motion.div>
)

export default OrderInfoModal
