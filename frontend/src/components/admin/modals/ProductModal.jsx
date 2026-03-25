import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SettingInput } from '../ui/shared_ui'

const ProductModal = ({ product, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-lg w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)] hover:text-[#ed0000] transition-all"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-10 tracking-tight text-[var(--text-primary)]">{product ? 'Modify product entry' : 'New digital entry'}</h3>
            <div className="space-y-6">
                <SettingInput label="Product name" value={product?.name || ''} />
                <div className="grid grid-cols-2 gap-6">
                    <SettingInput label="Category" value={product?.category || ''} />
                    <SettingInput label="Retail price (₦)" value={product?.price || ''} />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Description</label>
                    <textarea 
                        placeholder="Tell us about the entry..." 
                        className="w-full bg-[var(--bg-secondary)] border border-transparent rounded-2xl px-6 py-4 text-[13px] font-bold min-h-[140px] outline-none shadow-sm focus:border-[#ed0000]/30 transition-all text-[var(--text-primary)]" 
                    />
                </div>
                <button className="w-full bg-[#ed0000] text-white py-4.5 rounded-2xl font-bold text-[14px] shadow-2xl shadow-red-200 hover:bg-red-700 transition-all">
                    {product ? 'Update digital entry' : 'Publish entry'}
                </button>
            </div>
        </motion.div>
    </motion.div>
)

export default ProductModal
